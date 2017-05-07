#
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#
from voluptuous import truth, message

from database.helpers import get_all
from database.model import Session


@message('expected a non-empty string')
@truth
def non_empty_string(v):
    return isinstance(v, str) and len(v) > 0


def assert_attribute_does_not_exist(cls):
    def run_assertion(data, entity_type_id, attribute_id=None):
        attributes = [m.name for m in get_all(Session(), cls, entity_type_id_fk=entity_type_id)
                      if m.id != attribute_id]
        if 'name' in data and data['name'] in attributes:
            raise ValueError("attribute {} exists for entity type {}".format(data['name'], entity_type_id))

    return run_assertion
