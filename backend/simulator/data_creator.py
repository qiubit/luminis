from datetime import datetime


def create_data_timestamp(ts: float) -> str:
    """Formats timestamp the same way as it's done in client's data

    Args:
        ts: timestamp to format (in s)
    Returns:
        formatted timestamp
    """
    dt = datetime.fromtimestamp(ts)
    return "{0:04d}-{1:02d}-{2:02d} {3:02d}:{4:02d}:{5:02d}.{6:06d}".format(
        dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second, dt.microsecond
    )


def generate_data(previous_ts: float, current_ts: float, entity_id: int,
                  measurement_series: map, data_dir: str) -> None:
    """
    Generates all data between previous_ts and current_ts for entity with entity_id and
    measurements with measurement_ids and saves it into data_dir.
    measurement_series should contain map from measurement_id to series_function object

    All series_functions in measurement_series should have the same update_period

    Args:
        previous_ts: timestamp (in s) from which data should be generated
        current_ts: timestamp (in s) to which data should be generated
        entity_id: id of entity for which data should be generated
        measurement_series: map from measurement_ids to corresponding random_series_function object
            corresponding to a given entity_id
        data_dir: directory, where measurements should be saved
    """

    # Fetch measurements for each measurement_id
    measurement_points = None
    measurements = {}
    for measurement_id in measurement_series:
        series = measurement_series[measurement_id]
        measurements[measurement_id] = series.get_values(previous_ts, current_ts)
        # Save measurement_points if it hasn't been done yet
        # (every measurement will have same amount of measurement_points
        # because we're assuming that every series in measurement_series
        # has same create_ts and update_period)
        if measurement_points is None:
            measurement_points = len(measurements[measurement_id])
    if not measurements:
        return

    # Generate string with measurements
    measurementsStr = ""
    measurement_ids = sorted(list(measurements))
    for pt in range(measurement_points):
        ts = None
        line = ""
        for measurement_id in measurement_ids:
            if not ts:
                ts = measurements[measurement_id][pt][0]
                line += create_data_timestamp(ts)
            line += ","
            line += str(measurements[measurement_id][pt][1])
        line += "\n"
        measurementsStr += line

    # Save measurementsStr to file
    with open(data_dir + "/entity{0:d}_{1:s}_OK".format(entity_id, create_data_timestamp(current_ts)), "w") as f:
        f.write(measurementsStr)
