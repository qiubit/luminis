#!/bin/bash

# Starts data downloader process. Optionally, and argument with path to virtualenv to use may be provided.
# Otherwise, current environment values will be used.

[ $# -eq 1 ] && source "./$1/bin/activate"

# Kill working screen if exists
PID=$(ps ax | grep -i 'SCREEN.*data_downloader' | grep -v grep | awk '{print $1}')
[ -n "$PID" ] && kill "$PID"

export PYTHONPATH=`dirname $0`

screen -d -m -S data_downloader ./sensors/data_downloader.py
