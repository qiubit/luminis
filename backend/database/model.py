#
# Copyright (C) 2017 Rafał Michaluk
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

import configparser

from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Boolean, Float
from sqlalchemy import create_engine
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.declarative import declarative_base


def create_engine_str():
    config = configparser.ConfigParser()
    config.read('config/database.ini')

    config_module = 'database'
    db_engine = config.get(config_module, 'engine')
    login = config.get(config_module, 'user')
    passwd = config.get(config_module, 'passwd')
    host = config.get(config_module, 'host')
    port = config.get(config_module, 'port')
    db_name = config.get(config_module, 'db_name')

    return '{}://{}:{}@{}:{}/{}'.format(db_engine, login, passwd, host, port, db_name)


def _is_not_deleted(obj):
    return obj.delete_ts is None


engine = create_engine(create_engine_str(), echo=False, pool_size=20, max_overflow=0)

Session = sessionmaker(bind=engine)

Base = declarative_base()


class GlobalMetadata(Base):
    __tablename__ = 'Global_Metadata'

    id = Column(Integer, primary_key=True)  # fake key, because mappers need to have PK
    last_data_modification_ts = Column(Integer, nullable=False, default=0)
    delete_ts = Column(Integer, nullable=True, default=None)


class EntityType(Base):
    __tablename__ = 'Entity_Types'

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    delete_ts = Column(Integer, nullable=True, default=None)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "tags": [tag.to_dict() for tag in self.tags if _is_not_deleted(tag)],
            "series": [series.to_dict() for series in self.series if _is_not_deleted(series)],
            "meta": [meta.to_dict() for meta in self.meta if _is_not_deleted(meta)],
        }


class TagAttribute(Base):
    __tablename__ = 'Tag_Attributes'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    entity_type_id_fk = Column(Integer, ForeignKey('Entity_Types.id'), nullable=False)
    delete_ts = Column(Integer, nullable=True, default=None)

    entity_type = relationship('EntityType', backref='tags',
                               primaryjoin='EntityType.id == TagAttribute.entity_type_id_fk')

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "entity_type_id": self.entity_type_id_fk,
        }


class SeriesAttribute(Base):
    __tablename__ = 'Series_Attributes'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    entity_type_id_fk = Column(Integer, ForeignKey('Entity_Types.id'), nullable=False)
    delete_ts = Column(Integer, nullable=True, default=None)
    type = Column(Enum('real', 'enum', name='series_type'), nullable=False, default='real')
    refresh_time = Column(Integer, nullable=True, default=None)
    is_favourite = Column(Boolean, nullable=False, default=False)

    entity_type = relationship('EntityType', backref='series',
                               primaryjoin='EntityType.id == SeriesAttribute.entity_type_id_fk')

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "is_favourite": self.is_favourite,
            "type": self.type,
            "refresh_time": self.refresh_time,
            "entity_type_id": self.entity_type_id_fk,
        }

    def _enum_val_dict(self):
        return {v.int_value: v.str_value for v in self.enum_vals}

    def transform(self, value):
        if value is None:
            return None
        elif self.type == 'real':
            return round(float(value), 3)
        elif self.type == 'enum':
            return self._enum_val_dict().get(int(value), None)
        else:
            raise ValueError('Unexpected type: {}'.format(self.type))

    def to_tree_dict(self):
        return {
            "measurement_id": self.id,
            "name": self.name,
            "is_favourite": self.is_favourite,
            "type": self.type,
            "refresh_time": self.refresh_time,
        }


class SeriesEnumValue(Base):
    __tablename__ = 'Series_Enum_Values'

    series_id_fk = Column(Integer, ForeignKey('Series_Attributes.id'), primary_key=True)
    int_value = Column(Integer, primary_key=True)
    str_value = Column(String(255), nullable=False)

    series = relationship('SeriesAttribute', backref='enum_vals',
                          primaryjoin='SeriesAttribute.id == SeriesEnumValue.series_id_fk')


class MetaAttribute(Base):
    __tablename__ = 'Meta_Attributes'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    entity_type_id_fk = Column(Integer, ForeignKey('Entity_Types.id'), nullable=False)
    delete_ts = Column(Integer, nullable=True, default=None)

    entity_type = relationship('EntityType', backref='meta',
                               primaryjoin='EntityType.id == MetaAttribute.entity_type_id_fk')

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "entity_type_id": self.entity_type_id_fk,
        }


class Entity(Base):
    __tablename__ = 'Entities'

    id = Column(Integer, primary_key=True)
    entity_type_id_fk = Column(Integer, ForeignKey('Entity_Types.id'), nullable=False)
    parent_id_fk = Column(Integer, ForeignKey('Entities.id'), nullable=True)
    last_data_fetch_ts = Column(Integer, nullable=False, default=0)
    delete_ts = Column(Integer, nullable=True, default=None)

    entity_type = relationship('EntityType', backref='nodes', primaryjoin='Entity.entity_type_id_fk == EntityType.id')
    parent = relationship('Entity', backref='children', remote_side='Entity.id',
                          primaryjoin='Entity.parent_id_fk == Entity.id')

    def to_dict(self, deep=False):
        result = {
            "id": self.id,
            "entity_type_id": self.entity_type_id_fk,
            "parent_id": self.parent_id_fk,
            "tags": {tag.attribute.name: tag.value for tag in self.tags if _is_not_deleted(tag)},
            "meta": {meta.attribute.name: meta.value for meta in self.meta if _is_not_deleted(meta)},
            "series": [series.name for series in self.entity_type.series if _is_not_deleted(series)],
        }
        if deep:
            result["children"] = [child.to_dict(deep) for child in self.children if _is_not_deleted(child)]
        else:
            result["children_ids"] = [child.id for child in self.children if _is_not_deleted(child)]
        return result

    def add_nodes_rec(self, node_dict):
        meta = {meta.attribute.name: meta.value for meta in self.meta if _is_not_deleted(meta)}

        node_description = {
            "node_id": self.id,
            "name": meta.get('name', None),
            "children": [child.id for child in self.children if _is_not_deleted(child)],
            "parent": self.parent_id_fk,
            "measurements": [series.id for series in self.entity_type.series if _is_not_deleted(series)],
            "position": {
                "x": meta.get("position_x", None),
                "y": meta.get("position_y", None)
            },
        }
        node_dict[self.id] = node_description

        for child in self.children:
            if _is_not_deleted(child):
                    child.add_nodes_rec(node_dict)

    def map_nodes(self):
        global_dict = {}
        self.add_nodes_rec(global_dict)
        return global_dict

    def tree_structure_dict(self):
        return {
            "node_id": self.id,
            "children": [child.tree_structure_dict() for child in self.children if _is_not_deleted(child)]
        }


class EntityTag(Base):
    __tablename__ = 'Entity_Tags'

    entity_id_fk = Column(Integer, ForeignKey('Entities.id'), primary_key=True)
    tag_id_fk = Column(Integer, ForeignKey('Tag_Attributes.id'), primary_key=True)
    value = Column(String(255), nullable=False)
    delete_ts = Column(Integer, nullable=True, default=None)

    attribute = relationship('TagAttribute', primaryjoin='EntityTag.tag_id_fk == TagAttribute.id')
    entity = relationship('Entity', backref='tags', primaryjoin='Entity.id == EntityTag.entity_id_fk')

    def to_dict(self):
        return {
            self.attribute.name: self.value,
            "entity_id": self.entity_id_fk,
        }


class EntityMeta(Base):
    __tablename__ = 'Entity_Meta'

    entity_id_fk = Column(Integer, ForeignKey('Entities.id'), primary_key=True)
    meta_id_fk = Column(Integer, ForeignKey('Meta_Attributes.id'), primary_key=True)
    value = Column(String(255), nullable=False)
    delete_ts = Column(Integer, nullable=True, default=None)

    attribute = relationship('MetaAttribute', primaryjoin='EntityMeta.meta_id_fk == MetaAttribute.id')
    entity = relationship('Entity', backref='meta', primaryjoin='Entity.id == EntityMeta.entity_id_fk')

    def to_dict(self):
        return {
            self.attribute.name: self.value,
            "entity_id": self.entity_id_fk,
        }


class Alert(Base):
    __tablename__ = 'Alerts'

    id = Column(Integer, primary_key=True)
    entity_id_fk = Column(Integer, ForeignKey('Entities.id'), nullable=False)
    series_id_fk = Column(Integer, ForeignKey('Series_Attributes.id'), nullable=False)
    alert_predicate_type = Column(Enum('data_delay', 'value_too_low', 'value_too_high', name='alert_predicate_type'),
                                  nullable=False)
    value = Column(Float, nullable=False)
    is_enabled = Column(Boolean, nullable=False, default=False)
    last_check_status = Column(Boolean, nullable=True)
    alert_recipient_email = Column(String(255), nullable=True)
    delete_ts = Column(Integer, nullable=True, default=None)

    entity = relationship('Entity', backref='alerts', primaryjoin='Entity.id == Alert.entity_id_fk')
    series = relationship('SeriesAttribute', backref='alerts', primaryjoin='SeriesAttribute.id == Alert.series_id_fk')

    def to_dict(self):
        return {
            'id': self.id,
            'entity_id': self.entity_id_fk,
            'series_id': self.series_id_fk,
            'alert_predicate_type': self.alert_predicate_type,
            'value': self.value,
            'is_enabled': self.is_enabled,
            'alert_recipient_email': self.alert_recipient_email,
        }
