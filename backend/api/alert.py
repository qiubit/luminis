import time
from pycnic.core import Handler
from pycnic.utils import requires_validation
from voluptuous import Schema, Required, Or, Email

from database.model import Session, Entity, SeriesAttribute, Alert
from database.helpers import get_all, get_one, update_last_data_modification_ts


class AlertHandler(Handler):
    def __init__(self):
        self.session = Session()

    def get(self, ident=None):
        if ident is None:
            return [alert.to_dict() for alert in get_all(self.session, Alert)]
        else:
            return get_one(self.session, Alert, id=ident).to_dict()

    @requires_validation(Schema({
        Required('entity_id'): int,
        Required('series_id'): int,
        Required('alert_predicate_type'): Or('data_delay', 'value_too_low', 'value_too_high'),
        Required('value'): float,
        Required('is_enabled'): bool,
        Required('alert_recipient_email'): Email,
    }))
    def post(self):
        data = self.request.data
        entity = get_one(self.session, Entity, id=data['entity_id'])
        series = get_one(self.session, SeriesAttribute, id=data['series_id'])
        alert = Alert(entity=entity, series=series, alert_predicate_type=data['alert_predicate_type'],
                      value=data['value'], is_enabled=data['is_enabled'],
                      alert_recipient_email=data['alert_recipient_email'])
        self.session.add(alert)

        self.session.commit()
        return {
            'success': True,
            'ID': alert.id
        }

    @requires_validation(Schema({
        'entity_id': int,
        'series_id': int,
        'alert_predicate_type': Or('data_delay', 'value_too_low', 'value_too_high'),
        'value': float,
        'is_enabled': bool,
        'alert_recipient_email': Email,
    }))
    def put(self, ident):
        data = self.request.data
        alert = get_one(self.session, Alert, id=ident)
        if 'entity_id' in data:
            entity = get_one(self.session, Entity, id=data['entity_id'])
            alert.entity_id_fk = entity.id
        if 'series_id' in data:
            series = get_one(self.session, SeriesAttribute, id=data['series_id'])
            alert.series_id_fk = series.id
        if 'alert_predicate_type' in data:
            alert.alert_predicate_type = data['alert_predicate_type']
        if 'value' in data:
            alert.value = data['value']
        if 'is_enabled' in data:
            alert.is_enabled = data['is_enabled']
        if 'alert_recipient_email' in data:
            alert.alert_recipient_email = data['alert_recipient_email']
        # reset last check status
        alert.last_check_status = None
        self.session.commit()
        return {
            'success': True,
            'ID': alert.id,
        }

    def delete(self, ident):
        alert = get_one(self.session, Alert, id=ident)
        now = time.time()
        alert.delete_ts = now

        self.session.commit()
        update_last_data_modification_ts(self.session)
        return {'success': True}
