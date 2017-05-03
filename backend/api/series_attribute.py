import time
from pycnic.core import Handler
from pycnic.utils import requires_validation
from voluptuous import Schema, Required, Or

from .validators import non_empty_string, assert_attribute_does_not_exist
from database.model import Session, SeriesAttribute, EntityType
from database.helpers import get_all, get_one, update_last_data_modification_ts


class SeriesAttributeHandler(Handler):
    def __init__(self):
        self.session = Session()

    def get(self, entity_type_id, ident=None):
        entity_type = get_one(self.session, EntityType, id=entity_type_id)
        if ident is None:
            return [series.to_dict() for series in get_all(self.session, SeriesAttribute, entity_type=entity_type)]
        else:
            return get_one(self.session, SeriesAttribute, entity_type=entity_type, id=ident).to_dict()

    @requires_validation(assert_attribute_does_not_exist(SeriesAttribute), with_route_params=True)
    @requires_validation(Schema({
        Required('name'): non_empty_string,
        'type': Or('real', 'enum'),
        'refresh_time': Or(int, None),
        'is_favourite': bool,
    }))
    def post(self, entity_type_id):
        data = self.request.data
        entity_type = get_one(self.session, EntityType, id=entity_type_id)
        series = SeriesAttribute(entity_type=entity_type, name=data['name'],
                                 type=data.get('type', 'real'), refresh_time=data.get('refresh_time'),
                                 is_favourite=data.get('is_favourite', False))
        self.session.add(series)

        self.session.commit()
        update_last_data_modification_ts(self.session)
        return {
            'success': True,
            'ID': series.id
        }

    @requires_validation(Schema({
        'refresh_time': Or(int, None),
        'is_favourite': bool,
    }))
    def put(self, entity_type_id, ident):
        data = self.request.data
        entity_type = get_one(self.session, EntityType, id=entity_type_id)
        series = get_one(self.session, SeriesAttribute, entity_type=entity_type, id=ident)
        if 'refresh_time' in data:
            series.refresh_time = data['refresh_time']
        if 'is_favourite' in data:
            series.is_favourite = data['is_favourite']

        self.session.commit()
        update_last_data_modification_ts(self.session)
        return {
            'success': True,
            'ID': series.id
        }

    def delete(self, entity_type_id, ident):
        now = time.time()
        entity_type = get_one(self.session, EntityType, id=entity_type_id)  # check if route is correct
        series = get_one(self.session, SeriesAttribute, entity_type=entity_type, id=ident)
        series.delete_ts = now
        for alert in series.alerts:
            alert.delete_ts = now

        self.session.commit()
        update_last_data_modification_ts(self.session)
        return {'success': True}
