from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class EntityType(Base):
    __tablename__ = 'Entity_Types'

    id = Column(Integer, primary_key=True)
    name = Column(String(255))

    tags = relationship('TagAttribute', backref='entity_type', primaryjoin='id == TagAttribute.entity_type_id')
    series = relationship('SeriesAttribute', backref='entity_type', primaryjoin='id == SeriesAttribute.entity_type_id')
    meta = relationship('MetaAttributes', backref='entity_type', primaryjoin='id == MetaAttribute.entity_type_id')


class TagAttribute(Base):
    __tablename__ = 'Tag_Attributes'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    entity_type_id = Column('entity_type_ID_FK', Integer, ForeignKey(EntityType.id, ondelete='CASCADE'),
                            nullable=False)


class SeriesAttribute(Base):
    __tablename__ = 'Series_Attributes'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    entity_type_id = Column('entity_type_ID_FK', Integer, ForeignKey(EntityType.id, ondelete='CASCADE'),
                            nullable=False)


class MetaAttribute(Base):
    __tablename__ = 'Meta_Attributes'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    entity_type_id = Column('entity_type_ID_FK', Integer, ForeignKey(EntityType.id, ondelete='CASCADE'),
                            nullable=False)


class Entity(Base):
    __tablename__ = 'Entities'

    id = Column(Integer, primary_key=True)
    entity_type_id = Column('entity_type_ID_FK', Integer, ForeignKey(EntityType.id, ondelete='CASCADE'),
                            nullable=False)
    parent_id = Column('parent_ID_FK', Integer, ForeignKey(Entity.id, ondelete='CASCADE'), nullable=True)

    entity_type = relationship(EntityType, primaryjoin=entity_type_id == EntityType.id)
    parent = relationship(Entity, primaryjoin=parent_id == Entity.id)
    tags = relationship('EntityTag', backref='entity', primaryjoin='id == EntityTag.entity_id')
    meta = relationship('EntityMeta', backref='entity', primaryjoin='id == EntityMeta.entity_id')


class EntityTag(Base):
    __tablename__ = 'Entity_Tags'

    entity_id = Column('entity_ID_FK', Integer, ForeignKey(Entity.id, ondelete='CASCADE'), primary_key=True)
    tag_id = Column('tag_ID_FK', Integer, ForeignKey(TagAttribute.id, ondelete='CASCADE'), primary_key=True)
    value = Column(String(255), nullable=False)

    tag = relationship(TagAttribute, primaryjoin=tag_id == TagAttribute.id)


class EntityMeta(Base):
    __tablename__ = 'Entity_Meta'

    entity_id = Column('entity_ID_FK', Integer, ForeignKey(Entity.id, ondelete='CASCADE'), primary_key=True)
    meta_id = Column('meta_ID_FK', Integer, ForeignKey(MetaAttribute.id, ondelete='CASCADE'), primary_key=True)
    value = Column(String(255), nullable=False)

    tag = relationship(MetaAttribute, primaryjoin=tag_id == MetaAttribute.id)

