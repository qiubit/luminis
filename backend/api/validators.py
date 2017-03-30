from voluptuous import truth, message
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
