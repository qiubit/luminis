import requests
import influxdb

class Error(Exception):
    """Base class for exceptions in this module."""
    pass

class QueryError(Error):
    """Exception raised when in case of server error.

    Attributes:
        code -- error code sent by server
        message -- explanation of the error
    """

    def __init__(self, expression, message):
        self.expression = expression

class InfluxReader:
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
    def query(self, measurement, attributes=('*',), where='', apply_cols=True):
        """
        Query influxdb for data in json format

        Args:
            measurement (str): measurement we take the data from (what comes after FROM)
            attributes (tuple/str): tuple or single string of cols we want to receive (what comes after SELECT)
            where (str): where statement as in influxdb docs
            apply_cols (bool): if set to True the function will return list of dicts in format:
                               [{<colname1>:<value1>, ...},{<colname1>:<value2>,...}, ...]
                               if set to False the function will return lists of columns names and record values
                               independetly,
        Returns: 
            str: records in json format depending on function arguments
        """
        if type(attributes) is not tuple:
            attributes=(attributes,)
        if where != '':
            where = 'WHERE ' + where
        params={}
        params['db'] = self._database
        params['q'] = 'SELECT ' + ','.join(attributes) + ' FROM ' + measurement + ' ' + where
        response = self._session.request(
                method = "GET",
                url='http://' + self._host + ':' + self._port + '/query',
                auth=(self._username, self._password),
                params=params)

        if(response.status_code != 200):
            raise QueryError(response.status_code, response.json().get('error', 'unknown'))
        result = response.json().get('results', [{}])[0].get('series', [[]])[0]
        if(apply_cols):
            return self._apply_cols(result)
        else:
            return result
    def _apply_cols(self, json):
        if json == []:
            return []
        result = []
        cols = json['columns']
        vals = json['values']
        for record in vals:
            result.append(dict(zip(cols, record)))
        return result

'''
# Example:
ir = InfluxReader(host='localhost', port='8086', database='mydb')
print(ir.query(attributes=('time', 'value'), measurement='cpu', where='value=0.63 or value=0.64'))
'''
