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
    def __init__(self,
                 host='localhost',
                 port='8086',
                 username='root',
                 password='root',
                 database='mydb'):
        self._host = host
        self._port = port
        self._username = username
        self._password = password
        self._database = database
        self._session = requests.Session()

    def query(self, measurement, attributes=('*',), constraints=(), apply_cols=False):
        """
        Query influxdb for data in json format.
        Any constraints can be specified in format (<field>, [<operator>], <value>).
        If operator is omitted, "=" is assumed.

        Args:
            measurement (str): measurement we take the data from (what comes after FROM)
            attributes (tuple/str): tuple or single string of cols we want to receive (what comes after SELECT)
            constraints (iterable): Iterable of constraints
            apply_cols (bool): if set to True the function will return list of dicts in format:
                               [{<colname1>:<value1>, ...},{<colname1>:<value2>,...}, ...]
                               if set to False the function will return lists of columns names and record values
                               independently,
        Returns: 
            str: records in json format depending on function arguments
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

        params = dict()
        params['db'] = self._database
        params['q'] = 'SELECT ' + ','.join(attributes) + ' FROM ' + measurement + ' ' + where_clause
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
        if json:
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
print(ir.query(attributes=('time', 'value'), measurement='cpu', constraints=(('value', 0.63), ('time', '>', 'now() - 5m'))))
'''
