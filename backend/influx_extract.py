import influxdb as idb
class InfluxQuery:
    def __init__(self, client):
        self.client=client
    #@TODO doesnt' show tags, will have to write own queries parsing insetead of idb
    def query(self, measurement, tag_name, tag_value):
        # group by is due to changes in influx and problems with python-influxdb
        #@TODO SQL injection there
        query_statement='SELECT * FROM ' + measurement + ' GROUP BY *'
        return (list(self.client.query(query_statement).get_points(tags={tag_name: tag_value})))
        



class InfluxReader:
    def __init__(self,
            host='localhost',
            port=8086,
            database='mydb',
            username='root',
            password='root'):
        self.host=host
        self.port=port
        self.database=database
        self.username=username
        # password like that?!
        self.password=password
        self.client=idb.InfluxDBClient(host=host, port=port, database=database, username=username, password=password)
    def databases(self):
        return self.client.get_list_database()
    def query(self, measurement, tag_name, tag_value):
        iq=InfluxQuery(self.client)
        return iq.query(measurement=measurement, tag_name=tag_name, tag_value=tag_value)

writer = InfluxReader()
#client=idb.InfluxDBClient(host='localhost', port=8086, username=username, password=password)
print(writer.query(measurement='car', tag_name='size', tag_value='12'))
