#
# Copyright (C) 2017 Paweł Goliński
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.
#

import numpy as np

from simulator.series_functions import SinSeries, ConstantSeries


class RandomSinSeries(SinSeries):
    def __init__(self, create_ts, update_period,
                 amplitude_low=1.0, amplitude_high=10.0,
                 frequency_low=0.1, frequency_high=2.0):
        amplitude = np.random.uniform(amplitude_low, amplitude_high, 1)[0]
        frequency = np.random.uniform(frequency_low, frequency_high, 1)[0]
        phase = np.random.uniform(0.0, 2 * np.pi, 1)[0]
        super(RandomSinSeries, self).__init__(create_ts, update_period, amplitude, frequency, phase)


class RandomConstantSeries(ConstantSeries):
    def __init__(self, create_ts, update_period,
                 constant_low=-5.0, constant_high=5.0):
        constant = np.random.uniform(constant_low, constant_high, 1)[0]
        super(RandomConstantSeries, self).__init__(create_ts, update_period, constant)
