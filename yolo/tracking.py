class Tracker:
    def __init__(self):
        self.tracks = []
        self.track_id = 0

    def assign(self, cx, cy):
        for t in self.tracks:
            if abs(t[0]-cx) < 30 and abs(t[1]-cy) < 30:
                t[0], t[1] = cx, cy
                return t[2]

        self.tracks.append([cx, cy, self.track_id])
        self.track_id += 1
        return self.track_id - 1