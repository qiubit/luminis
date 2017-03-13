from abc import ABC, abstractmethod
from typing import Set, List, Tuple, Callable

from database.helpers import get_one
from database.influx_selector import InfluxReader
from database.model import SeriesAttribute, Session

# as x or y can be None, those operators detect it and return None then
BINARY_OPERATOR = {
    'add': lambda x, y: x + y if x is not None and y is not None else None,
    'minus': lambda x, y: x - y if x is not None and y is not None else None,
    'multiply': lambda x, y: x * y if x is not None and y is not None else None,
    'divide': lambda x, y: x / y if x is not None and y is not None and y != 0 else None,
}


class MeasurementArithmeticType(ABC):

    def __init__(self, entity_id: int, aggregation_length: int, aggregation_type: str):
        self._aggregation_length = aggregation_length
        self._aggregation_type = aggregation_type
        self._entity_id = entity_id

    @abstractmethod
    def evaluate(self, start_ts: int, end_ts: int) -> List[Tuple[int, int]]:
        pass

    @property
    @abstractmethod
    def measurements(self) -> Set[SeriesAttribute]:
        pass


class MeasurementIdType(MeasurementArithmeticType):

    def __init__(self, entity_id: int, aggregation_length: int, aggregation_type: str, measurement_id: int):
        super().__init__(entity_id, aggregation_length, aggregation_type)
        self._measurement_id = measurement_id
        self._measurement = get_one(Session(), SeriesAttribute, id=measurement_id)

    def evaluate(self, start_ts: int, end_ts: int) -> List[Tuple[int, int]]:
        reader = InfluxReader()
        result = reader.query(measurement=self._measurement.name,
                              attributes=('{}(value) as value'.format(self._aggregation_type)),
                              constraints=(('id', '\'' + str(self._entity_id) + '\''),
                                           ('time', '>=', str(start_ts) + 's'),
                                           ('time', '<=', str(end_ts) + 's')),
                              group_by=('time({}s)'.format(self._aggregation_length),),
                              apply_cols=True,
                              date_specifier='s')
        return [(r['time'], r['value']) for r in result]

    def measurements(self) -> Set[SeriesAttribute]:
        return {self._measurement}


class UnaryMeasurementType(MeasurementArithmeticType):

    def __init__(self, entity_id: int, aggregation_length: int, aggregation_type: str,
                 child: MeasurementArithmeticType):
        super().__init__(entity_id, aggregation_length, aggregation_type)
        self._child = child

    def evaluate(self, start_ts: int, end_ts: int) -> List[Tuple[int, int]]:
        return [(xy[0], BINARY_OPERATOR['minus'](0, xy[1])) for xy in self._child.evaluate(start_ts, end_ts)]

    def measurements(self) -> Set[SeriesAttribute]:
        return self._child.measurements


class BinaryMeasurementType(MeasurementArithmeticType):

    def __init__(self, entity_id: int, aggregation_length: int, aggregation_type: str,
                 child1: MeasurementArithmeticType, child2: MeasurementArithmeticType,
                 operator: Callable[[int, int], int]):
        super().__init__(entity_id, aggregation_length, aggregation_type)
        self._child1 = child1
        self._child2 = child2
        self._operator = operator

    def evaluate(self, start_ts: int, end_ts: int) -> List[Tuple[int, int]]:
        results_child1 = dict(self._child1.evaluate(start_ts, end_ts))
        results_child2 = dict(self._child2.evaluate(start_ts, end_ts))
        results = []
        for result_key in sorted(results_child1.keys()):
            results.append((result_key, self._operator(results_child1[result_key], results_child2[result_key])))

        return results

    def measurements(self) -> Set[SeriesAttribute]:
        return self._child1.measurements | self._child2.measurements


def create_measurement_handler(entity_id: int, aggregation_length: int, aggregation_type: str,
                               data: dict) -> MeasurementArithmeticType:
    if 'measurement_id' in data:
        return MeasurementIdType(entity_id, aggregation_length, aggregation_type, data['measurement_id'])
    elif 'arg' in data:
        return UnaryMeasurementType(entity_id, aggregation_length, aggregation_type,
                                    create_measurement_handler(entity_id, aggregation_length, aggregation_type,
                                                               data['arg']))
    elif 'arg1' in data and 'arg2' in data and data.get('binary_operator') in BINARY_OPERATOR:
        return BinaryMeasurementType(entity_id, aggregation_length, aggregation_type,
                                     create_measurement_handler(entity_id, aggregation_length, aggregation_type,
                                                                data['arg1']),
                                     create_measurement_handler(entity_id, aggregation_length, aggregation_type,
                                                                data['arg2']),
                                     BINARY_OPERATOR[data['binary_operator']])
    else:
        raise ValueError('Invalid requested data')
