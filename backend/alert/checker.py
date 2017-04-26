import time
from typing import Callable, Iterable, Any

from alert.sendmail import send_mail
from database.influx_selector import InfluxReader
from database.model import Alert, Session
from database.helpers import get_all


class AlertStatus(object):
    STATUS_TEMPLATES = {
        'OK': 'Series {} of entity {} is OK',
        'DELAY': 'Delay for series {} of entity {} too high ({} > {})',
        'VALUE_TOO_LOW': 'Value for series {} of entity {} too low ({} < {})',
        'VALUE_TOO_HIGH': 'Value for series {} of entity {} too high ({} > {})',
        'NO_DATA': 'No data for series {} of entity {}',
    }

    def __init__(self, entity_id, series_id, status, value=None, expected=None):
        self._entity_id = entity_id
        self._series_id = series_id
        self._status = status
        self._value = value
        self._expected = expected

    def __bool__(self):
        return self._status == 'OK'

    def __str__(self):
        return self.STATUS_TEMPLATES[self._status].format(self._series_id, self._entity_id, self._value, self._expected)


def check_alert(alert: Alert) -> AlertStatus:
    """Check if alert should be raised.
    
    :param alert: Alert database instance
    :return: AlertStatus object
    """
    now = int(time.time())
    reader = InfluxReader()
    result = reader.query(measurement=alert.series.name,
                          attributes=('value',),
                          constraints=(('id', '\'' + str(alert.entity.id) + '\''),),
                          only_newest=True,
                          apply_cols=True,
                          date_specifier='s')
    if not result:
        return AlertStatus(alert.entity.id, alert.series.id, 'NO_DATA')
    if alert.alert_predicate_type == 'data_delay':
        if now - int(result[0]['time']) > alert.value:
            return AlertStatus(alert.entity.id, alert.series.id, 'DELAY', now - int(result[0]['time']), alert.value)
    elif alert.alert_predicate_type == 'value_too_low':
        if result[0]['value'] < alert.value:
            return AlertStatus(alert.entity.id, alert.series.id, 'VALUE_TOO_LOW', result[0]['value'], alert.value)
    elif alert.alert_predicate_type == 'value_too_high':
        if result[0]['value'] > alert.value:
            return AlertStatus(alert.entity.id, alert.series.id, 'VALUE_TOO_HIGH', result[0]['value'], alert.value)
    else:
        raise ValueError('Unknown predicate type')

    return AlertStatus(alert.entity.id, alert.series.id, 'OK')


def check_all_alerts(on_state_change: Iterable[Callable[[Alert, str], Any]]) -> None:
    session = Session()
    for alert in get_all(session, Alert):
        if alert.is_enabled:
            status = check_alert(alert)
            if status and not alert.last_check_status:
                [callback(alert, str(status)) for callback in on_state_change]  # call all callbacks in on_state_change
                alert.last_check_status = True
            if alert.last_check_status is None or (not status and alert.last_check_status):
                [callback(alert, str(status)) for callback in on_state_change]
                alert.last_check_status = False

    session.commit()
    session.close()

if __name__ == '__main__':
    check_all_alerts([send_mail, lambda alert, msg: print(msg)])
