import numpy as np

class Series():
    def __init__(self, create_ts, update_period):
        # timestamp of the very first data point
        self.create_ts = create_ts
        # how often new data point is being produced
        self.update_period = update_period

    def get_values(self, begin_ts, end_ts):
        pass

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

    def get_values(self, begin_ts, end_ts):
        vals = []
        for ts in np.arange(begin_ts, end_ts, self.update_period):
            vals.append((ts, self.eval_sin(ts)))
        return vals

    def get_value(self, ts):
        return (ts, self.eval_sin(ts))

class ConstantSeries(Series):
    def __init__(self, create_ts, update_period, constant):
        self.constant = constant
        super(ConstantSeries, self).__init__(create_ts, update_period)

    def get_values(self, begin_ts, end_ts):
        vals = []
        for ts in np.arange(begin_ts, end_ts, self.update_period):
            vals.append((ts, self.constant))
        return vals

    def get_value(self, ts):
        return self.constant
