from voluptuous import truth, message


@message('expected a non-empty string')
@truth
def non_empty_string(v):
    return isinstance(v, str) and len(v) > 0
