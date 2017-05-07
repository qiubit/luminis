#
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

from unittest.mock import patch

from pycnic.errors import HTTP_404

from api.entity_type import EntityTypeHandler
from api.meta_attribute import MetaAttributeHandler
from api.series_attribute import SeriesAttributeHandler
from api.tag_attribute import TagAttributeHandler
from api.tree import EntityHandler
from database.helpers import get_all, get_one
from database.model import EntityType, TagAttribute, SeriesAttribute, MetaAttribute, Entity, EntityMeta, EntityTag
from .test_utils import AbstractTestWithDatabase, Session, get_handler


@patch('api.entity_type.Session', new=Session)
class TestEntityTypeDeleteHandler(AbstractTestWithDatabase):
    def setUp(self):
        super().setUp()
        # create entity types
        with patch('api.entity_type.Session', new=Session):
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': ['t'], 'series': ['s'], 'meta': ['m']}).post()
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': ['t2'], 'series': [], 'meta': ['m2']}).post()
        # create nodes
        with patch('api.tree.Session', new=Session):
            get_handler(EntityHandler, {'parent_id': None, 'entity_type_id': 1, 'tag_1': 'tag_val',
                                        'meta_1': 'meta_val'}).post()
            get_handler(EntityHandler, {'parent_id': None, 'entity_type_id': 2, 'tag_2': 'tag_val',
                                        'meta_2': 'meta_val'}).post()

    def test_delete_removes_object_and_dependants(self):
        result = get_handler(EntityTypeHandler).delete(1)
        self.assertEqual({'success': True}, result)
        self.assertEqual(len(get_all(Session(), EntityType)), 1)
        self.assertEqual(get_one(Session(), EntityType).id, 2)
        self.assertEqual(len(get_all(Session(), TagAttribute)), 1)
        self.assertEqual(len(get_all(Session(), SeriesAttribute)), 0)
        self.assertEqual(len(get_all(Session(), MetaAttribute)), 1)
        self.assertEqual(len(get_all(Session(), Entity)), 1)

    def test_invalid_request_raises(self):
        with self.assertRaises(HTTP_404):
            get_handler(EntityTypeHandler).delete(10)  # non existing entity type


@patch('api.meta_attribute.Session', new=Session)
class TestMetaAttributeDeleteHandler(AbstractTestWithDatabase):
    def setUp(self):
        super().setUp()
        # create entity type
        with patch('api.entity_type.Session', new=Session):
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': [], 'series': [], 'meta': ['m']}).post()
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': [], 'series': [], 'meta': ['m2']}).post()
        # create node
        with patch('api.tree.Session', new=Session):
            get_handler(EntityHandler, {'parent_id': None, 'entity_type_id': 1, 'meta_1': 'meta_val'}).post()

    def test_delete_removes_object_and_dependants(self):
        result = get_handler(MetaAttributeHandler).delete(1, 1)
        self.assertEqual({'success': True}, result)
        self.assertEqual(len(get_all(Session(), EntityType)), 2)
        self.assertEqual(len(get_all(Session(), MetaAttribute)), 1)
        self.assertEqual(len(get_all(Session(), EntityMeta)), 0)

    def test_invalid_request_raises(self):
        with self.assertRaises(HTTP_404):
            get_handler(MetaAttributeHandler).delete(10, 1)  # non existing entity type
        with self.assertRaises(HTTP_404):
            get_handler(MetaAttributeHandler).delete(1, 10)  # non existing meta attribute
        with self.assertRaises(HTTP_404):
            get_handler(MetaAttributeHandler).delete(1, 2)  # meta attribute of different entity type


@patch('api.tag_attribute.Session', new=Session)
class TestTagAttributeDeleteHandler(AbstractTestWithDatabase):
    def setUp(self):
        super().setUp()
        # create entity type
        with patch('api.entity_type.Session', new=Session):
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': ['t'], 'series': [], 'meta': []}).post()
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': ['t2'], 'series': [], 'meta': []}).post()
        # create node
        with patch('api.tree.Session', new=Session):
            get_handler(EntityHandler, {'parent_id': None, 'entity_type_id': 1, 'tag_1': 'tag_val'}).post()

    def test_delete_removes_object_and_dependants(self):
        result = get_handler(TagAttributeHandler).delete(1, 1)
        self.assertEqual({'success': True}, result)
        self.assertEqual(len(get_all(Session(), EntityType)), 2)
        self.assertEqual(len(get_all(Session(), TagAttribute)), 1)
        self.assertEqual(len(get_all(Session(), EntityTag)), 0)

    def test_invalid_request_raises(self):
        with self.assertRaises(HTTP_404):
            get_handler(TagAttributeHandler).delete(10, 1)  # non existing entity type
        with self.assertRaises(HTTP_404):
            get_handler(TagAttributeHandler).delete(1, 10)  # non existing tag attribute
        with self.assertRaises(HTTP_404):
            get_handler(TagAttributeHandler).delete(1, 2)  # tag attribute of different entity type


@patch('api.series_attribute.Session', new=Session)
class TestSeriesAttributeDeleteHandler(AbstractTestWithDatabase):
    def setUp(self):
        super().setUp()
        # create entity type
        with patch('api.entity_type.Session', new=Session):
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': [], 'series': ['s'], 'meta': []}).post()
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': [], 'series': ['s2'], 'meta': []}).post()

    def test_delete_removes_object_and_dependants(self):
        result = get_handler(SeriesAttributeHandler).delete(1, 1)
        self.assertEqual({'success': True}, result)
        self.assertEqual(len(get_all(Session(), EntityType)), 2)
        self.assertEqual(len(get_all(Session(), SeriesAttribute)), 1)

    def test_invalid_request_raises(self):
        with self.assertRaises(HTTP_404):
            get_handler(SeriesAttributeHandler).delete(10, 1)  # non existing entity type
        with self.assertRaises(HTTP_404):
            get_handler(SeriesAttributeHandler).delete(1, 10)  # non existing series attribute
        with self.assertRaises(HTTP_404):
            get_handler(SeriesAttributeHandler).delete(1, 2)  # series attribute of different entity type


@patch('api.tree.Session', new=Session)
class TestEntityDeleteHandler(AbstractTestWithDatabase):
    def setUp(self):
        super().setUp()
        # create entity type
        with patch('api.entity_type.Session', new=Session):
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': ['t'], 'series': [], 'meta': ['m']}).post()
        # create nodes
        with patch('api.tree.Session', new=Session):
            get_handler(EntityHandler, {'parent_id': None, 'entity_type_id': 1, 'tag_1': 'tag_val',
                                        'meta_1': 'meta_val'}).post()
            get_handler(EntityHandler, {'parent_id': 1, 'entity_type_id': 1, 'tag_1': 'tag_val',
                                        'meta_1': 'meta_val'}).post()
            get_handler(EntityHandler, {'parent_id': None, 'entity_type_id': 1, 'tag_1': 'tag_val',
                                        'meta_1': 'meta_val'}).post()

    def test_delete_leaf_removes_object_and_dependants(self):
        result = get_handler(EntityHandler).delete(3)
        self.assertEqual({'success': True}, result)
        self.assertEqual(len(get_all(Session(), Entity)), 2)
        self.assertEqual(len(get_all(Session(), EntityTag)), 2)
        self.assertEqual(len(get_all(Session(), EntityMeta)), 2)

    def test_delete_non_leaf_changes_parent_id_of_children(self):
        result = get_handler(EntityHandler).delete(1)
        self.assertEqual({'success': True}, result)
        self.assertEqual(get_one(Session(), Entity, id=2).parent_id_fk, None)

    def test_invalid_request_raises(self):
        with self.assertRaises(HTTP_404):
            get_handler(EntityHandler).delete(10)  # non existing entity
