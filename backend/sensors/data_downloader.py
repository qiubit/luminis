#!/usr/bin/env python

import configparser
import os
import re
import time

import logging

from database.helpers import get_all
from database.model import Session, Entity
from database.telegraf import InfluxWriter, PointGenerator
from sensors.parser import FileParser


def push_new_measurements(directory, pattern):
    try:
        session = Session()
        pattern = re.compile(pattern)
        files = os.listdir(directory)
        for node in get_all(session, Entity):
            to_read = [directory + '/' + f for f in files if re.match(pattern, f) and
                       os.path.getmtime(directory + '/' + f) >= node.last_data_fetch_ts]
            # get input files sorted by modification time
            for file in sorted(to_read, key=os.path.getmtime):
                InfluxWriter().write(PointGenerator(node.id, FileParser(node.id, file)))
                node.last_data_fetch_ts = int(os.path.getmtime(file))
                session.commit()

    except Exception as err:
        logging.error(err)

if __name__ == '__main__':
    config = configparser.ConfigParser()
    config.read('config/sensors.ini')
    directory = config.get('input', 'directory')
    pattern = config.get('input', 'file_pattern')
    sleep_time = config.getint('input', 'loop_time')
    while True:
        push_new_measurements(directory=directory, pattern=pattern)
        logging.info('sleeping for {} seconds'.format(sleep_time))
        time.sleep(sleep_time)
