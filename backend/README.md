s README assumes that PostgreSQL and InfluxDB databases are up and running on standard
ports, which can be done by following the `README.md` file in root directory. It describes how to run backend deamons and services needed for running Luminis frontend. Optional instructions show how to add sample data to databases, which can be useful for testing.

## Instructions
 1. Before doing anything, PostgreSQL migrations must be executed. If you haven't done this already, run:
```sh
$ alembic -c config/alembic.ini upgrade head
```
 2. You need to setup `virtualenv` to install all Python dependencies. 
```sh
$ virtualenv -p python3 venv
$ pip install -r requirements.txt
```
 3. Run Rest API for street light metadata. To do that, we supply helper script which gets your `virtalenv` name. To use it, you must `cd` into `backend` directory, and run e.g. `./start_api.sh venv`.
 4. Run WebSocket server. You can use helper script `./start_ws_server.sh` e.g. by running `./start_ws_server.sh venv`
 5. All services and deamons should be now up and running!
 
## Inputting data
There are two ways for inputting sample data. Before doing that however, all services must be up, which can be done by following instructions above.

For testing, we recommend using `backend/cli/db_init.py` script, which gets REST API server link and data file describing street light infrastructure. It assumes that database is clean, so it should be first thing done after running instructions above. Sample file is available at `backend/cli/db_init_sample/asfaltowa.meta`. Here are commands that input `asfaltowa.meta` data into running instance of Luminis backend.

```sh
$ cd <LUMINIS_ROOT>/backend
$ . venv/bin/activate
$ export PYTHONPATH=.
$ ./cli/db_init.py http://localhost:8080 ./cli/db_init_sample/asfaltowa.meta
```

For production, use `backend/cli/luminis_cli.py` which allows you to insert nodes one by one.
To run it, you can use `./start_cli.sh` helper script available in `backend` directory. (It works the same way as previous helper scripts).

