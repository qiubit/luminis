#!/usr/bin/env python

#
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

import configparser
import os
import re

import logging

from database.helpers import get_all
from database.model import Session, Entity
from database.telegraf import InfluxWriter, PointGenerator
from sensors.parser import FileParser


def push_new_measurements(directory, pattern):
    session = Session()
    files = os.listdir(directory)
    for node in get_all(session, Entity):
        to_read = [directory + '/' + f for f in files if re.match(pattern.format(ID=node.id), f) and
                   os.path.getmtime(directory + '/' + f) >= node.last_data_fetch_ts]
        # get input files sorted by modification time
        for file in sorted(to_read, key=os.path.getmtime):
            try:
                InfluxWriter().write(PointGenerator(node, FileParser(node.id, file)).generate_points())
                node.last_data_fetch_ts = int(os.path.getmtime(file))
                session.commit()
            except Exception as err:
                logging.error(err)

    session.close()


if __name__ == '__main__':
    config = configparser.ConfigParser()
    config.read('config/sensors.ini')
    directory = config.get('input', 'directory')
    pattern = config.get('input', 'file_pattern')
    push_new_measurements(directory=directory, pattern=pattern)
