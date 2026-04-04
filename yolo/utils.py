from collections import deque

class Smoother:
    def __init__(self, size=5):
        self.windows = [deque(maxlen=size) for _ in range(4)]

    def smooth(self, counts):
        result = []
        for i in range(4):
            self.windows[i].append(counts[i])
            avg = sum(self.windows[i]) // len(self.windows[i])
            result.append(avg)
        return result