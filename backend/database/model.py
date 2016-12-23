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


Base = declarative_base()

engine = create_engine(create_engine_str(), echo=True)

Session = sessionmaker(bind=engine)


class EntityType(Base):
    __tablename__ = 'Entity_Types'

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    delete_ts = Column(Integer, nullable=True, default=None)


class TagAttribute(Base):
    __tablename__ = 'Tag_Attributes'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    entity_type_id_fk = Column(Integer, ForeignKey('Entity_Types.id'), nullable=False)
    delete_ts = Column(Integer, nullable=True, default=None)

    entity_type = relationship('EntityType', backref='tags',
                               primaryjoin='EntityType.id == TagAttribute.entity_type_id_fk')


class SeriesAttribute(Base):
    __tablename__ = 'Series_Attributes'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    entity_type_id_fk = Column(Integer, ForeignKey('Entity_Types.id'), nullable=False)
    delete_ts = Column(Integer, nullable=True, default=None)

    entity_type = relationship('EntityType', backref='series',
                               primaryjoin='EntityType.id == SeriesAttribute.entity_type_id_fk')


class MetaAttribute(Base):
    __tablename__ = 'Meta_Attributes'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    entity_type_id_fk = Column(Integer, ForeignKey('Entity_Types.id'), nullable=False)
    delete_ts = Column(Integer, nullable=True, default=None)

    entity_type = relationship('EntityType', backref='meta',
                               primaryjoin='EntityType.id == MetaAttribute.entity_type_id_fk')


class Entity(Base):
    __tablename__ = 'Entities'

    id = Column(Integer, primary_key=True)
    entity_type_id_fk = Column(Integer, ForeignKey('Entity_Types.id'), nullable=False)
    parent_id_fk = Column(Integer, ForeignKey('Entities.id'), nullable=True)
    delete_ts = Column(Integer, nullable=True, default=None)

    entity_type = relationship('EntityType', primaryjoin='Entity.entity_type_id_fk == EntityType.id')
    parent = relationship('Entity', primaryjoin='Entity.parent_id_fk == Entity.id')


class EntityTag(Base):
    __tablename__ = 'Entity_Tags'

    entity_id_fk = Column(Integer, ForeignKey('Entities.id'), primary_key=True)
    tag_id_fk = Column(Integer, ForeignKey('Tag_Attributes.id'), primary_key=True)
    value = Column(String(255), nullable=False)
    delete_ts = Column(Integer, nullable=True, default=None)

    name = relationship('TagAttribute', primaryjoin='EntityTag.tag_id_fk == TagAttribute.id')
    entity = relationship('Entity', backref='tags', primaryjoin='Entity.id == EntityTag.entity_id_fk')


class EntityMeta(Base):
    __tablename__ = 'Entity_Meta'

    entity_id_fk = Column(Integer, ForeignKey('Entities.id'), primary_key=True)
    meta_id_fk = Column(Integer, ForeignKey('Meta_Attributes.id'), primary_key=True)
    value = Column(String(255), nullable=False)
    delete_ts = Column(Integer, nullable=True, default=None)

    name = relationship('MetaAttribute', primaryjoin='EntityMeta.meta_id_fk == MetaAttribute.id')
    entity = relationship('Entity', backref='meta', primaryjoin='Entity.id == EntityMeta.entity_id_fk')
