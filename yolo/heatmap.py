import numpy as np
import cv2

class HeatMap:
    def __init__(self):
        self.map = np.zeros((480,640), dtype=np.float32)

    def update(self, cx, cy):
        self.map[cy, cx] += 1

    def apply(self, frame):
        heat_norm = cv2.normalize(self.map,None,0,255,cv2.NORM_MINMAX)
        heat_color = cv2.applyColorMap(heat_norm.astype(np.uint8),
                                       cv2.COLORMAP_JET)

        return cv2.addWeighted(frame,0.7,heat_color,0.3,0)