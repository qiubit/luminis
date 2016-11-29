import sys
import json
import influxdb

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from test_bazy import EntityTag


class StreamInput:

    def __init__(self, data_source, data_parser):
        self.data_source = data_source
        self.data_parser = data_parser

    def __iter__(self):
        self.data_source_iterator = iter(self.data_source)
        self.parsed_data_iterator = iter([])
        return self

    def __next__(self):
        try:
            return next(self.parsed_data_iterator)
        except StopIteration:
            self.parsed_data_iterator = self.data_parser.parse(next(self.data_source_iterator))
            return next(self.parsed_data_iterator)


class DataSource:

    def __init__(self, data):
        self.data = data
    def __iter__(self):
        return iter([self.data])


class DataParser:

    def parse(self, data):
        return iter(json.loads(data))


class InputDataExtractor:

    def __init__(self, measurement_name):
        self.measurement_name = measurement_name

    def getID(self, point):
        return point['id']

    def getTime(self, point):
        return point['timestamp']

    def getSeries(self, point):
        point_copy = dict(point)
        point_copy.pop('id')
        point_copy.pop('timestamp')
        return point_copy

    def getMeasurementName(self):
        return self.measurement_name

class DatabaseDataExtractor:

    def __init__(self, engine):
        self.engine = engine
        Session = sessionmaker(bind=engine)
        Session = sessionmaker()
        Session.configure(bind=engine)
        self.session = Session()

    def getTagDict(self, ids):
        tag_dict = dict()
        for row in [row._asdict() for row in self.session.query(\
                                            EntityTag.entity_id, EntityTag.tag_id, EntityTag.value)\
                                            .filter(EntityTag.entity_id.in_(list(ids)))]:
            row_id = row['entity_id']
            if row_id not in tag_dict:
                tag_dict[row_id] = dict()
                tag_dict[row_id]['entity_id'] = row_id

            tag_dict[row_id][row['tag_id']] = row['value']

        return tag_dict

    def close(self):
        pass


class InfluxWriterStdout:

    def write(self, points):
        for point in points:
            print(point)

    def close(self):
        pass


class InfluxWriteException(BaseException):
    pass


class InfluxWriter:

    def __init__(self, host, port, username, password, database_name):
        self.client = influxdb.InfluxDBClient(host, port, username, password, database_name)

    def write(self, points):
        if not self.client.write_points(points, time_precision='s'):
            raise InfluxWriteException('Cannot write to Influx database')

    def close(self):
        pass


class BufferPolicy:

    def __init__(self, buffer_size):
        self.buffer_size = buffer_size
        self.buffer = []

    def putData(self, data):
        self.buffer.append(data)

    def ready(self):
        return len(self.buffer) >= self.buffer_size

    def getData(self):
        return self.buffer

    def clean(self):
        self.buffer = []




class OutputStream:

    def __init__(self, buffer_policy, input_data_extractor, database_data_extractor, influx_writer):
        self.buffer_policy = buffer_policy
        self.input_data_extractor = input_data_extractor
        self.database_data_extractor = database_data_extractor
        self.influx_writer = influx_writer


    def send(self, point):
        self.buffer_policy.putData(point)
        if not self.buffer_policy.ready():
            return

        self._send()

    def close(self):
        self._send()
        self.database_data_extractor.close()
        self.influx_writer.close()

    def _send(self):
        try:
            points = self.buffer_policy.getData()
            influx_points = self.getInfluxPoints(points)
            self.influx_writer.write(influx_points)
        except Exception:
            # what else can I do?
            print('Failed when processing points:')
            print(self.buffer_policy.getData())

        self.buffer_policy.clean()



    def getInfluxPoints(self, points):
        ids = set()
        for point in points:
            ids.add(self.input_data_extractor.getID(point))

        tag_dict = self.database_data_extractor.getTagDict(ids)

        return [self.getInfluxPoint(point, tag_dict) for point in points]


    def getInfluxPoint(self, point, tag_dict):
        influx_point = dict()
        influx_point['measurement'] = self.input_data_extractor.getMeasurementName()
        influx_point['time'] = self.input_data_extractor.getTime(point)
        influx_point['fields'] = self.input_data_extractor.getSeries(point)
        influx_point['tags'] = tag_dict[self.input_data_extractor.getID(point)]
        return influx_point
