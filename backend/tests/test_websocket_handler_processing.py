import unittest
from unittest.mock import patch, MagicMock

from websocket.arithmetic import MeasurementIdType
from websocket.handlers import NewChartRequestHandler, NewLiveDataRequestHandler

DEFAULT_NEW_CHART_REQUEST_PAYLOAD = {'node_id': 1, 'begin_ts': 2, 'requested_data': {'measurement_id': 1}, 'end_ts': 17,
                                     'update_data': False, 'aggregation_length': 60, 'aggregation_type': 'min'}

DEFAULT_NEW_LIVE_DATA_REQUEST_PAYLOAD = {'node_id': 3, 'measurement_id': 17}


def _updated(d, **kwargs):
    result = dict(d)
    for kwarg in kwargs:
        result[kwarg] = kwargs[kwarg]
    return result


@patch('websocket.handlers.NewChartRequestHandler._run_assertions')
@patch('websocket.arithmetic.get_one', return_value=MagicMock())
@patch('websocket.handlers.get_one', return_value=MagicMock())
class TestWebSocketNewChartRequestHandler(unittest.TestCase):

    def testHandlerProperCreation(self, get_one_mock, get_one_mock2, assertions_mock):
        self.handler = NewChartRequestHandler(1, DEFAULT_NEW_CHART_REQUEST_PAYLOAD)
        self.assertTrue(isinstance(self.handler._requested_data, MeasurementIdType))
        assertions_mock.assert_called_once_with()

    def testHandlerProperProcessing(self, get_one_mock, get_one_mock2, assertions_mock):
        self.handler = NewChartRequestHandler(1, DEFAULT_NEW_CHART_REQUEST_PAYLOAD)
        self.handler._requested_data.evaluate = MagicMock(return_value=[(1, 2), (3, 4)])
        result = self.handler()
        self.handler._requested_data.evaluate.assert_called_once_with(2, 17)
        self.assertEqual(result, {'request_id': 1, 'type': 'new_chart',
                                  'data': {'plot_data': [{'x': 1, 'y': 2}, {'x': 3, 'y': 4}]}})

    def testHandlerIsRemovedWhenUpdateDataIsFalse(self, get_one_mock, get_one_mock2, assertions_mock):
        self.handler = NewChartRequestHandler(1, DEFAULT_NEW_CHART_REQUEST_PAYLOAD)
        self.handler._requested_data.evaluate = MagicMock()
        self.handler()
        self.assertTrue(self.handler.to_be_removed)

    def testHandlerIsNotRemovedWhenUpdateDataIsTrue(self, get_one_mock, get_one_mock2, assertions_mock):
        self.handler = NewChartRequestHandler(1, _updated(DEFAULT_NEW_CHART_REQUEST_PAYLOAD, update_data=True))
        self.handler._requested_data.evaluate = MagicMock()
        self.handler()
        self.assertFalse(self.handler.to_be_removed)


@patch('websocket.handlers.NewLiveDataRequestHandler._run_assertions')
@patch('websocket.handlers.get_one', return_value=MagicMock())
class TestWebSocketNewLiveDataRequestHandler(unittest.TestCase):

    def testHandlerProperCreation(self, get_one_mock, assertions_mock):
        self.handler = NewLiveDataRequestHandler(1, DEFAULT_NEW_LIVE_DATA_REQUEST_PAYLOAD)
        assertions_mock.assert_called_once_with()

    @patch('websocket.handlers.InfluxReader.query', return_value=[{'time': 100000, 'value': 0.17}])
    def testHandlerProperProcessing(self, influx_reader_mock, get_one_mock, assertions_mock):
        self.handler = NewLiveDataRequestHandler(1, DEFAULT_NEW_LIVE_DATA_REQUEST_PAYLOAD)
        result = self.handler()
        self.assertEqual(result, {'request_id': 1, 'type': 'new_live_data',
                                  'data': {'timestamp': 100000, 'value': 0.17}})

    @patch('websocket.handlers.InfluxReader.query', return_value=[])
    def testHandlerReturnsNoneWhenNoDataFromInflux(self, influx_reader_mock, get_one_mock, assertions_mock):
        self.handler = NewLiveDataRequestHandler(1, DEFAULT_NEW_LIVE_DATA_REQUEST_PAYLOAD)
        result = self.handler()
        self.assertEqual(result, None)
