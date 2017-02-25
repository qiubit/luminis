import time
from pycnic.core import Handler
from pycnic.utils import requires_validation
from voluptuous import Schema, Required, And, Unique

from .validators import non_empty_string, lowercase_or_underscores
from database.model import EntityType, Session, TagAttribute, SeriesAttribute, MetaAttribute
from database.helpers import get_all, get_one


class EntityTypeHandler(Handler):

    def __init__(self):
        self.session = Session()

    def get(self, ident=None):
        if ident is None:
            return [entity_type.to_dict() for entity_type in get_all(self.session, EntityType)]
        else:
            return get_one(self.session, EntityType, id=ident).to_dict()

    @requires_validation(Schema({
        Required('name'): non_empty_string,
        Required('tags'): And([non_empty_string], Unique()),
        Required('meta'): And([non_empty_string], Unique()),
        Required('series'): And([lowercase_or_underscores], Unique()),
    }))
    def post(self):
        data = self.request.data
        entity_type = EntityType(name=data['name'])
        self.session.add(entity_type)

        # add tags, meta and series
        for tag in data['tags']:
            self.session.add(TagAttribute(
                entity_type=entity_type,
                name=tag,
            ))
        for meta in data['meta']:
            self.session.add(MetaAttribute(
                entity_type=entity_type,
                name=meta,
            ))
        for series in data['series']:
            self.session.add(SeriesAttribute(
                entity_type=entity_type,
                name=series,
            ))

        self.session.commit()
        return {
            'success': True,
            'ID': entity_type.id,
        }

    @staticmethod
    def _assert_objects_were_not_created(data, entity_type_id):
        session = Session()
        existing_objects = {
            'tags': [tag.name for tag in get_all(session, TagAttribute, entity_type_id_fk=entity_type_id)],
            'meta': [meta.name for meta in get_all(session, MetaAttribute, entity_type_id_fk=entity_type_id)],
            'series': [series.name for series in get_all(session, SeriesAttribute, entity_type_id_fk=entity_type_id)]
        }
        for object_type in ('tags', 'meta', 'series'):
            for obj in data[object_type]:
                if obj in existing_objects[object_type]:
                    raise ValueError('{} is in existing {}'.format(obj, object_type))

    @requires_validation(_assert_objects_were_not_created, with_route_params=True)
    @requires_validation(Schema({
        'name': non_empty_string,
        'tags': And([non_empty_string], Unique()),
        'meta': And([non_empty_string], Unique()),
        'series': And([non_empty_string], Unique()),
    }))
    def put(self, ident):
        data = self.request.data
        entity_type = get_one(self.session, EntityType, id=ident)
        if 'name' in data:
            entity_type.name = data['name']

        # add tags, meta and series
        if 'tags' in data:
            for tag in data['tags']:
                self.session.add(TagAttribute(
                    entity_type=entity_type,
                    name=tag,
                ))
        if 'meta' in data:
            for meta in data['meta']:
                self.session.add(MetaAttribute(
                    entity_type=entity_type,
                    name=meta,
                ))
        if 'series' in data:
            for series in data['series']:
                self.session.add(SeriesAttribute(
                    entity_type=entity_type,
                    name=series,
                ))

        self.session.commit()
        return {'success': True}

    def delete(self, ident):
        entity_type = get_one(self.session, EntityType, id=ident)
        now = time.time()
        entity_type.delete_ts = now
        for tag in entity_type.tags:
            tag.delete_ts = now
        for series in entity_type.series:
            series.delete_ts = now
        for meta in entity_type.meta:
            meta.delete_ts = now

        self.session.commit()
        return {'success': True}
