from datetime import datetime
from time import time

def create_data_timestamp(ts):
    """Formats timestamp the same way as it's done in client's data."""
    dt = datetime.fromtimestamp(ts)
    return "{0:04d}-{1:02d}-{2:02d} {3:02d}:{4:02d}:{5:02d}.{6:06d}".format(
        dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second, dt.microsecond
    )

def generate_data(previous_ts, current_ts, node_id, measurement_ids, measurement_series, data_dir):
    """
    Generates all data between previous_ts and current_ts for entity with id node_id and
    measurements with ids measurement_ids and saves it into data_dir.
    measurement_series should contain map from measurement_id to series_function.
    """
    if not measurement_ids:
        return
    measurements = {}
    for measurement_id in measurement_ids:
        series = measurement_series[measurement_id]
        measurements[measurement_id] = series.get_values(previous_ts, current_ts)
    measurement_points = len(measurements[measurement_ids[0]])
    measurementsStr = ""
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
    with open(data_dir + "/node{0:d}_{1:s}_OK".format(node_id, create_data_timestamp(current_ts)), "w") as f:
        f.write(measurementsStr)
