import time
from pycnic.core import Handler

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
        return {
            'success': True,
            'ID': entity_type.id,
        }

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
