def get_measurements_for_entity(entity_id):
    """
    Given id of entity returns values of all measurements for that entity.
    :param entity_id: Database ID of entity
    :return: List of dicts with keys "name", "value" and "timestamp"
    """
    pass  # TODO we still don't have fully working pulling module


def get_current_measurements(entities):
    """
    Get current values for all measurements for given entities
    :param entities: Iterable of entity ids as ints or None if requesting getting data for all entities
    :return: List of dicts with keys "id" and "measurements"
    """
    return [{"id": entity_id, "measurements": get_measurements_for_entity(entity_id)} for entity_id in entities]
