#!/bin/bash

# Starts alert checker process. Optionally, and argument with path to virtualenv to use may be provided.
# Otherwise, current environment values will be used.

[ $# -eq 1 ] && source "./$1/bin/activate"
export PYTHONPATH=`dirname $0`

while true
do
    ./alert/checker.py
    sleep 15
done
