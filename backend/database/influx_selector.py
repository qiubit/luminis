#
# Copyright (C) 2017 Rafał Michaluk
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

import configparser
import requests


class QueryError(Exception):
    """Exception raised when in case of server error.

    Attributes:
        code -- error code sent by server
        message -- explanation of the error
    """

    def __init__(self, code, message):
        self.code = code
        self.message = message

    def __str__(self):
        return "Query error {}: {}".format(self.code, self.message)


class InfluxReader(object):
    """Used to create queries on one measurement
    """
    def __init__(self, config='config/database.ini'):
        conf = configparser.ConfigParser()
        conf.read(config)
        self._host = conf.get('influxdb', 'host')
        self._port = conf.get('influxdb', 'port')
        self._username = conf.get('influxdb', 'user')
        self._password = conf.get('influxdb', 'passwd')
        self._database = conf.get('influxdb', 'db_name')
        self._session = requests.Session()

    def query(self, measurement, attributes=('*',), constraints=(), group_by=(), apply_cols=False, only_newest=False,
              date_specifier=None):
        """
        Query influxdb for data in json format.
        Any constraints can be specified in format (<field>, [<operator>], <value>).
        If operator is omitted, "=" is assumed.

        Args:
            measurement (str): measurement we take the data from (what comes after FROM)
            attributes (tuple/str): tuple or single string of cols we want to receive (what comes after SELECT)
            constraints (iterable): Iterable of constraints
            group_by (iterable): Iterable of GROUP BY constraints
            apply_cols (bool): if set to True the function will return list of dicts in format:
                               [{<colname1>:<value1>, ...},{<colname1>:<value2>,...}, ...]
                               if set to False the function will return lists of columns names and record values
                               independently,
            only_newest (bool): if set to True only one newest result will be returned
            date_specifier (str/NoneType): if not None, database will be required to return timestamps in epoch format
                                           of selected granularity
        Returns:
            list: records in json format depending on function arguments
        """
        if type(attributes) is not tuple:
            attributes = (attributes,)
        if constraints:
            where_clause = 'WHERE '
            constraint_strings = []
            for constraint in constraints:
                if len(constraint) == 2:  # implicit operator "="
                    constraint_strings.append("{} = {}".format(*constraint))
                else:
                    constraint_strings.append("{} {} {}".format(*constraint))
            where_clause += " and ".join(constraint_strings)
        else:
            where_clause = ''

        group_by_clause = 'GROUP BY ' + ','.join(group_by) if group_by else ''
        extra_clause = 'ORDER BY time DESC LIMIT 1' if only_newest else ''

        params = dict()
        params['db'] = self._database
        if date_specifier:
            params['epoch'] = date_specifier
        params['q'] = 'SELECT ' + ','.join(attributes) + ' FROM ' + ' '.join(('"' + measurement + '"', where_clause,
                                                                              group_by_clause, extra_clause))
        response = self._session.request(
                method="GET",
                url='http://' + self._host + ':' + self._port + '/query',
                auth=(self._username, self._password),
                params=params)

        if response.status_code != 200:
            raise QueryError(response.status_code, response.json().get('error', 'unknown'))
        result = response.json().get('results', [{}])[0].get('series', [[]])[0]
        if apply_cols:
            return self._apply_cols(result)
        else:
            return result

    @staticmethod
    def _apply_cols(json):
        if not json:
            return []
        result = []
        cols = json['columns']
        values = json['values']
        for record in values:
            result.append(dict(zip(cols, record)))
        return result


'''
# Example:
ir = InfluxReader(host='localhost', port='8086', database='mydb')
print(ir.query(attributes=('time', 'value'), measurement='cpu',
               constraints=(('value', 0.63), ('time', '>', 'now() - 5m'))))
'''
