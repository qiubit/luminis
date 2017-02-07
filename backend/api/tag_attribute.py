import time
from pycnic.core import Handler

from database.model import Session, TagAttribute, EntityType, EntityTag
from .helpers import get_one, get_all


class TagAttributeHandler(Handler):

    def __init__(self):
        self.session = Session()

    def get(self, entity_type_id, ident=None):
        entity_type = get_one(self.session, EntityType, id=entity_type_id)
        if ident is None:
            return [tag.to_dict() for tag in get_all(self.session, TagAttribute, entity_type=entity_type)]
        else:
            return get_one(self.session, TagAttribute, entity_type=entity_type, id=ident).to_dict()

    def post(self, entity_type_id):
        data = self.request.data
        entity_type = get_one(self.session, EntityType, id=entity_type_id)
        tag = TagAttribute(entity_type=entity_type, name=data['name'])
        self.session.add(tag)

        self.session.commit()
        return {
            'success': True,
            'ID': tag.id
        }

    def delete(self, entity_type_id, ident):
        entity_type = get_one(self.session, EntityType, id=entity_type_id)  # check if route is correct
        tag = get_one(self.session, TagAttribute, entity_type=entity_type, id=ident)
        now = time.time()
        tag.delete_ts = now
        for entity_tag in get_all(self.session, EntityTag, name=tag):
            entity_tag.delete_ts = now

        self.session.commit()
        return {'success': True}
