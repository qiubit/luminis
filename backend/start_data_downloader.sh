#!/bin/bash

# Starts data downloader process. Optionally, and argument with path to virtualenv to use may be provided.
# Otherwise, current environment values will be used.

[ $# -eq 1 ] && source "./$1/bin/activate"
export PYTHONPATH=`dirname $0`

while true
do
    ./sensors/data_downloader.py
    sleep 15
done
