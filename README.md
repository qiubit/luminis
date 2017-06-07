# Luminis
Luminis is React powered street light visualization system. It supports live data display, live and past chart display with custom aggregation and simple anomaly alert mechanisms.

### Requirements
 - python3
 - virtualenv
 - docker
 - docker-compose
 - node.js
 - npm

### Instructions
To create running instance of Luminis you'll first need to run several backend services and daemons. Before doing that, make sure you have `docker` and `docker-compose` installed.

 1. Enter root directory
 2. Run `docker-compose up`. If everything goes well, you should now have PostgreSQL instance running at port 5432, and InfluxDB instance running at port 8086. If you're using provided STORAGE skip the next step.
 3. Create InfluxDB database by running `curl -XPOST http://localhost:8086/query --data-urlencode 'q=CREATE DATABASE mydb'`
 4. Enter `backend` directory, and follow the instructions contained in `README.md` there.

All backend services should now be running on your system. To run frontend for Luminis, you should now enter `frontend` directory, and follow the instructions there.

## License
MIT
