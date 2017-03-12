import abc
import configparser
from typing import Iterable, List

import influxdb

from database.model import Entity


class InfluxWriteException(Exception):
    pass


class PointSource(abc.ABC):

    @abc.abstractmethod
    def get_values(self) -> Iterable[dict]:
        pass


class PointGenerator(object):
    def __init__(self, entity: Entity, source: PointSource):
        self._entity = entity
        self._source = source

    def generate_points(self) -> List[dict]:
        result = []
        for val in self._source.get_values():
            time = val['timestamp']
            measurements = val['measurements']
            for series, value in measurements:
                result.append({
                    'measurement': series,
                    'tags': {tag.attribute.name: tag.value for tag in self._entity.tags},
                    'time': time,
                    'fields': {'value': value},
                })
        return result


class AbstractInfluxWriter(abc.ABC):
    @abc.abstractmethod
    def write(self, points):
        pass

    @abc.abstractmethod
    def close(self):
        pass


class InfluxWriterStdout(AbstractInfluxWriter):

    def write(self, points):
        for point in points:
            print(point)

    def close(self):
        pass


class InfluxWriter(AbstractInfluxWriter):

    def __init__(self, config='config/database.ini'):
        conf = configparser.ConfigParser()
        conf.read(config)
        host = conf.get('influxdb', 'host')
        port = conf.get('influxdb', 'port')
        username = conf.get('influxdb', 'user')
        password = conf.get('influxdb', 'passwd')
        database = conf.get('influxdb', 'db_name')
        self.client = influxdb.InfluxDBClient(host, port, username, password, database)

    def write(self, points):
        if not self.client.write_points(points, time_precision='s'):
            raise InfluxWriteException('Cannot write to Influx database')

    def close(self):
        pass
