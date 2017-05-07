#!/usr/bin/env python3

#
# Copyright (C) 2017 Paweł Goliński
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

import configparser
import os
import urllib.request
import urllib.error
import json
import pickle
import time

from simulator.random_series_functions import RandomSinSeries, RandomConstantSeries
from simulator.data_creator import generate_data_to_file, generate_data_to_influx

BASE_URL = ''
TO_FILE = False

STATE_RETRIEVE_PROMPT = '''
Try to retrieve previous state? [Y/n] '''

INITIAL_DATA_PROMPT = '''
Create initial data? [y/N] '''

AVAILABLE_FUNCTIONS = '''
Available functions:
1 - RandomSinSeries
2 - RandomConstantSeries
'''

CREATE_TS_PROMPT = 'Enter entity creation ts (in s, -val causes ts to be now-val, empty/0 for now): '

UPDATE_PERIOD_PROMPT = 'Enter entity update period (in s): '

ENTITIES_TO_BLACKLIST_PROMPT = '''
Which entities should be turned off? (e.g. "1,2,3") 
'''


# Represent state preserved between simulator reruns
class SimulatorState(object):
    def __init__(self, create_ts: float, update_period: float, node_entity_types: map,
        entity_type_measurements: map, measurement_series: map, entity_blacklist: set, entity_series: map):
        """SimulatorState constructor

        Args:
            create_ts: timestamp (in s) representing entity creation time
            update_period: period (in s) after which measurement will be sampled
            node_entity_types: map from entity_id to entity_type_id
            entity_type_measurements: map from entity_type_id to sorted list of tuples (measurement_id, measurement_name)
            measurement_series: map from measurement_id to corresponding random_series_function constructor
            entity_blacklist: set of entity_ids for which measurements won't be produced
            entity_series: map from entity_id to map, which for given mesurement_id returns corresponding random_series_function
        """
        self.create_ts = create_ts
        self.update_period = update_period
        self.node_entity_types = node_entity_types
        self.entity_type_measurements = entity_type_measurements
        self.measurement_series = measurement_series
        self.entity_blacklist = entity_blacklist
        self.entity_series = entity_series

    def __repr__(self):
        reprString = '''create_ts: {0:f}
        update_period: {1:f}
        node_entity_types: {2:s}
        entity_type_measurements: {3:s}
        measurement_series: {4:s}
        entity_blacklist: {5:s}
        entity_series: {6:s}'''.format(
            self.create_ts,
            self.update_period,
            self.node_entity_types,
            self.entity_type_measurements,
            self.measurement_series,
            self.entity_blacklist,
            self.entity_series,
        )
        return reprString


def do_request(route, method='GET', data=None):
    request = urllib.request.Request(BASE_URL + route, data=json.dumps(data).encode('utf8') if data else None,
                                     headers={'Content-Type': 'application/json'} if method in ('POST', 'PUT') else {})
    request.get_method = lambda: method

    try:
        return json.loads(urllib.request.urlopen(request).read().decode('utf8'))
    except urllib.error.HTTPError as e:
        content = json.loads(e.read().decode('utf8'))
        print('ERROR ({}): {}'.format(content['status'], content['error']))
        return None


def get_input(text):
    return ' '.join(input(text).lower().split())


def get_config(filename):
    result = {}
    config = configparser.ConfigParser()
    config.read(filename)

    params = {"data_dir": str, "pkl_dir": str, "sensor_update_interval": float, "api_url": str, "to_file": bool}
    for param in params:
        # bool gets special treatment, as casting from string is non-trivial
        if params[param] == bool:
            result[param] = config.getboolean("simulator", param)
        else:
            result[param] = params[param](config.get("simulator", param))
    return result


def available_functions_dict():
    """Returns current mapping from number string to random_series_function"""
    available_functions = { "1": RandomSinSeries, "2": RandomConstantSeries }
    return available_functions


def get_entities_blacklist(entity_set: set) -> set:
    """Prompts user for entity_ids to blacklist

    Args:
        entity_set: set of all entity_ids
    Returns:
        set of entity_ids to blacklist
    """
    print("Available entities: " + str(entity_set))
    entities_to_blacklist = get_input(ENTITIES_TO_BLACKLIST_PROMPT)
    print("")
    if not entities_to_blacklist:
        entities_to_blacklist = []
    else:
        entities_to_blacklist = entities_to_blacklist.split(',')
    entities_to_blacklist = [int(e) for e in entities_to_blacklist]
    blacklist_set = set(e for e in entities_to_blacklist if e in entity_set)
    return blacklist_set


def should_retrieve_previous_state() -> bool:
    """Asks user whether previous app state should be retrieved

    Returns:
        parsed user answer as bool
    """
    should_retrieve = get_input(STATE_RETRIEVE_PROMPT)
    should_retrieve = should_retrieve.strip().lower()
    return should_retrieve != 'n'


def should_create_initial_data() -> bool:
    """Asks user whether past data should be created

    Returns:
        parsed user answer as bool
    """
    should_create = get_input(INITIAL_DATA_PROMPT)
    should_create = should_create.strip().lower()
    return should_create == 'y'


def retrieve_previous_state(pkl_dir: str) -> SimulatorState:
    """Retrieves previous state from saved .pkl file

    Args:
        pkl_dir: directory containing "state.pkl"
    Returns:
        previous SimulatorState
    """
    print("Retrieving previous state...")
    try:
        with open(pkl_dir + "/state.pkl", "rb") as f:
            previous_state = pickle.load(f)
    except:
        previous_state = None
        print("ERROR: Invalid previous state. Will launch initial configuration...")
    return previous_state

def should_run_update_state(previous_state: SimulatorState,
                            node_entity_types: map,
                            entity_type_measurements: map) -> bool:
    """Determines whether previous_state should be updated

    Args:
        previous_state: app state from previous run
        node_entity_types: mapping from current node_ids to entity_type_ids
        entity_type_measurements: mapping from current entity_type_ids to
            list of tuples (measurement_id, measurement_name) corresponding
            to a given entity type
    Returns:
        bool that says whether previous_state should be updated for current simulator run
    """
    return (previous_state.node_entity_types != node_entity_types or
        previous_state.entity_type_measurements != entity_type_measurements)


def should_run_initial_config(previous_state: SimulatorState,
                              node_entity_types: map,
                              entity_type_measurements: map) -> bool:
    """Determines whether initial config should be run (essentialy erasing
    data from previous simulator run)

    Args:
        same as in should_run_update_state()
    Returns:
        bool that says whether initial config should be run
    """

    # If there is no previous state, we should definately run initial config
    if not previous_state:
        return True
    # If there is some difference between entity_types, we won't try
    # to recover, just run initial config again
    elif previous_state and previous_state.entity_type_measurements != entity_type_measurements:
        return True
    else:
        # We only try to recover if some new nodes arrived, deleting nodes
        # or changing their entity type will result in runnning initial config again
        old_node_entity_types = {}
        for node in node_entity_types:
            if node in previous_state.node_entity_types:
                old_node_entity_types[node] = node_entity_types[node]
        return old_node_entity_types != previous_state.node_entity_types


def create_initial_data(state: SimulatorState, data_dir: str) -> None:
    """Generates data from state.create_ts to now for each entity"

    Args:
        state: current SimulatorState
        data_dir: directory where measurements should be saved
    """
    global TO_FILE

    current_ts = time.time()
    for node in state.node_entity_types:
        if node not in state.entity_blacklist:
            if TO_FILE:
                generate_data_to_file(state.create_ts, current_ts, node, state.entity_series[node], data_dir)
            else:
                generate_data_to_influx(state.create_ts, current_ts, node, state.entity_series[node])


def update_state(previous_state: SimulatorState,
                 node_entity_types: map,
                 entity_type_measurements: map) -> SimulatorState:
    """Creates current_state from previous_state using current node_entity_type
    and entity_type_measurements. Should only be called if the only difference
    between previous_state.node_entity_types and node_entity_types are new nodes,
    and entity_type_measurements == previous_state.entity_type_measurements

    Args:
        same as in should_run_update_state()
    Returns:
        updated, current SimulatorState
    """
    current_state = previous_state
    for node in node_entity_types:
        # For each new node_id, create all random_series_functions for their measurement_ids
        if node not in current_state.node_entity_types:
            current_state.node_entity_types[node] = node_entity_types[node]
            entity_type = node_entity_types[node]
            measurement_ids = [e[0] for e in entity_type_measurements[entity_type]]
            node_series = {}
            for measurement_id in measurement_ids:
                node_series[measurement_id] = \
                    current_state.measurement_series[measurement_id](current_state.create_ts, current_state.update_period)
            current_state.entity_series[node] = node_series
    return current_state


def update_node_blacklist(current_state):
    available_nodes = set()
    for node in current_state.node_entity_types:
        available_nodes.add(node)
    current_state.entity_blacklist = get_entities_blacklist(available_nodes)


def initial_config(node_entity_types: map, entity_type_measurements: map) -> SimulatorState:
    """Generate current SimulatorState from entity metadata and user prompts

    Args:
        node_entity_types: map from node_id to corresponding entity_type_id
        entity_type_measurements: map from entity_type_id to corresponding sorted
            list of tuples (measurement_id, measurement_name)
    Returns:
        current SimulatorState
    """

    # Parse create_ts and update_period from user
    try:       
        create_ts = get_input(CREATE_TS_PROMPT)
        update_period = get_input(UPDATE_PERIOD_PROMPT)

        if create_ts == '':
            create_ts = 0
        else:
            create_ts = float(create_ts)

        if not create_ts:
            create_ts = time.time()
        elif create_ts < 0:
            create_ts = time.time() + create_ts

        update_period = float(update_period)

    except:
        print("ERROR: Invalid input")
        exit()

    # Prompt user to choose random_series_function for each measurement_id
    print(AVAILABLE_FUNCTIONS)
    available_functions = available_functions_dict()
    measurement_series = {}
    for key in entity_type_measurements:
        print("Entity type: {0:d}".format(key))
        measurements = entity_type_measurements[key]
        for measurement in measurements:
            try:
                chosen_function = get_input(
                    "Pick function (number) for series id={0:d} ({1:s}): ".format(measurement[0], measurement[1])
                )
                measurement_series[measurement[0]] = available_functions[chosen_function]
            except:
                print("ERROR: Invalid input")
                exit()

    # Prompt user for nodes to turn off
    entities = set(node_entity_types)
    entities_blacklist = get_entities_blacklist(entities)

    # Generate random_series_function object for each measurement_id for each node
    entity_series = {}
    for node in entities:
        measurement_series_for_node = {}
        entity_type = node_entity_types[node]
        measurement_ids = [e[0] for e in entity_type_measurements[entity_type]]
        for measurement_id in measurement_ids:
            measurement_series_for_node[measurement_id] = \
                measurement_series[measurement_id](create_ts, update_period)
        entity_series[node] = measurement_series_for_node

    # Save everything in SimulatorState
    state = SimulatorState(create_ts, update_period, node_entity_types,
        entity_type_measurements, measurement_series, entities_blacklist, entity_series)

    return state


def data_generator(ss: SimulatorState, sensor_update_interval: float, data_dir: str) -> None:
    """Generates data into data_dir every sensor_update_interval seconds

    Args:
        ss: current SimulatorState
        sensor_update_interval: how often data should be generated
        data_dir: directory, where data should be saved
    """
    global TO_FILE

    print("Generating data every " + str(sensor_update_interval) + "s")
    ts = time.time()
    while True:
        time.sleep(sensor_update_interval)
        current_ts = ts + 10.0
        for node in ss.node_entity_types:
            if node not in ss.entity_blacklist:
                if TO_FILE:
                    generate_data_to_file(ts, current_ts, node, ss.entity_series[node], data_dir)
                else:
                    generate_data_to_influx(ts, current_ts, node, ss.entity_series[node])
        ts = current_ts
        print("Data generated")


def main():
    global BASE_URL
    global TO_FILE

    # Fetch simulator config
    config = get_config("config/simulator.ini")

    # Create data dir if it doesn't exist
    data_dir = config["data_dir"]
    if not os.path.isdir(data_dir):
        os.makedirs(data_dir)
    pkl_dir = config["pkl_dir"]
    if not os.path.isdir(pkl_dir):
        os.makedirs(pkl_dir)
    sensor_update_interval = config["sensor_update_interval"]
    BASE_URL = config["api_url"]
    TO_FILE = config["to_file"]

    print("Fetching metadata...")

    # Get entity metadata
    node_entity_types = {}
    for node in do_request('/node'):
        if node['id'] not in node_entity_types:
            node_entity_types[node['id']] = node['entity_type_id']

    # Get entity_type metadata
    entity_type_measurements = {}
    for entity_type in do_request('/entity_type'):
        if entity_type['id'] not in entity_type_measurements:
            entity_type_measurements[entity_type['id']] = set()
        series_for_entity_type = entity_type['series']
        for series in series_for_entity_type:
            series_id = series['id']
            series_name = series['name']
            entity_type_measurements[entity_type['id']].add((series_id, series_name))

    # Sort measurements
    for key in entity_type_measurements:
        entity_type_measurements[key] = sorted(list(entity_type_measurements[key]))

    # Prompt user for state recovery
    should_retrieve = should_retrieve_previous_state()

    previous_state = None
    current_state = None
    initial_run = False
    if should_retrieve:
        previous_state = retrieve_previous_state(pkl_dir)

    # Create current_state
    if should_run_initial_config(previous_state, node_entity_types, entity_type_measurements):
        print("Could not recover from previous state. Running initial config...")
        current_state = initial_config(node_entity_types, entity_type_measurements)
        initial_run = True
    elif not should_run_update_state(previous_state, node_entity_types, entity_type_measurements):
        current_state = previous_state
    else:
        current_state = update_state(previous_state, node_entity_types, entity_type_measurements)

    # Dump current_state
    with open(pkl_dir + "/state.pkl", "wb") as f:
        pickle.dump(current_state, f)

    # Entity_blacklist can be updated between consecutive simulator runs
    # (to allow turning nodes off)
    if not initial_run:
        update_node_blacklist(current_state)

    # Before running normal data generation, on initial simulator run, give
    # user an option to generate data from create_ts to now
    if initial_run and should_create_initial_data():
        create_initial_data(current_state, data_dir)

    # Run data generation
    data_generator(current_state, sensor_update_interval, data_dir)


if __name__ == '__main__':
    main()
