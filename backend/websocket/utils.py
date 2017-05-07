#
# Copyright (C) 2017 Dominik Murzynowski
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

class AttributeDict(dict):

    def __init__(self, seq=tuple(), **kwargs):
        super().__init__(seq, **kwargs)

    def __getattr__(self, key):
        return self.get(key)

    def __setattr__(self, key, value):
        self[key] = value
