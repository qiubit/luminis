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
    entity_model = session.query(Entity).filter_by(id=entity_id, delete_ts=None).all()
    if len(entity_model) == 1:
        entity_model = entity_model[0]
        measurements = [m.name for m in session.query(SeriesAttribute).
                        filter_by(entity_type=entity_model.entity_type, delete_ts=None)]
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
    :param entities: Iterable of entity ids as ints
    :param time_from: Timestamp from which load measurements
    :return: List of dicts with keys "id" and "measurements"
    """
    return [{"id": entity_id, "measurements": get_measurements_for_entity(entity_id, time_from)}
            for entity_id in entities]
