# mocked database model
import unittest

from pycnic.core import Request
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database.model import TagAttribute, MetaAttribute, SeriesAttribute, EntityType, EntityTag, EntityMeta, Entity, Base


engine = create_engine('sqlite://')
Session = sessionmaker(bind=engine)


class AbstractTestWithDatabase(unittest.TestCase):
    def setUp(self):
        Base.metadata.create_all(bind=engine)

    def tearDown(self):
        Base.metadata.drop_all(bind=engine)


class MockedTagAttribute(object):
    def __init__(self, entity_type):
        self.entity_type = entity_type

    def __getattr__(self, it):
        return {'id': 1, 'name': 'tag_name', 'entity_type_id_fk': 1, 'delete_ts': None,
                'entity_type': self.entity_type}.get(it)

    to_dict = TagAttribute.to_dict


class MockedMetaAttribute(object):
    def __init__(self, entity_type):
        self.entity_type = entity_type

    def __getattr__(self, it):
        return {'id': 1, 'name': 'tag_name', 'entity_type_id_fk': 1, 'delete_ts': None,
                'entity_type': self.entity_type}.get(it)

    to_dict = MetaAttribute.to_dict


class MockedSeriesAttribute(object):
    def __init__(self, entity_type, name='series_name', ident=1):
        self.entity_type = entity_type
        self.name = name
        self.id = ident

    def __getattr__(self, it):
        return {'id': self.id, 'name': self.name, 'entity_type_id_fk': 1, 'delete_ts': None, 'type': 'real',
                'refresh_time': 1, 'entity_type': self.entity_type}.get(it)

    transform = SeriesAttribute.transform
    to_dict = SeriesAttribute.to_dict
    to_tree_dict = SeriesAttribute.to_tree_dict


class MockedEntityType(object):
    def __getattr__(self, it):
        return {'id': 1, 'name': 'entity_type_name', 'delete_ts': None, 'tags': [MockedTagAttribute(self)],
                'meta': [MockedMetaAttribute(self)],
                'series': [MockedSeriesAttribute(self, name='s1'), MockedSeriesAttribute(self, name='s2')]}.get(it)

    to_dict = EntityType.to_dict


class MockedEntityTag(object):
    def __init__(self, entity):
        self.entity = entity

    def __getattr__(self, it):
        return {'entity_id_fk': 1, 'tag_id_fk': 1, 'value': 'tag_val', 'delete_ts': None, 'entity': self.entity,
                'attribute': MockedEntityType().tags[0]}.get(it)

    to_dict = EntityTag.to_dict


class MockedEntityMeta(object):
    def __init__(self, entity):
        self.entity = entity

    def __getattr__(self, it):
        return {'entity_id_fk': 1, 'meta_id_fk': 1, 'value': 'meta_val', 'delete_ts': None, 'entity': self.entity,
                'attribute': MockedEntityType().tags[0]}.get(it)

    to_dict = EntityMeta.to_dict


class MockedEntity(object):
    def __getattr__(self, it):
        return {'id': 1, 'entity_type_id_fk': 1, 'parent_id_fk': None, 'last_data_fetch_ts': 1000, 'delete_ts': None,
                'entity_type': MockedEntityType(), 'tags': [MockedEntityTag(self)],
                'meta': [MockedEntityMeta(self)], 'children': []}.get(it)

    to_dict = Entity.to_dict
    add_nodes_rec = Entity.add_nodes_rec
    map_nodes = Entity.map_nodes
    tree_structure_dict = Entity.tree_structure_dict


def mocked_get_one(session, cls, **kwargs):
    c = cls.__name__
    return {'EntityType': MockedEntityType(), 'TagAttribute': MockedEntityType().tags[0],
            'MetaAttribute': MockedEntityType().meta[0], 'SeriesAttribute': MockedEntityType().series[0],
            'Entity': MockedEntity(), 'EntityTag': MockedEntity().tags[0], 'EntityMeta': MockedEntity().meta[0]}.get(c)


def mocked_get_all(session, cls, **kwargs):
    c = cls.__name__
    return {'EntityType': [MockedEntityType()], 'TagAttribute': MockedEntityType().tags,
            'MetaAttribute': MockedEntityType().meta, 'SeriesAttribute': MockedEntityType().series,
            'Entity': [MockedEntity()], 'EntityTag': MockedEntity().tags, 'EntityMeta': MockedEntity().meta}.get(c)


def get_handler(cls, payload=None):
    handler = cls()
    handler.request = Request('foo', 'bar', {})
    handler.request._data = payload or {}
    return handler
