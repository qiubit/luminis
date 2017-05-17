#
# Copyright (C) 2017 Paweł Goliński
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

import numpy as np

from abc import ABC, abstractmethod


class Series(ABC):
    def __init__(self, create_ts, update_period):
        # timestamp of the very first data point
        self.create_ts = create_ts
        # how often new data point is being produced
        self.update_period = update_period

    @abstractmethod
    def get_values(self, begin_ts, end_ts):
        pass

    @abstractmethod
    def get_value(self, ts):
        pass


class SinSeries(Series):
    def __init__(self, create_ts, update_period, amplitude, frequency, phase):
        self.amplitude = amplitude
        self.frequency = frequency
        self.phase = phase
        super(SinSeries, self).__init__(create_ts, update_period)

    def eval_sin(self, ts):
        if ts < self.create_ts:
            return 0.0
        else:
            time_from_create = ts - self.create_ts
            val_ts = self.amplitude * np.sin(2.0 * np.pi * self.frequency * time_from_create + self.phase)
            return val_ts

    def get_value(self, ts):
        return (ts, self.eval_sin(ts))

    def get_values(self, begin_ts, end_ts):
        vals = []
        for ts in np.arange(begin_ts, end_ts, self.update_period):
            vals.append(self.get_value(ts))
        return vals


class ConstantSeries(Series):
    def __init__(self, create_ts, update_period, constant):
        self.constant = constant
        super(ConstantSeries, self).__init__(create_ts, update_period)

    def get_value(self, ts):
        return (ts, self.constant)

    def get_values(self, begin_ts, end_ts):
        vals = []
        for ts in np.arange(begin_ts, end_ts, self.update_period):
            vals.append(self.get_value(ts))
        return vals

class GaussianSeries(Series):
    def __init__(self, create_ts, update_period, loc=0.0, scale=1.0):
        self.loc = loc
        self.scale = scale
        super(GaussianSeries, self).__init__(create_ts, update_period)

    def get_value(self, ts):
        return (ts, np.random.normal(loc=self.loc, scale=self.scale))

    def get_values(self, begin_ts, end_ts):
        vals = []
        for ts in np.arange(begin_ts, end_ts, self.update_period):
            vals.append(self.get_value(ts))
        return vals
