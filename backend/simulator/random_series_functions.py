import numpy as np

from simulator.series_functions import SinSeries, ConstantSeries

class RandomSinSeries(SinSeries):
    AMPLITUDE_LOW = 1.0
    AMPLITUDE_HIGH = 10.0
    FREQUENCY_LOW = 0.1
    FREQUENCY_HIGH = 2.0

    def __init__(self, create_ts, update_period):
        amplitude = np.random.uniform(self.AMPLITUDE_LOW, self.AMPLITUDE_HIGH, 1)[0]
        frequency = np.random.uniform(self.FREQUENCY_LOW, self.FREQUENCY_HIGH, 1)[0]
        phase = np.random.uniform(0.0, 2 * np.pi, 1)[0]
        super(RandomSinSeries, self).__init__(create_ts, update_period, amplitude, frequency, phase)

class RandomConstantSeries(ConstantSeries):
    CONSTANT_LOW = -5.0
    CONSTANT_HIGH = 5.0

    def __init__(self, create_ts, update_period):
        constant = np.random.uniform(self.CONSTANT_LOW, self.CONSTANT_HIGH, 1)[0]
        super(RandomConstantSeries, self).__init__(create_ts, update_period, constant)
