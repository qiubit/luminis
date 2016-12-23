from database.model import Session, Entity, SeriesAttribute


def get_measurements_for_entity(entity_id, time_from):
    """
    Given id of entity returns values of all measurements for that entity.
    :param entity_id: Database ID of entity
    :return: List of dicts with keys "name", "value" and "timestamp"
    """
    session = Session()
    entity_model = session.query(Entity).get(entity_id)
    if entity_model:
        measurements = [m.name for m in session.query(SeriesAttribute).
                        filter(SeriesAttribute.entity_type_id_fk == entity_model.entity_type_id_fk)]
        return []  # TODO we still don't have fully working pulling module
    else:
        return []


def get_current_measurements(entities, time_from):
    """
    Get current values for all measurements for given entities
    :param entities: Iterable of entity ids as ints or None if requesting getting data for all entities
    :param time_from: Timestamp from which load measurements
    :return: List of dicts with keys "id" and "measurements"
    """
    return [{"id": entity_id, "measurements": get_measurements_for_entity(entity_id, time_from)}
            for entity_id in entities]
