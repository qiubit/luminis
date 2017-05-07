#
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

import unittest
from unittest.mock import patch, MagicMock

from .test_utils import mocked_get_one
from websocket.arithmetic import MeasurementIdType
from websocket.handlers import NewChartRequestHandler, NewLiveDataRequestHandler

DEFAULT_NEW_CHART_REQUEST_PAYLOAD = {'node_id': 1, 'begin_ts': 2, 'requested_data': [{'measurement_id': 1}],
                                     'end_ts': 17, 'update_data': False, 'aggregation_length': 60,
                                     'aggregation_type': 'min'}

NEW_CHART_REQUEST_PAYLOAD_TWO_MEASUREMENTS = {'node_id': 1, 'begin_ts': 2,
                                              'requested_data': [{'measurement_id': 1}, {'measurement_id': 2}],
                                              'end_ts': 17, 'update_data': False, 'aggregation_length': 60,
                                              'aggregation_type': 'min'}

DEFAULT_NEW_LIVE_DATA_REQUEST_PAYLOAD = {'node_id': 3, 'measurement_id': 17}


def _updated(d, **kwargs):
    result = dict(d)
    for kwarg in kwargs:
        result[kwarg] = kwargs[kwarg]
    return result


@patch('websocket.handlers.NewChartRequestHandler._run_assertions')
@patch('websocket.arithmetic.get_one', new=mocked_get_one)
@patch('websocket.handlers.get_one', new=mocked_get_one)
class TestWebSocketNewChartRequestHandler(unittest.TestCase):

    def testHandlerProperCreation(self, assertions_mock):
        self.handler = NewChartRequestHandler(1, DEFAULT_NEW_CHART_REQUEST_PAYLOAD)
        self.assertTrue(isinstance(self.handler._requested_data[0], MeasurementIdType))
        assertions_mock.assert_called_once_with()

    def testHandlerProperProcessing(self, assertions_mock):
        self.handler = NewChartRequestHandler(1, DEFAULT_NEW_CHART_REQUEST_PAYLOAD)
        self.handler._requested_data[0].evaluate = MagicMock(return_value=[(1, 2), (3, 4)])
        result = self.handler()
        self.handler._requested_data[0].evaluate.assert_called_once_with(2, 17)
        self.assertEqual(result, {'request_id': 1, 'type': 'new_chart',
                                  'data': {'plot_data': [[1, 2], [3, 4]]}})

    def testHandlerProperProcessingOnMultipleRequestedData(self, assertions_mock):
        self.handler = NewChartRequestHandler(1, NEW_CHART_REQUEST_PAYLOAD_TWO_MEASUREMENTS)
        self.handler._requested_data[0].evaluate = MagicMock(return_value=[(1, 2), (3, 4)])
        self.handler._requested_data[1].evaluate = MagicMock(return_value=[(1, 10), (3, 13)])
        result = self.handler()
        self.handler._requested_data[0].evaluate.assert_called_once_with(2, 17)
        self.handler._requested_data[1].evaluate.assert_called_once_with(2, 17)
        self.assertEqual(result, {'request_id': 1, 'type': 'new_chart',
                                  'data': {'plot_data': [[1, 2, 10], [3, 4, 13]]}})

    def testHandlerProperProcessingOnMultipleRequestedDataAndMissingFields(self, assertions_mock):
        self.handler = NewChartRequestHandler(1, NEW_CHART_REQUEST_PAYLOAD_TWO_MEASUREMENTS)
        self.handler._requested_data[0].evaluate = MagicMock(return_value=[(1, 2), (3, 4)])
        self.handler._requested_data[1].evaluate = MagicMock(return_value=[(1, 10), ])
        result = self.handler()
        self.handler._requested_data[0].evaluate.assert_called_once_with(2, 17)
        self.handler._requested_data[1].evaluate.assert_called_once_with(2, 17)
        self.assertEqual(result, {'request_id': 1, 'type': 'new_chart',
                                  'data': {'plot_data': [[1, 2, 10], [3, 4, None]]}})

    def testHandlerIsRemovedWhenUpdateDataIsFalse(self, assertions_mock):
        self.handler = NewChartRequestHandler(1, DEFAULT_NEW_CHART_REQUEST_PAYLOAD)
        self.handler._requested_data[0].evaluate = MagicMock()
        self.handler()
        self.assertTrue(self.handler.to_be_removed)

    def testHandlerIsNotRemovedWhenUpdateDataIsTrue(self, assertions_mock):
        self.handler = NewChartRequestHandler(1, _updated(DEFAULT_NEW_CHART_REQUEST_PAYLOAD, update_data=True))
        self.handler._requested_data[0].evaluate = MagicMock()
        self.handler()
        self.assertFalse(self.handler.to_be_removed)


@patch('websocket.handlers.NewLiveDataRequestHandler._run_assertions')
@patch('websocket.handlers.get_one', new=mocked_get_one)
class TestWebSocketNewLiveDataRequestHandler(unittest.TestCase):

    def testHandlerProperCreation(self, assertions_mock):
        self.handler = NewLiveDataRequestHandler(1, DEFAULT_NEW_LIVE_DATA_REQUEST_PAYLOAD)
        assertions_mock.assert_called_once_with()

    @patch('websocket.handlers.InfluxReader.query', return_value=[{'time': 100000, 'value': 0.17}])
    def testHandlerProperProcessing(self, influx_reader_mock, assertions_mock):
        self.handler = NewLiveDataRequestHandler(1, DEFAULT_NEW_LIVE_DATA_REQUEST_PAYLOAD)
        result = self.handler()
        self.assertEqual(result, {'request_id': 1, 'type': 'new_live_data',
                                  'data': {'timestamp': 100000, 'value': 0.17}})

    @patch('websocket.handlers.InfluxReader.query', return_value=[])
    def testHandlerReturnsNoneWhenNoDataFromInflux(self, influx_reader_mock, assertions_mock):
        self.handler = NewLiveDataRequestHandler(1, DEFAULT_NEW_LIVE_DATA_REQUEST_PAYLOAD)
        result = self.handler()
        self.assertEqual(result, None)
