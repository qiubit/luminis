import unittest
from unittest.mock import MagicMock
from websocket.request_processor import RequestProcessor


class TestWebSocketRequestProcessing(unittest.TestCase):

    def setUp(self):
        super().setUp()
        self.processor = RequestProcessor()
        self.handler1 = MagicMock(return_value=1)
        self.handler1.to_be_removed = False
        self.handler2 = MagicMock(return_value=2)
        self.handler2.to_be_removed = False
        self.processor._requests = {1: self.handler1, 2: self.handler2}

    def test_cleanup_removes_nothing_if_no_requests_are_to_be_removed(self):
        self.processor._cleanup()
        self.assertEquals(self.processor._requests, {1: self.handler1, 2: self.handler2})

    def test_cleanup_removes_request_to_be_removed(self):
        self.handler2.to_be_removed = True
        self.processor._cleanup()
        self.assertEqual(self.processor._requests, {1: self.handler1})

    def test_cleanup_does_not_fail_for_empty_dict(self):
        self.processor._requests = dict()
        self.processor._cleanup()
        self.assertEqual(self.processor._requests, dict())

    def test_cancel_request_removes_request(self):
        self.processor.process_new_request({'request_id': None, 'type': 'cancel_request', 'params': {'request_id': 1}})
        self.handler1.remove.assert_called_once_with()
        self.handler2.remove.assert_not_called()
        with self.assertRaises(ValueError):
            self.processor.process_new_request({'request_id': None, 'type': 'cancel_request',
                                                'params': {'request_id': 17}})

    def test_cancel_request_raises_when_no_such_request_exists(self):
        with self.assertRaises(ValueError):
            self.processor.process_new_request({'request_id': None, 'type': 'cancel_request',
                                                'params': {'request_id': 17}})
        self.handler1.remove.assert_not_called()

    def test_new_chart_request_creates_handler(self):
        chart_mock = MagicMock(return_value=10)
        self.processor.HANDLER_CLASSES['new_chart'] = chart_mock
        self.processor.process_new_request({'request_id': 1, 'type': 'new_chart', 'params': {'x': 'y'}})

        self.assertEqual(self.processor._requests.get(1), 10)
        chart_mock.assert_called_once_with(1, {'x': 'y'})

    def test_new_live_data_request_creates_handler(self):
        data_mock = MagicMock(return_value=10)
        self.processor.HANDLER_CLASSES['new_live_data'] = data_mock
        self.processor.process_new_request({'request_id': 1, 'type': 'new_live_data', 'params': {'x': 'y'}})

        self.assertEqual(self.processor._requests.get(1), 10)
        data_mock.assert_called_once_with(1, {'x': 'y'})

    def test_non_existing_request_type_raises(self):
        with self.assertRaises(ValueError):
            self.processor.process_new_request({'request_id': 1, 'type': 'fake_request', 'params': {}})

    def test_run_requests(self):
        self.assertEqual([1, 2], self.processor.run_requests())
        self.handler1.assert_called_once_with()
        self.handler2.assert_called_once_with()

    def test_cancel_request_and_then_run(self):
        self.handler1.to_be_removed = True
        self.assertEqual([2], self.processor.run_requests())
        self.handler1.assert_not_called()
        self.handler2.assert_called_once_with()
