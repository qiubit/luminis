import time
from pycnic.core import Handler
from pycnic.utils import requires_validation
from voluptuous import Schema, Required

from .validators import non_empty_string
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

    @staticmethod
    def _assert_attribute_does_not_exist(data, entity_type_id, attribute_id=None):
        attributes = [m.name for m in get_all(Session(), MetaAttribute, entity_type_id_fk=entity_type_id)
                      if m.id != attribute_id]
        if 'name' in data:
            if data['name'] in attributes:
                raise ValueError("attribute {} exists for entity type {}".format(data['name'], entity_type_id))

    @requires_validation(_assert_attribute_does_not_exist, with_route_params=True)
    @requires_validation(Schema({Required('name'): non_empty_string}))
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

    @requires_validation(_assert_attribute_does_not_exist, with_route_params=True)
    @requires_validation(Schema({'name': non_empty_string}))
    def put(self, entity_type_id, ident):
        data = self.request.data
        entity_type = get_one(self.session, EntityType, id=entity_type_id)  # check if route is correct
        meta = get_one(self.session, MetaAttribute, entity_type=entity_type, id=ident)

        if 'name' in data:
            meta.name = data['name']

        self.session.commit()
        return {'success': True}

    def delete(self, entity_type_id, ident):
        entity_type = get_one(self.session, EntityType, id=entity_type_id)  # check if route is correct
        meta = get_one(self.session, MetaAttribute, entity_type=entity_type, id=ident)
        now = time.time()
        meta.delete_ts = now
        for entity_meta in get_all(self.session, EntityMeta, attribute=meta):
            entity_meta.delete_ts = now

        self.session.commit()
        return {'success': True}
