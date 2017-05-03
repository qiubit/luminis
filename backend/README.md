# Migrations

### Requirements:
* locally installed database

### Steps:
* upgrade database to newest version: `alembic -c config/alembic.ini upgrade head`
* modify model
* create migration `alembic -c config/alembic.ini revision --autogenerate -m "message"`
* check generated migration in `alembic/versions` and fix missing fields, like default values if set in model

# Alerts

### How to start:
* set connection settings of your SMTP server in `config/alert.ini`
* use `./start_alert_checker.sh` to start server

### When emails are sent:
* on first check of new alert
* when alert status is OK, but was not on last check
* when alert status was OK on last check, but is not now
