class AttributeDict(dict):

    def __init__(self, seq=tuple(), **kwargs):
        super().__init__(seq, **kwargs)

    def __getattr__(self, key):
        return self.get(key)

    def __setattr__(self, key, value):
        self[key] = value
