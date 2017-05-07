#
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

from unittest.mock import patch
from pycnic.errors import HTTP_400, HTTP_404

from api.entity_type import EntityTypeHandler
from api.meta_attribute import MetaAttributeHandler
from api.series_attribute import SeriesAttributeHandler
from api.tag_attribute import TagAttributeHandler
from api.tree import EntityHandler
from database.helpers import get_all
from database.model import EntityType, TagAttribute, MetaAttribute, SeriesAttribute, Entity
from .test_utils import Session, AbstractTestWithDatabase, get_handler


@patch('api.entity_type.Session', new=Session)
class TestEntityTypePostHandler(AbstractTestWithDatabase):

    def test_post_creates_object(self):
        result = get_handler(EntityTypeHandler, {'name': 'foo', 'tags': [], 'series': [], 'meta': []}).post()

        self.assertEqual({'success': True, 'ID': 1}, result)
        self.assertEqual(len(get_all(Session(), EntityType)), 1)
        self.assertEqual(len(get_all(Session(), TagAttribute)), 0)
        self.assertEqual(len(get_all(Session(), MetaAttribute)), 0)
        self.assertEqual(len(get_all(Session(), SeriesAttribute)), 0)

    def test_post_with_attributes_creates_objects(self):
        result = get_handler(EntityTypeHandler, {'name': 'foo', 'tags': ['tag1'], 'series': ['series1'],
                                                 'meta': ['meta1']}).post()

        self.assertEqual({'success': True, 'ID': 1}, result)
        self.assertEqual(len(get_all(Session(), EntityType)), 1)
        self.assertEqual(len(get_all(Session(), TagAttribute)), 1)
        self.assertEqual(len(get_all(Session(), MetaAttribute)), 1)
        self.assertEqual(len(get_all(Session(), SeriesAttribute)), 1)

    def test_invalid_request_raises(self):
        handler = get_handler(EntityTypeHandler)

        with self.assertRaises(HTTP_400):
            handler.request._data = {'name': 'foo', 'tags': [], 'series': []}  # no meta
            handler.post()
        with self.assertRaises(HTTP_400):
            handler.request._data = {'name': 'foo', 'tags': [], 'meta': []}  # no series
            handler.post()
        with self.assertRaises(HTTP_400):
            handler.request._data = {'name': 'foo', 'series': [], 'meta': []}  # no tags
            handler.post()
        with self.assertRaises(HTTP_400):
            handler.request._data = {'tags': [], 'series': [], 'meta': []}  # no name
            handler.post()
        self.assertEqual(len(get_all(Session(), EntityType)), 0)


@patch('api.meta_attribute.Session', new=Session)
@patch('api.validators.Session', new=Session)
class TestMetaAttributePostHandler(AbstractTestWithDatabase):
    def setUp(self):
        super().setUp()
        # create entity type
        with patch('api.entity_type.Session', new=Session):
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': [], 'series': [], 'meta': ['meta_name']}).post()

    def test_post_creates_object(self):
        self.assertEqual(len(get_all(Session(), MetaAttribute)), 1)
        result = get_handler(MetaAttributeHandler, {'name': 'foo'}).post(1)

        self.assertEqual({'success': True, 'ID': 2}, result)
        self.assertEqual(len(get_all(Session(), MetaAttribute)), 2)

    def test_invalid_request_raises(self):
        self.assertEqual(len(get_all(Session(), MetaAttribute)), 1)
        handler = get_handler(MetaAttributeHandler)

        with self.assertRaises(HTTP_400):
            handler.request._data = {}  # no name
            handler.post(1)
        with self.assertRaises(HTTP_400):
            handler.request._data = {'name': 'meta_name'}  # existing name
            handler.post(1)
        with self.assertRaises(HTTP_404):
            handler.request._data = {'name': 'foo'}
            handler.post(2)  # non-existing entity type

        self.assertEqual(len(get_all(Session(), MetaAttribute)), 1)


@patch('api.tag_attribute.Session', new=Session)
@patch('api.validators.Session', new=Session)
class TestTagAttributePostHandler(AbstractTestWithDatabase):
    def setUp(self):
        super().setUp()
        # create entity type
        with patch('api.entity_type.Session', new=Session):
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': ['tag_name'], 'series': [], 'meta': []}).post()

    def test_post_creates_object(self):
        self.assertEqual(len(get_all(Session(), TagAttribute)), 1)
        result = get_handler(TagAttributeHandler, {'name': 'foo'}).post(1)

        self.assertEqual({'success': True, 'ID': 2}, result)
        self.assertEqual(len(get_all(Session(), TagAttribute)), 2)

    def test_invalid_request_raises(self):
        self.assertEqual(len(get_all(Session(), TagAttribute)), 1)
        handler = get_handler(TagAttributeHandler)

        with self.assertRaises(HTTP_400):
            handler.request._data = {}  # no name
            handler.post(1)
        with self.assertRaises(HTTP_400):
            handler.request._data = {'name': 'tag_name'}  # existing name
            handler.post(1)
        with self.assertRaises(HTTP_404):
            handler.request._data = {'name': 'foo'}
            handler.post(2)  # non-existing entity type

        self.assertEqual(len(get_all(Session(), TagAttribute)), 1)


@patch('api.series_attribute.Session', new=Session)
@patch('api.validators.Session', new=Session)
class TestSeriesAttributePostHandler(AbstractTestWithDatabase):
    def setUp(self):
        super().setUp()
        # create entity type
        with patch('api.entity_type.Session', new=Session):
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': [], 'series': ['series_name'], 'meta': []}).post()

    def test_post_creates_object(self):
        self.assertEqual(len(get_all(Session(), SeriesAttribute)), 1)
        result = get_handler(SeriesAttributeHandler, {'name': 'foo'}).post(1)

        self.assertEqual({'success': True, 'ID': 2}, result)
        self.assertEqual(len(get_all(Session(), SeriesAttribute)), 2)

        # post with more params
        result = get_handler(SeriesAttributeHandler, {'name': 'foo_prim', 'type': 'enum', 'refresh_time': 3600}).post(1)

        self.assertEqual({'success': True, 'ID': 3}, result)
        self.assertEqual(len(get_all(Session(), SeriesAttribute)), 3)

    def test_invalid_request_raises(self):
        self.assertEqual(len(get_all(Session(), SeriesAttribute)), 1)
        handler = get_handler(SeriesAttributeHandler)

        with self.assertRaises(HTTP_400):
            handler.request._data = {}  # no name
            handler.post(1)
        with self.assertRaises(HTTP_400):
            handler.request._data = {'name': 'foo', 'type': 'nop'}  # bad type
            handler.post(1)
        with self.assertRaises(HTTP_400):
            handler.request._data = {'name': 'foo', 'refresh_time': '2'}  # bad refresh time
            handler.post(1)
        with self.assertRaises(HTTP_400):
            handler.request._data = {'name': 'series_name'}  # existing name
            handler.post(1)
        with self.assertRaises(HTTP_404):
            handler.request._data = {'name': 'foo'}
            handler.post(2)  # non-existing entity type

        self.assertEqual(len(get_all(Session(), SeriesAttribute)), 1)


@patch('api.tree.Session', new=Session)
class TestEntityPostHandler(AbstractTestWithDatabase):
    def setUp(self):
        super().setUp()
        # create entity type
        with patch('api.entity_type.Session', new=Session):
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': ['t'], 'series': ['s'], 'meta': ['m']}).post()

    def test_post_creates_object(self):
        result = get_handler(EntityHandler, {'parent_id': None, 'entity_type_id': 1, 'tag_1': 'tag_val',
                                             'meta_1': 'meta_val'}).post()

        self.assertEqual({'success': True, 'ID': 1}, result)
        self.assertEqual(len(get_all(Session(), Entity)), 1)

        result = get_handler(EntityHandler, {'parent_id': 1, 'entity_type_id': 1, 'tag_1': 'tag_val_1',
                                             'meta_1': 'meta_val'}).post()

        self.assertEqual({'success': True, 'ID': 2}, result)
        self.assertEqual(len(get_all(Session(), Entity)), 2)

    def test_invalid_request_raises(self):
        handler = get_handler(EntityHandler)

        with self.assertRaises(HTTP_400):
            handler.request._data = {'parent_id': None, 'entity_type_id': 1, 'tag_1': 'tag_val'}  # no meta_1
            handler.post()
        with self.assertRaises(HTTP_400):
            handler.request._data = {'parent_id': None, 'entity_type_id': 1, 'meta_1': 'meta_val'}  # no tag_1
            handler.post()
        with self.assertRaises(HTTP_400):
            handler.request._data = {'parent_id': None, 'entity_type_id': 1, 'tag_1': 't', 'meta_1': 'm',
                                     'tag_10': 'f'}  # unexpected tag_10
            handler.post()
        with self.assertRaises(HTTP_400):
            handler.request._data = {'parent_id': None, 'entity_type_id': 1, 'tag_1': 't', 'meta_1': 'm',
                                     'meta_10': 'f'}  # unexpected meta_10
            handler.post()
        with self.assertRaises(HTTP_400):
            handler.request._data = {'parent_id': None, 'tag_1': 't', 'meta_1': 'm'}  # no entity type
            handler.post()
        with self.assertRaises(HTTP_400):
            handler.request._data = {'entity_type_id': 1, 'tag_1': 't', 'meta_1': 'm'}  # no parent_id
            handler.post()
        with self.assertRaises(HTTP_404):
            handler.request._data = {'parent_id': 10, 'entity_type_id': 1,
                                     'tag_1': 't', 'meta_1': 'm'}  # non-existent parent id
            handler.post()
        with self.assertRaises(HTTP_404):
            handler.request._data = {'parent_id': None, 'entity_type_id': 10}  # non-existent entity id
            handler.post()

        self.assertEqual(len(get_all(Session(), Entity)), 0)
