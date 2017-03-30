import time
from pycnic.core import Handler

from database.model import Session, MetaAttribute, EntityType, EntityMeta
from database.helpers import get_all, get_one


class MetaAttributeHandler(Handler):
    def __init__(self):
        self.session = Session()

    def get(self, entity_type_id, ident=None):
        entity_type = get_one(self.session, EntityType, id=entity_type_id)
        if ident is None:
            return [meta.to_dict() for meta in get_all(self.session, MetaAttribute, entity_type=entity_type)]
        else:
            return get_one(self.session, MetaAttribute, entity_type=entity_type, id=ident).to_dict()

    def post(self, entity_type_id):
        data = self.request.data
        entity_type = get_one(self.session, EntityType, id=entity_type_id)
        meta = MetaAttribute(entity_type=entity_type, name=data['name'])
        self.session.add(meta)

        self.session.commit()
        return {
            'success': True,
            'ID': meta.id
        }

    def put(self, entity_type_id, ident):
        data = self.request.data
        entity_type = get_one(self.session, EntityType, id=entity_type_id)  # check if route is correct
        meta = get_one(self.session, MetaAttribute, entity_type=entity_type, id=ident)

        if 'name' in data:
            meta.name = data['name']

        self.session.commit()
        return {
            'success': True,
            'ID': meta.id,
        }

    def delete(self, entity_type_id, ident):
        entity_type = get_one(self.session, EntityType, id=entity_type_id)  # check if route is correct
        meta = get_one(self.session, MetaAttribute, entity_type=entity_type, id=ident)
        now = time.time()
        meta.delete_ts = now
        for entity_meta in get_all(self.session, EntityMeta, attribute=meta):
            entity_meta.delete_ts = now

        self.session.commit()
        return {'success': True}
