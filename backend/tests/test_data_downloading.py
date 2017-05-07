#
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

import unittest
from unittest.mock import mock_open, patch

from database.telegraf import PointGenerator
from sensors.parser import FileParser
from .test_utils import mocked_get_one, MockedEntity

PARSE_FILE_CONTENTS = """2016-01-01 12:00:00.123456,1015.1,1.0
2016-01-02 18:30:13.543321,44.38,10.0"""


@patch('sensors.parser.open', new=mock_open(read_data=PARSE_FILE_CONTENTS))
@patch('sensors.parser.get_one', new=mocked_get_one)
class TestDataDownloading(unittest.TestCase):

    def test_file_parsing(self):
        result = FileParser(1, 'foo').get_values()

        self.assertEqual([{'timestamp': '2016-01-01T12:00:00Z', 'measurements': [('s1', 1015.1), ('s2', 1.0)]},
                          {'timestamp': '2016-01-02T18:30:13Z', 'measurements': [('s1', 44.38), ('s2', 10.0)]}], result)

    def test_point_generating(self):
        result = PointGenerator(MockedEntity(), FileParser(1, 'foo')).generate_points()

        self.assertEqual([
            {'tags': {'id': 1, 'tag_name': 'tag_val'}, 'measurement': 's1',
             'fields': {'value': 1015.1}, 'time': '2016-01-01T12:00:00Z'},
            {'tags': {'id': 1, 'tag_name': 'tag_val'}, 'measurement': 's2',
             'fields': {'value': 1.0}, 'time': '2016-01-01T12:00:00Z'},
            {'tags': {'id': 1, 'tag_name': 'tag_val'}, 'measurement': 's1',
             'fields': {'value': 44.38}, 'time': '2016-01-02T18:30:13Z'},
            {'tags': {'id': 1, 'tag_name': 'tag_val'}, 'measurement': 's2',
             'fields': {'value': 10.0}, 'time': '2016-01-02T18:30:13Z'},
        ], result)
