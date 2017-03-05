import time
from pycnic.core import Handler

from database.model import Session, SeriesAttribute, EntityType
from database.helpers import get_all, get_one


class SeriesAttributeHandler(Handler):
    def __init__(self):
        self.session = Session()

    def get(self, entity_type_id, ident=None):
        entity_type = get_one(self.session, EntityType, id=entity_type_id)
        if ident is None:
            return [series.to_dict() for series in get_all(self.session, SeriesAttribute, entity_type=entity_type)]
        else:
            return get_one(self.session, SeriesAttribute, entity_type=entity_type, id=ident).to_dict()

    def post(self, entity_type_id):
        data = self.request.data
        entity_type = get_one(self.session, EntityType, id=entity_type_id)
        series = SeriesAttribute(entity_type=entity_type, name=data['name'])
        self.session.add(series)

        self.session.commit()
        return {
            'success': True,
            'ID': series.id
        }

    def delete(self, entity_type_id, ident):
        entity_type = get_one(self.session, EntityType, id=entity_type_id)  # check if route is correct
        series = get_one(self.session, SeriesAttribute, entity_type=entity_type, id=ident)
        series.delete_ts = time.time()

        self.session.commit()
        return {'success': True}
