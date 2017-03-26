# Migrations

### Requirements:
* locally installed database

### Steps:
* upgrade database to newest version: `alembic -c config/alembic.ini upgrade head`
* modify model
* create migration `alembic -c config/alembic.ini revision --autogenerate -m "message"`
* check generated migration in `alembic/versions` and fix missing fields, like default values if set in model
