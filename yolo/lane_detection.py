import cv2
import numpy as np

class LaneDetector:
    def __init__(self, mode="manual"):
        self.mode = mode

    def get_manual_lanes(self, w, h):
        return [
             np.array([[0,h],[int(w*0.25),int(h*0.6)],
                  [int(w*0.3),int(h*0.6)],[int(w*0.1),h]], dtype=np.int32),

            np.array([[int(w*0.1),h],[int(w*0.3),int(h*0.6)],
                  [int(w*0.5),int(h*0.6)],[int(w*0.3),h]], dtype=np.int32),

            np.array([[int(w*0.3),h],[int(w*0.5),int(h*0.6)],
                  [int(w*0.7),int(h*0.6)],[int(w*0.5),h]], dtype=np.int32),

            np.array([[int(w*0.5),h],[int(w*0.7),int(h*0.6)],
                  [w,int(h*0.6)],[w,h]], dtype=np.int32)
        ]

    def auto_detect(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray,50,150)

        lines = cv2.HoughLinesP(edges,1,np.pi/180,100,
                                minLineLength=100,maxLineGap=50)

        mask = np.zeros_like(frame)

        if lines is not None:
            for line in lines:
                x1,y1,x2,y2 = line[0]
                cv2.line(mask,(x1,y1),(x2,y2),(255,255,255),2)

        return mask

    def get_lane(self, cx, cy, lanes, w):
        if self.mode == "manual":
            for i, roi in enumerate(lanes):
                roi = roi.astype(np.int32)  # safety
                if cv2.pointPolygonTest(roi, (int(cx), int(cy)), False) >= 0:
                    return i
            return -1
        else:
            return int(cx/(w/4))