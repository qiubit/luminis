#
# Copyright (C) 2017 Paweł Goliński
# Copyright (C) 2017 Piotr Wiśniewski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

import re
import logging

from datetime import datetime
from typing import Iterable

from database.helpers import get_one
from database.model import Session, Entity, SeriesAttribute
from database.telegraf import InfluxWriter, PointGenerator, PointSource


def create_data_timestamp(ts: float) -> str:
    """Formats timestamp the same way as it's done in client's data

    Args:
        ts: timestamp to format (in s)
    Returns:
        formatted timestamp
    """
    dt = datetime.utcfromtimestamp(ts)
    return "{0:04d}-{1:02d}-{2:02d} {3:02d}:{4:02d}:{5:02d}.{6:06d}".format(
        dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second, dt.microsecond
    )


def convert_timestamp(timestamp):
    groups = re.match('(.*) (.*)\.(.*)', timestamp).groups()
    return '{}T{}Z'.format(groups[0], groups[1])


class SimulatorSource(PointSource):
    def __init__(self, entity_id, measurements):
        self._entity_id = entity_id
        self._measurements = measurements

    def __enter__(self):
        self._session = Session()
        self._entity = get_one(self._session, Entity, id=self._entity_id)
        self._entity_measurement_names = {}
        for measurement_id in self._measurements:
            if measurement_id not in self._entity_measurement_names:
                measurement_name = get_one(self._session, SeriesAttribute, id=measurement_id).name
                self._entity_measurement_names[measurement_id] = measurement_name
        return self

    def __exit__(self, *args):
        self._entity = None
        self._entity_measurement_names = {}
        self._session.close()

    def get_values(self) -> Iterable[dict]:
        result = []
        for measurement_id in self._measurements:
            series_measurements = self._measurements[measurement_id]
            for (point_ts, point_val) in series_measurements:
                result.append({
                    'timestamp': convert_timestamp(create_data_timestamp(point_ts)),
                    'measurements': [(self._entity_measurement_names[measurement_id], float(point_val))]
                })
        return result

    def get_entity(self) -> Entity:
        return self._entity

def prepare_measurements(previous_ts: float, current_ts: float, entity_id: int,
                  measurement_series: map) -> map:
    """
    Generates all data between previous_ts and current_ts for entity with entity_id and
    measurements with measurement_ids. measurement_series should contain map from
    measurement_id to series_function object

    All series_functions in measurement_series should have the same update_period

    Args:
        previous_ts: timestamp (in s) from which data should be generated
        current_ts: timestamp (in s) to which data should be generated
        entity_id: id of entity for which data should be generated
        measurement_series: map from measurement_ids to corresponding random_series_function object
            corresponding to a given entity_id
    Returns:

    """
    # Fetch measurements for each measurement_id
    measurements = {}
    for measurement_id in measurement_series:
        series = measurement_series[measurement_id]
        measurements[measurement_id] = series.get_values(previous_ts, current_ts)
    return measurements


def generate_data_to_file(previous_ts: float, current_ts: float, entity_id: int,
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

    measurements = prepare_measurements(previous_ts, current_ts, entity_id, measurement_series)

    # We're assuming every series in measurement_series has same create_ts and update_period,
    # so all series measurements in the map will have same number of elements, as the first
    # series in map
    if measurements:
        measurement_points = len(next(iter(measurements.values())))
    else:
        return

    # Generate string with measurements
    measurements_str = ""
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
        measurements_str += line

    # Save measurementsStr to file
    with open(data_dir + "/entity{0:d}_{1:s}_OK".format(entity_id, create_data_timestamp(current_ts)), "w") as f:
        f.write(measurements_str)


def generate_data_to_influx(previous_ts: float, current_ts: float, entity_id: int,
                            measurement_series: map) -> None:
    """Function acts the same as generate_data_to_file, but saves generated measurements
    straight to InfluxDB instead (so it doesn't need data_dir argument)
    """
    measurements = prepare_measurements(previous_ts, current_ts, entity_id, measurement_series)
    if measurements:
        measurement_points = len(next(iter(measurements.values())))
    else:
        return

    try:
        with SimulatorSource(entity_id, measurements) as point_source:
            InfluxWriter().write(PointGenerator(point_source.get_entity(), point_source).generate_points())
    except Exception as err:
        logging.error(err)
