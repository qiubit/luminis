#
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

import unittest
from unittest.mock import patch

from .test_utils import mocked_get_one
from websocket.arithmetic import create_measurement_handler, MeasurementIdType, UnaryMeasurementType, BinaryMeasurementType

DEFAULT_ENTITY_ID = 1
DEFAULT_AGGREGATION_LENGTH = 60
DEFAULT_AGGREGATION_TYPE = 'mean'


@patch('websocket.arithmetic.InfluxReader.query', return_value=[{'time': 100000, 'value': 0.5},
                                                                {'time': 100001, 'value': None}])
@patch('websocket.arithmetic.get_one', new=mocked_get_one)
class TestArithmeticTypeEvaluation(unittest.TestCase):

    def test_create_measurement_handler_returns_proper_handler_types(self, query_patch):
        handler = create_measurement_handler(DEFAULT_ENTITY_ID, DEFAULT_AGGREGATION_LENGTH, DEFAULT_AGGREGATION_TYPE,
                                             {'measurement_id': 17})
        self.assertTrue(isinstance(handler, MeasurementIdType))

        handler = create_measurement_handler(DEFAULT_ENTITY_ID, DEFAULT_AGGREGATION_LENGTH, DEFAULT_AGGREGATION_TYPE,
                                             {'unary_operator': 'minus', 'arg': {'measurement_id': 17}})
        self.assertTrue(isinstance(handler, UnaryMeasurementType))
        self.assertTrue(isinstance(handler._child, MeasurementIdType))

        handler = create_measurement_handler(DEFAULT_ENTITY_ID, DEFAULT_AGGREGATION_LENGTH, DEFAULT_AGGREGATION_TYPE,
                                             {'binary_operator': 'add', 'arg1': {'measurement_id': 17}, 
                                              'arg2': {'unary_operator': 'minus', 'arg': {'measurement_id': 12}}})
        self.assertTrue(isinstance(handler, BinaryMeasurementType))
        self.assertTrue(isinstance(handler._child1, MeasurementIdType))
        self.assertTrue(isinstance(handler._child2, UnaryMeasurementType))
        self.assertEqual(handler._operator(3, 5), 8)

    def test_measurement_id_returns_proper_data(self, query_patch):
        handler = create_measurement_handler(DEFAULT_ENTITY_ID, DEFAULT_AGGREGATION_LENGTH, DEFAULT_AGGREGATION_TYPE,
                                             {'measurement_id': 17})
        
        self.assertEqual(handler.evaluate(1, 10), [(100000, 0.5), (100001, None)])
        self.assertEqual(query_patch.call_count, 1)

    def test_unary_measurement_type_returns_proper_data(self, query_patch):
        handler = create_measurement_handler(DEFAULT_ENTITY_ID, DEFAULT_AGGREGATION_LENGTH, DEFAULT_AGGREGATION_TYPE,
                                             {'unary_operator': 'minus', 'arg': {'measurement_id': 17}})

        self.assertEqual(handler.evaluate(1, 10), [(100000, -0.5), (100001, None)])
        self.assertEqual(query_patch.call_count, 1)

    def test_binary_measurement_type_add_returns_proper_data(self, query_patch):
        handler = create_measurement_handler(DEFAULT_ENTITY_ID, DEFAULT_AGGREGATION_LENGTH, DEFAULT_AGGREGATION_TYPE,
                                             {'binary_operator': 'add', 'arg1': {'measurement_id': 17}, 
                                              'arg2': {'measurement_id': 12}})

        self.assertEqual(handler.evaluate(1, 10), [(100000, 1), (100001, None)])
        self.assertEqual(query_patch.call_count, 2)

    def test_binary_measurement_type_minus_returns_proper_data(self, query_patch):
        handler = create_measurement_handler(DEFAULT_ENTITY_ID, DEFAULT_AGGREGATION_LENGTH, DEFAULT_AGGREGATION_TYPE,
                                             {'binary_operator': 'minus', 'arg1': {'measurement_id': 17}, 
                                              'arg2': {'measurement_id': 12}})

        self.assertEqual(handler.evaluate(1, 10), [(100000, 0), (100001, None)])
        self.assertEqual(query_patch.call_count, 2)

    def test_binary_measurement_type_multiply_returns_proper_data(self, query_patch):
        handler = create_measurement_handler(DEFAULT_ENTITY_ID, DEFAULT_AGGREGATION_LENGTH, DEFAULT_AGGREGATION_TYPE,
                                             {'binary_operator': 'multiply', 'arg1': {'measurement_id': 17}, 
                                              'arg2': {'measurement_id': 12}})

        self.assertEqual(handler.evaluate(1, 10), [(100000, 0.25), (100001, None)])
        self.assertEqual(query_patch.call_count, 2)

    def test_binary_measurement_type_divide_returns_proper_data(self, query_patch):
        handler = create_measurement_handler(DEFAULT_ENTITY_ID, DEFAULT_AGGREGATION_LENGTH, DEFAULT_AGGREGATION_TYPE,
                                             {'binary_operator': 'divide', 'arg1': {'measurement_id': 17}, 
                                              'arg2': {'measurement_id': 12}})

        self.assertEqual(handler.evaluate(1, 10), [(100000, 1), (100001, None)])
        self.assertEqual(query_patch.call_count, 2)
