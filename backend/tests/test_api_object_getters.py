import unittest
from unittest.mock import patch

from api.entity_type import EntityTypeHandler
from api.meta_attribute import MetaAttributeHandler
from api.series_attribute import SeriesAttributeHandler
from api.tag_attribute import TagAttributeHandler
from api.tree import EntityHandler, TreeHandler
from .test_utils import mocked_get_all, mocked_get_one, MockedEntityType, MockedEntity, get_handler


class TestApiObjectGetters(unittest.TestCase):

    @patch('api.entity_type.get_all', new=mocked_get_all)
    def test_entity_type_get_without_id_returns_all_entity_types(self):
        result = get_handler(EntityTypeHandler).get()
        self.assertEqual(result, [MockedEntityType().to_dict()])

    @patch('api.entity_type.get_one', new=mocked_get_one)
    def test_entity_type_get_with_id_returns_one_entity_type(self):
        result = get_handler(EntityTypeHandler).get(1)
        self.assertEqual(result, MockedEntityType().to_dict())

    @patch('api.meta_attribute.get_all', new=mocked_get_all)
    @patch('api.meta_attribute.get_one', new=mocked_get_one)
    def test_meta_attribute_get_without_id_returns_all_meta_attributes(self):
        result = get_handler(MetaAttributeHandler).get(1)
        self.assertEqual(result, [meta.to_dict() for meta in MockedEntityType().meta])

    @patch('api.meta_attribute.get_one', new=mocked_get_one)
    def test_meta_attribute_get_with_id_returns_one_meta_attribute(self):
        result = get_handler(MetaAttributeHandler).get(1, 1)
        self.assertEqual(result, MockedEntityType().meta[0].to_dict())

    @patch('api.series_attribute.get_all', new=mocked_get_all)
    @patch('api.series_attribute.get_one', new=mocked_get_one)
    def test_series_attribute_get_without_id_returns_all_series_attributes(self):
        result = get_handler(SeriesAttributeHandler).get(1)
        self.assertEqual(result, [series.to_dict() for series in MockedEntityType().series])

    @patch('api.series_attribute.get_one', new=mocked_get_one)
    def test_series_attribute_get_with_id_returns_one_series_attribute(self):
        result = get_handler(SeriesAttributeHandler).get(1, 1)
        self.assertEqual(result, MockedEntityType().series[0].to_dict())

    @patch('api.tag_attribute.get_all', new=mocked_get_all)
    @patch('api.tag_attribute.get_one', new=mocked_get_one)
    def test_tag_attribute_get_without_id_returns_all_tag_attributes(self):
        result = get_handler(TagAttributeHandler).get(1)
        self.assertEqual(result, [tag.to_dict() for tag in MockedEntityType().tags])

    @patch('api.tag_attribute.get_one', new=mocked_get_one)
    def test_tag_attribute_get_with_id_returns_one_tag_attribute(self):
        result = get_handler(TagAttributeHandler).get(1, 1)
        self.assertEqual(result, MockedEntityType().tags[0].to_dict())

    @patch('api.tree.get_one', new=mocked_get_one)
    def test_entity_get_returns_one_entity(self):
        result = get_handler(EntityHandler).get(1)
        self.assertEqual(result, MockedEntity().to_dict())

    @patch('api.tree.get_all', new=mocked_get_all)
    def test_tree_get_without_id_returns_all_trees(self):
        result = get_handler(TreeHandler).get()

        self.assertEqual(result, {
            'tree_metadata': {1: {'children': [],
                                  'measurements': [sa.id for sa in MockedEntityType().series],
                                  'name': None,
                                  'node_id': 1,
                                  'parent': None,
                                  'position': {'x': None, 'y': None}}},
            'tree': [MockedEntity().tree_structure_dict()],
            'measurements_metadata': {sa.id: sa.to_tree_dict() for sa in MockedEntityType().series},
        })

    @patch('api.tree.get_one', new=mocked_get_one)
    @patch('api.tree.get_all', new=mocked_get_all)
    def test_tree_get_with_id_returns_one_tree(self):
        result = get_handler(TreeHandler).get(1)

        self.assertEqual(result, {
            'tree_metadata': {1: {'children': [],
                                  'measurements': [sa.id for sa in MockedEntityType().series],
                                  'name': None,
                                  'node_id': 1,
                                  'parent': None,
                                  'position': {'x': None, 'y': None}}},
            'tree': MockedEntity().tree_structure_dict(),
            'measurements_metadata': {sa.id: sa.to_tree_dict() for sa in MockedEntityType().series},
        })
