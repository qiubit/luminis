from pycnic.core import Handler
from database.model import EntityType, Session, TagAttribute, SeriesAttribute, MetaAttribute
from .helpers import get_one, get_all


class EntityTypeHandler(Handler):

    def __init__(self):
        self.session = Session()

    def get(self, ident=None):
        if ident is None:
            return [entity_type.to_dict() for entity_type in get_all(self.session, EntityType)]
        else:
            return get_one(self.session, EntityType, ident).to_dict(deep=False)

    def post(self):
        session = Session()
        data = self.request.data
        objects_to_insert = []
        entity_type = EntityType(name=data['name'])
        session.add(entity_type)
        session.commit()  # we need to commit now to have ID of entity type

        # add tags, meta and series 
        for tag in data['tags']:
            objects_to_insert.append(TagAttribute(
                entity_type_id_fk=entity_type.id,
                name=tag,
            ))
        for meta in data['meta']:
            objects_to_insert.append(MetaAttribute(
                entity_type_id_fk=entity_type.id,
                name=meta,
            ))
        for series in data['series']:
            objects_to_insert.append(SeriesAttribute(
                entity_type_id_fk=entity_type.id,
                name=series,
            ))

        session.add_all(objects_to_insert)
        session.commit()

        return {'success': True}
