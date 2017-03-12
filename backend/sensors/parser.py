import re
from typing import Iterable

from database.helpers import get_one
from database.model import Session, Entity
from database.telegraf import PointSource


def convert_timestamp(timestamp):
    groups = re.match('(.*) (.*)\.(.*)', timestamp).groups()
    return '{}T{}Z'.format(groups[0], groups[1])


class FileParser(PointSource):
    def __init__(self, entity_id, filename):
        self._entity = get_one(Session(), Entity, id=entity_id)
        self._file = open(filename)

    def get_values(self) -> Iterable[dict]:
        result = []
        for line in self._file:
            fields = line.split(',')
            result.append({
                'timestamp': convert_timestamp(fields[0]),
                'measurements': [(s.name, value) for s, value in zip(self._entity.entity_type.series, fields[1:])]
            })
        return result
