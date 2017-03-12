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
        os.chdir(directory)
        pattern = re.compile(pattern)
        files = os.listdir('.')
        for node in get_all(Session(), Entity):
            to_read = [f for f in files if re.match(pattern, f) and os.path.getmtime(f) >= node.last_data_fetch_ts]
            for file in sorted(to_read, key=os.path.getmtime):  # get input files sorted by modification time
                InfluxWriter().write(PointGenerator(node.id, FileParser(node.id, file)))

    except Exception as err:
        logging.error(err)

if __name__ == '__main__':
    config = configparser.ConfigParser()
    config.read('config/sensors.ini')
    directory = config.get('input', 'directory')
    pattern = config.get('input', 'file_pattern')
    sleep_time = config.get('input', 'loop_time')
    while True:
        push_new_measurements(directory=directory, pattern=pattern)
        logging.info('sleeping for {} seconds'.format(sleep_time))
        time.sleep(sleep_time)
