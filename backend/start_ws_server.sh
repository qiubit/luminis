#!/bin/bash

# Starts WebSocket server. Optionally, and argument with path to virtualenv to use may be provided.
# Otherwise, current environment values will be used.

[ $# -eq 1 ] && source "./$1/bin/activate"

# Kill working screen if exists
PID=$(ps ax | grep -i screen.*websocket | grep -v grep | cut -f1 -d' ')
[ -n "$PID" ] && kill "$PID"

export PYTHONPATH=`dirname $0`

screen -d -m -S websocket ./websocket/server.py
