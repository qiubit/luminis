import time
from pycnic.core import Handler
from pycnic.utils import requires_validation
from voluptuous import Schema, Required, Or

from .validators import non_empty_string
from database.model import Session, SeriesAttribute, EntityType
from database.helpers import get_all, get_one


class SeriesAttributeHandler(Handler):
    def __init__(self):
        self.session = Session()

    def get(self, entity_type_id, ident=None):
        entity_type = get_one(self.session, EntityType, id=entity_type_id)
        if ident is None:
            return [series.to_dict() for series in get_all(self.session, SeriesAttribute, entity_type=entity_type)]
        else:
            return get_one(self.session, SeriesAttribute, entity_type=entity_type, id=ident).to_dict()

    @staticmethod
    def _assert_attribute_does_not_exist(data, entity_type_id):
        attributes = [m.name for m in get_all(Session(), SeriesAttribute, entity_type_id_fk=entity_type_id)]
        if 'name' in data:
            if data['name'] in attributes:
                raise ValueError("attribute {} exists for entity type {}".format(data['name'], entity_type_id))

    @requires_validation(_assert_attribute_does_not_exist, with_route_params=True)
    @requires_validation(Schema({
        Required('name'): non_empty_string,
        'type': Or('real', 'bool', 'enum'),
        'refresh_time': Or(int, None),
    }))
    def post(self, entity_type_id):
        data = self.request.data
        entity_type = get_one(self.session, EntityType, id=entity_type_id)
        series = SeriesAttribute(entity_type=entity_type, name=data['name'],
                                 type=data.get('type', 'real'), refresh_time=data.get('refresh_time'))
        self.session.add(series)

        self.session.commit()
        return {
            'success': True,
            'ID': series.id
        }

    def delete(self, entity_type_id, ident):
        entity_type = get_one(self.session, EntityType, id=entity_type_id)  # check if route is correct
        series = get_one(self.session, SeriesAttribute, entity_type=entity_type, id=ident)
        series.delete_ts = time.time()

        self.session.commit()
        return {'success': True}
