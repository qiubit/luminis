from pycnic.core import Handler
from database.model import Entity, Session, EntityTag, EntityMeta


class Node(Handler):

    def get(self, ident):
        session = Session()
        return session.query(Entity).get(ident).to_dict()

    def post(self):
        session = Session()
        data = self.request.data
        objects_to_insert = []
        entity = Entity(
            entity_type_id_fk=data['entity_type_id'],
            parent_id_fk=data['parent_id'],
        )
        session.add(entity)
        session.commit()  # we need to commit now to have ID of entity

        # add tags and meta
        for key in data:
            if 'tag_' in key:
                objects_to_insert.append(EntityTag(
                    entity_id_fk=entity.id,
                    tag_id_fk=key.split('_')[1],
                    value=data[key],
                ))
            elif 'meta_' in key:
                objects_to_insert.append(EntityMeta(
                    entity_id_fk=entity.id,
                    meta_id_fk=key.split('_')[1],
                    value=data[key],
                ))

        session.add_all(objects_to_insert)
        session.commit()

        return {'success': True}


class Tree(Handler):

    def get(self, ident=None):
        session = Session()
        if ident:
            return session.query(Entity).get(ident).to_dict(deep=True)
        else:
            return [root.to_dict(deep=True)
                    for root in session.query(Entity).filter_by(parent=None, delete_ts=None).all()]