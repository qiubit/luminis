import configparser

from sqlalchemy import Column, Integer, String, ForeignKey
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


engine = create_engine(create_engine_str(), echo=True)

Session = sessionmaker(bind=engine)

Base = declarative_base()


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

    entity_type = relationship('EntityType', backref='series',
                               primaryjoin='EntityType.id == SeriesAttribute.entity_type_id_fk')

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "entity_type_id": self.entity_type_id_fk,
        }


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

    entity_type = relationship('EntityType', primaryjoin='Entity.entity_type_id_fk == EntityType.id')
    parent = relationship('Entity', backref='children', remote_side='Entity.id',
                          primaryjoin='Entity.parent_id_fk == Entity.id')

    def to_dict(self, deep=False):
        result = {
            "id": self.id,
            "entity_type": self.entity_type_id_fk,
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
