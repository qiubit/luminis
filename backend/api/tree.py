from pycnic.core import Handler
from pycnic.errors import HTTP_404
from database.model import Entity, Session, EntityTag, EntityMeta
import json


class Node(Handler):

    def get(self, ident):
        session = Session()
        result = session.query(Entity).filter(id=ident, delete_ts=None).all()
        if len(result) == 1:
            return result[0].to_dict(deep=False)
        else:
            raise HTTP_404("Entity #{} not found.".format(ident))

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
            # TODO json.dumps() is temporary until a fix in pycnic will be merged
            # (see: https://github.com/nullism/pycnic/pull/19)
            return json.dumps([root.to_dict(deep=True)
                               for root in session.query(Entity).filter_by(parent=None, delete_ts=None).all()])
