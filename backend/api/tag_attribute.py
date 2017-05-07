#
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

import time
from pycnic.core import Handler
from pycnic.utils import requires_validation
from voluptuous import Schema, Required

from .validators import non_empty_string, assert_attribute_does_not_exist
from database.model import Session, TagAttribute, EntityType, EntityTag
from database.helpers import get_all, get_one, update_last_data_modification_ts


class TagAttributeHandler(Handler):

    def __init__(self):
        self.session = Session()

    def get(self, entity_type_id, ident=None):
        entity_type = get_one(self.session, EntityType, id=entity_type_id)
        if ident is None:
            return [tag.to_dict() for tag in get_all(self.session, TagAttribute, entity_type=entity_type)]
        else:
            return get_one(self.session, TagAttribute, entity_type=entity_type, id=ident).to_dict()

    @requires_validation(assert_attribute_does_not_exist(TagAttribute), with_route_params=True)
    @requires_validation(Schema({Required('name'): non_empty_string}))
    def post(self, entity_type_id):
        data = self.request.data
        entity_type = get_one(self.session, EntityType, id=entity_type_id)
        tag = TagAttribute(entity_type=entity_type, name=data['name'])
        self.session.add(tag)

        self.session.commit()
        update_last_data_modification_ts(self.session)
        return {
            'success': True,
            'ID': tag.id
        }

    def delete(self, entity_type_id, ident):
        entity_type = get_one(self.session, EntityType, id=entity_type_id)  # check if route is correct
        tag = get_one(self.session, TagAttribute, entity_type=entity_type, id=ident)
        now = time.time()
        tag.delete_ts = now
        for entity_tag in get_all(self.session, EntityTag, attribute=tag):
            entity_tag.delete_ts = now

        self.session.commit()
        update_last_data_modification_ts(self.session)
        return {'success': True}
