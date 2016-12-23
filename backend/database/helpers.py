from database.model import Session, Entity, SeriesAttribute
from database.influx_selector import InfluxReader


def get_measurements_for_entity(entity_id, time_from):
    """
    Given id of entity returns values of all measurements for that entity.
    :param entity_id: Database ID of entity
    :param time_from: Timestamp from which load data
    :return: List of dicts with keys "name", "value" and "timestamp"
    """
    session = Session()
    entity_model = session.query(Entity).filter(Entity.id == entity_id).filter(Entity.delete_ts == None).one()
    if entity_model:
        measurements = [m.name for m in session.query(SeriesAttribute).
                        filter(SeriesAttribute.entity_type_id_fk == entity_model.entity_type_id_fk).
                        filter(SeriesAttribute.delete_ts == None)]
        session.close()
        result = []
        reader = InfluxReader()  # TODO connection should be configurable
        for measurement in measurements:
            result.extend(reader.query(measurement,
                                       attributes=('value', 'time'),
                                       constraints=(('id', entity_id),
                                                    ('time', '>=', str(time_from) + 's')),
                                       apply_cols=True))

        return result
    else:
        session.close()
        return []


def get_current_measurements(entities, time_from):
    """
    Get current values for all measurements for given entities
    :param entities: Iterable of entity ids as ints or None if requesting getting data for all entities
    :param time_from: Timestamp from which load measurements
    :return: List of dicts with keys "id" and "measurements"
    """
    if entities is None:
        session = Session()
        entities = [entity.id for entity in session.query(Entity).filter(Entity.delete_ts == None)]
        session.close()
    return [{"id": entity_id, "measurements": get_measurements_for_entity(entity_id, time_from)}
            for entity_id in entities]
