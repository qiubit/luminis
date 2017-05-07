from abc import ABC, abstractmethod

import time
from typing import Dict, Any
from typing import Optional

from voluptuous import Schema, Required, Or

from database.helpers import get_one
from database.influx_selector import InfluxReader
from database.model import SeriesAttribute, Session, Entity
from websocket.arithmetic import create_measurement_handler
from websocket.utils import AttributeDict


class AbstractRequestHandler(ABC):

    def __init__(self, request_id: int, payload: dict):
        self._validate_payload(payload)
        self._request_id = request_id
        self._raw_payload = AttributeDict(payload)
        self._to_be_removed = False

    @abstractmethod
    def _validate_payload(self, payload: dict):
        pass

    @abstractmethod
    def _run_assertions(self):
        pass

    @property
    @abstractmethod
    def request_type(self) -> str:
        pass

    @property
    def request_id(self) -> int:
        return self._request_id

    @property
    def to_be_removed(self) -> bool:
        return self._to_be_removed

    @abstractmethod
    def _handle_request(self) -> Optional[Dict[str, Any]]:
        pass

    def remove(self):
        self._to_be_removed = True

    def __call__(self) -> Optional[Dict[str, Any]]:
        data = self._handle_request() if not self.to_be_removed else None
        if data is not None:
            return {
                'request_id': self.request_id,
                'type': self.request_type,
                'data': data,
            }
        else:
            return None


class NewChartRequestHandler(AbstractRequestHandler):

    SCHEMA = Schema({
        Required('node_id'): int,
        Required('begin_ts'): int,
        Required('requested_data'): [dict],
        Required('end_ts'): int,
        Required('update_data'): bool,
        Required('aggregation_length'): int,
        Required('aggregation_type'): Or('mean', 'max', 'min'),
    })

    def __init__(self, request_id: int, payload: dict):
        super().__init__(request_id, payload)
        session = Session()
        self._entity = get_one(session, Entity, id=self._raw_payload.node_id, exception_cls=ValueError)
        self._requested_data = [create_measurement_handler(self._raw_payload.node_id,
                                                           self._raw_payload.aggregation_length,
                                                           self._raw_payload.aggregation_type,
                                                           data) for data in self._raw_payload.requested_data]
        self._run_assertions()

    @property
    def request_type(self) -> str:
        return 'new_chart'

    def _validate_payload(self, payload: dict):
        self.SCHEMA(payload)

    def _run_assertions(self):
        measurements_for_entity = [s.id for s in self._entity.entity_type.series]
        measurements_in_data = set()
        for handler in self._requested_data:
            measurements_in_data |= handler.measurements()
        for measurement in measurements_in_data:
            if measurement.id not in measurements_for_entity:
                raise ValueError('Requested entity does not support requested measurement')

    def _handle_request(self) -> Optional[Dict[str, Any]]:
        begin_ts = self._raw_payload.begin_ts
        end_ts = self._raw_payload.end_ts

        # update begin_ts and end_ts to new values
        now = int(time.time())
        self._raw_payload.begin_ts = begin_ts + (now - end_ts)
        self._raw_payload.end_ts = now
        results = dict()
        for i in range(len(self._requested_data)):
            for ts, val in self._requested_data[i].evaluate(begin_ts, end_ts):
                if ts in results:
                    results[ts][i] = val
                else:
                    results[ts] = dict({i: val})

        if not self._raw_payload.update_data:
            self.remove()
        return {
            'plot_data': sorted([[ts] + [results[ts].get(i) for i in range(len(self._requested_data))]
                                 for ts in results])
        }


class NewLiveDataRequestHandler(AbstractRequestHandler):

    SCHEMA = Schema({
        Required('node_id'): int,
        Required('measurement_id'): int,
    })

    def __init__(self, request_id: int, payload: dict):
        super().__init__(request_id, payload)
        self._last_data_timestamp = 0
        session = Session()
        self._measurement = get_one(session, SeriesAttribute, id=self._raw_payload.measurement_id,
                                    exception_cls=ValueError)
        self._entity = get_one(session, Entity, id=self._raw_payload.node_id, exception_cls=ValueError)
        self._run_assertions()

    def _validate_payload(self, payload: dict):
        self.SCHEMA(payload)

    def _run_assertions(self):
        if self._measurement not in self._entity.entity_type.series:
            raise ValueError('Requested entity does not support requested measurement')

    @property
    def request_type(self) -> str:
        return 'new_live_data'

    def _handle_request(self) -> Optional[Dict[str, Any]]:
        reader = InfluxReader()
        result = reader.query(measurement=self._measurement.name,
                              attributes=('value',),
                              constraints=(('id', '\'' + str(self._entity.id) + '\''),
                                           ('time', '>=', str(self._last_data_timestamp) + 's')),
                              only_newest=True,
                              apply_cols=True,
                              date_specifier='s')
        if result:
            self._last_data_timestamp = int(result[0]['time'])
            return {
                'value': self._measurement.transform(result[0]['value']),
                'timestamp': self._last_data_timestamp,
            }
        else:
            return None
