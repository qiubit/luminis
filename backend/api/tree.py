import time
from pycnic.core import Handler
from pycnic.errors import HTTP_400
from pycnic.utils import requires_validation
from voluptuous import Schema, Required, Or, ALLOW_EXTRA

from database.model import Entity, Session, EntityTag, EntityMeta, TagAttribute, MetaAttribute, EntityType, \
     SeriesAttribute
from database.helpers import get_all, get_one, update_last_data_modification_ts, get_last_data_modification_ts


class EntityHandler(Handler):

    def __init__(self):
        self.session = Session()

    def get(self, ident=None):
        if ident is None:
            return [entity.to_dict(deep=False) for entity in get_all(self.session, Entity)]
        else:
            return get_one(self.session, Entity, id=ident).to_dict(deep=False)

    @staticmethod
    def _assert_got_all_needed_tag_and_meta_ids(entity_type, tag_ids, meta_ids):
        expected_tag_ids = sorted(tag.id for tag in entity_type.tags if tag.delete_ts is None)
        expected_meta_ids = sorted(meta.id for meta in entity_type.meta if meta.delete_ts is None)
        if tag_ids != expected_tag_ids:
            raise HTTP_400('Expected tag IDs {}, got {}'.format(expected_tag_ids, tag_ids))
        if meta_ids != expected_meta_ids:
            raise HTTP_400('Expected meta IDs {}, got {}'.format(expected_meta_ids, meta_ids))

    @requires_validation(Schema({
        Required('parent_id'): Or(int, None),
        Required('entity_type_id'): int,
    }, extra=ALLOW_EXTRA))
    def post(self):
        data = self.request.data
        entity_type = get_one(self.session, EntityType, id=data['entity_type_id'])

        # check if we got all tags and meta
        tag_ids = sorted(int(key.split('_')[1]) for key in data if 'tag_' in key)
        meta_ids = sorted(int(key.split('_')[1]) for key in data if 'meta_' in key)
        self._assert_got_all_needed_tag_and_meta_ids(entity_type, tag_ids, meta_ids)

        entity = Entity(
            entity_type=entity_type,
            parent=None if data['parent_id'] is None else get_one(self.session, Entity, id=data['parent_id']),
        )
        self.session.add(entity)

        # add tags and meta
        for key in data:
            if 'tag_' in key:
                self.session.add(EntityTag(
                    entity=entity,
                    attribute=get_one(self.session, TagAttribute, id=int(key.split('_')[1])),
                    value=data[key],
                ))
            elif 'meta_' in key:
                self.session.add(EntityMeta(
                    entity=entity,
                    attribute=get_one(self.session, MetaAttribute, id=int(key.split('_')[1])),
                    value=data[key],
                ))

        self.session.commit()
        update_last_data_modification_ts(self.session)
        return {
            'success': True,
            'ID': entity.id,
        }

    def put(self, ident):
        data = self.request.data
        entity = get_one(self.session, Entity, id=ident)  # to ensure that the entity exists

        if 'parent_id' in data:
            get_one(self.session, Entity, id=data['parent_id'])
            entity.parent_id_fk = data['parent_id']

        # add tags and meta
        for key in data:
            if 'tag_' in key:
                tag = get_one(self.session, EntityTag, entity=entity, tag_id_fk=key.split('_')[1])
                tag.value = data[key]
            elif 'meta_' in key:
                meta = get_one(self.session, EntityMeta, entity=entity, meta_id_fk=key.split('_')[1])
                meta.value = data[key]

        self.session.commit()
        update_last_data_modification_ts(self.session)
        return {
            'success': True,
            'ID': entity.id,
        }

    def delete(self, ident):
        entity = get_one(self.session, Entity, id=ident)
        now = time.time()
        entity.delete_ts = now
        for tag in entity.tags:
            tag.delete_ts = now
        for meta in entity.meta:
            meta.delete_ts = now
        for alert in entity.alerts:
            alert.delete_ts = now
        for child in entity.children:
            child.parent = entity.parent

        self.session.commit()
        update_last_data_modification_ts(self.session)
        return {'success': True}


class TreeHandler(Handler):

    def __init__(self):
        self.session = Session()
        self._cached_tree = dict()
        self._update_cache()

    def _update_cache(self):
        mapped_measurements = {ser_attr.id: ser_attr.to_tree_dict()
                               for ser_attr in get_all(self.session, SeriesAttribute)}
        roots = [root for root in get_all(self.session, Entity) if root.parent is None]
        mapped_nodes = {}
        for root in roots:
            root.add_nodes_rec(mapped_nodes)
        self._cached_tree = {
            "tree_metadata": mapped_nodes,
            "tree": [root.tree_structure_dict() for root in roots],
            "measurements_metadata": mapped_measurements,
            "timestamp": get_last_data_modification_ts(self.session),
        }

    def get(self, ident=None):
        if ident:
            # TODO this data is also cached, we can retrieve it from there
            mapped_measurements = {ser_attr.id: ser_attr.to_tree_dict()
                                   for ser_attr in get_all(self.session, SeriesAttribute)}
            tree_model = get_one(self.session, Entity, id=ident)
            return {
                "tree_metadata": tree_model.map_nodes(),
                "tree": tree_model.tree_structure_dict(),
                "measurements_metadata": mapped_measurements,
                "timestamp": get_last_data_modification_ts(self.session),
            }
        else:
            last_update_ts = get_last_data_modification_ts(self.session)
            if last_update_ts > self._cached_tree['timestamp']:
                self._update_cache()

            return self._cached_tree
