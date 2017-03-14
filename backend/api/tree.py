import time
from pycnic.core import Handler

from database.model import Entity, Session, EntityTag, EntityMeta, TagAttribute, MetaAttribute, EntityType
from .helpers import get_one, get_all


class EntityHandler(Handler):

    def __init__(self):
        self.session = Session()

    def get(self, ident):
        return get_one(self.session, Entity, id=ident).to_dict(deep=False)

    def post(self):
        data = self.request.data
        entity = Entity(
            entity_type=get_one(self.session, EntityType, id=data['entity_type_id']),
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

        return {
            'success': True,
            'ID': entity.id,
        }

    def put(self, ident):
        data = self.request.data
        get_one(self.session, Entity, id=ident)  # to ensure that the entity exists

        # add tags and meta
        for key in data:
            if 'tag_' in key:
                tag = get_one(self.session, EntityTag, entity_id_fk=ident, tag_id_fk=key.split('_')[1])
                tag.value = data[key]
            elif 'meta_' in key:
                meta = get_one(self.session, EntityMeta, entity_id_fk=ident, meta_id_fk=key.split('_')[1])
                meta.value = data[key]

        self.session.commit()
        return {'success': True}

    def delete(self, ident):
        entity = get_one(self.session, Entity, id=ident)
        now = time.time()
        entity.delete_ts = now
        for tag in entity.tags:
            tag.delete_ts = now
        for meta in entity.meta:
            meta.delete_ts = now
        for child in entity.children:
            child.parent = entity.parent

        self.session.commit()
        return {'success': True}


class TreeHandler(Handler):

    def __init__(self):
        self.session = Session()

    def get(self, ident=None):
        if ident:
            return get_one(self.session, Entity, id=ident).to_dict(deep=True)
        else:
            return [root.to_dict(deep=True)
                    for root in get_all(self.session, Entity) if root.parent is None]
