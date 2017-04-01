from unittest.mock import patch

from pycnic.errors import HTTP_404, HTTP_400

from api.entity_type import EntityTypeHandler
from api.meta_attribute import MetaAttributeHandler
from api.tree import EntityHandler
from database.helpers import get_all, get_one
from database.model import EntityType, TagAttribute, SeriesAttribute, MetaAttribute, EntityTag, EntityMeta
from .test_utils import AbstractTestWithDatabase, Session, get_handler


@patch('api.entity_type.Session', new=Session)
class TestEntityTypePutHandler(AbstractTestWithDatabase):
    def setUp(self):
        super().setUp()
        with patch('api.entity_type.Session', new=Session):
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': ['t1'], 'series': ['s1'], 'meta': ['m1']}).post()

    def test_put_updates_name(self):
        result = get_handler(EntityTypeHandler, {'name': 'bar'}).put(1)

        self.assertEqual({'success': True, 'ID': 1}, result)
        self.assertEqual(len(get_all(Session(), EntityType)), 1)
        self.assertEqual(get_one(Session(), EntityType, id=1).name, 'bar')

    def test_put_creates_new_objects(self):
        result = get_handler(EntityTypeHandler, {'tags': ['t2']}).put(1)
        self.assertEqual({'success': True, 'ID': 1}, result)
        self.assertEqual(len(get_all(Session(), TagAttribute)), 2)

        result = get_handler(EntityTypeHandler, {'series': ['s2']}).put(1)
        self.assertEqual({'success': True, 'ID': 1}, result)
        self.assertEqual(len(get_all(Session(), SeriesAttribute)), 2)

        result = get_handler(EntityTypeHandler, {'meta': ['m2']}).put(1)
        self.assertEqual({'success': True, 'ID': 1}, result)
        self.assertEqual(len(get_all(Session(), MetaAttribute)), 2)

    def test_invalid_request_raises(self):
        with self.assertRaises(HTTP_404):
            get_handler(EntityTypeHandler, {'name': 'bar'}).put(2)  # invalid entity type id
        with self.assertRaises(HTTP_400):
            get_handler(EntityTypeHandler, {'tags': ['t1', 't2']}).put(1)  # existing tag
        with self.assertRaises(HTTP_400):
            get_handler(EntityTypeHandler, {'series': ['s1', 's2']}).put(1)  # existing series
        with self.assertRaises(HTTP_400):
            get_handler(EntityTypeHandler, {'meta': ['m1', 'm2']}).put(1)  # existing meta


@patch('api.meta_attribute.Session', new=Session)
@patch('api.validators.Session', new=Session)
class MetaAttributePutHandler(AbstractTestWithDatabase):
    def setUp(self):
        super().setUp()
        with patch('api.entity_type.Session', new=Session):
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': [], 'series': [], 'meta': ['m1', 'm2', 'm3']}).post()
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': [], 'series': [], 'meta': ['m4']}).post()

    def test_put_updates_name(self):
        result = get_handler(MetaAttributeHandler, {'name': 'meta_foo'}).put(1, 1)

        self.assertEqual({'success': True, 'ID': 1}, result)
        self.assertEqual(len(get_all(Session(), MetaAttribute)), 4)
        self.assertEqual(get_one(Session(), MetaAttribute, id=1).name, 'meta_foo')

    def test_invalid_request_raises(self):
        with self.assertRaises(HTTP_404):
            get_handler(MetaAttributeHandler, {'name': 'meta_foo'}).put(10, 1)  # non existing entity type
        with self.assertRaises(HTTP_404):
            get_handler(MetaAttributeHandler, {'name': 'meta_foo'}).put(1, 10)  # non existing meta attribute
        with self.assertRaises(HTTP_404):
            get_handler(MetaAttributeHandler, {'name': 'meta_foo'}).put(2, 2)  # meta attribute of different entity type
        with self.assertRaises(HTTP_400):
            get_handler(MetaAttributeHandler, {'name': 'm2'}).put(1, 1)  # existing name


@patch('api.tree.Session', new=Session)
class TestEntityPutHandler(AbstractTestWithDatabase):
    def setUp(self):
        super().setUp()
        with patch('api.entity_type.Session', new=Session):
            get_handler(EntityTypeHandler, {'name': 'foo', 'tags': ['t1'], 'series': ['s1'], 'meta': ['m1']}).post()
            get_handler(EntityTypeHandler, {'name': 'bar', 'tags': ['t2'], 'series': ['s2'], 'meta': ['m2']}).post()
        with patch('api.tree.Session', new=Session):
            get_handler(EntityHandler, {'parent_id': None, 'entity_type_id': 1, 'tag_1': 'tag_val',
                                        'meta_1': 'meta_val'}).post()

    def test_put_updates_fields(self):
        result = get_handler(EntityHandler, {'tag_1': 'tag_foo', 'meta_1': 'meta_foo'}).put(1)

        self.assertEqual({'success': True, 'ID': 1}, result)
        self.assertEqual(len(get_all(Session(), EntityTag)), 1)
        self.assertEqual(len(get_all(Session(), EntityMeta)), 1)
        self.assertEqual(get_one(Session(), EntityTag, entity_id_fk=1).value, 'tag_foo')
        self.assertEqual(get_one(Session(), EntityMeta, entity_id_fk=1).value, 'meta_foo')

    def test_invalid_request_raises(self):
        with self.assertRaises(HTTP_404):
            get_handler(EntityHandler, {'tag_1': 'tag_foo', 'meta_1': 'meta_foo'}).put(2)  # non existing entity
        with self.assertRaises(HTTP_404):
            get_handler(EntityHandler, {'tag_2': 'tag_foo'}).put(1)  # tag not in entity type of entity #1
        with self.assertRaises(HTTP_404):
            get_handler(EntityHandler, {'meta_2': 'tag_foo'}).put(1)  # meta not in entity type of entity #1
