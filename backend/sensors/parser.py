#
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

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
        self._filename = filename

    def get_values(self) -> Iterable[dict]:
        result = []
        with open(self._filename) as file:
            lines = file.readlines()

        for line in lines:
            fields = line[:-1].split(',')
            result.append({
                'timestamp': convert_timestamp(fields[0]),
                'measurements': [(s.name, float(value)) for s, value in
                                 zip(sorted(self._entity.entity_type.series, key=lambda s: s.id),
                                     fields[1:])]
            })
        return result
