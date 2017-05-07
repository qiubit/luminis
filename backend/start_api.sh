#!/bin/bash

#
# Copyright (C) 2017 Paweł Goliński
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

# Starts REST API server. Optionally, and argument with path to virtualenv to use may be provided.
# Otherwise, current environment values will be used.

[ $# -eq 1 ] && source "./$1/bin/activate"
export PYTHONPATH=`dirname $0`
./api/app.py
