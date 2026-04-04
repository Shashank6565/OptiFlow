import cv2
import csv
import numpy as np
from ultralytics import YOLO
from collections import deque

# ---------------- SETTINGS ----------------
VIDEO_PATH = "../data/traffic1.mp4"
MAX_FRAMES = 50
WINDOW_SIZE = 5

# ---------------- INIT ----------------
model = YOLO("yolov8n.pt")
cap = cv2.VideoCapture(VIDEO_PATH)

# CSV
file = open("../data/lane_counts.csv", "w", newline='')
writer = csv.writer(file)
writer.writerow(["Frame","Lane0","Lane1","Lane2","Lane3"])

# Smoothing
windows = [deque(maxlen=WINDOW_SIZE) for _ in range(4)]

frame_id = 0

# ---------------- MANUAL ROI (CORRECTED) ----------------
def get_lanes(w, h):
    return [
        np.array([[0,h],[int(w*0.2),int(h*0.5)],
                  [int(w*0.3),int(h*0.5)],[int(w*0.1),h]], dtype=np.int32),

        np.array([[int(w*0.1),h],[int(w*0.3),int(h*0.5)],
                  [int(w*0.5),int(h*0.5)],[int(w*0.3),h]], dtype=np.int32),

        np.array([[int(w*0.3),h],[int(w*0.5),int(h*0.5)],
                  [int(w*0.7),int(h*0.5)],[int(w*0.5),h]], dtype=np.int32),

        np.array([[int(w*0.5),h],[int(w*0.7),int(h*0.5)],
                  [w,int(h*0.5)],[w,h]], dtype=np.int32)
    ]

# ---------------- MAIN LOOP ----------------
while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.resize(frame, (640,480))
    h, w, _ = frame.shape

    lanes = get_lanes(w, h)

    results = model(frame)

    lane_counts = [0]*4

    # ---------------- DETECTION ----------------
    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])

            if cls in [2,3,5,7]:  # vehicles
                x1,y1,x2,y2 = map(int, box.xyxy[0])

                cx = (x1 + x2) // 2
                cy = (y1 + y2) // 2

                # 🔴 debug point
                cv2.circle(frame, (cx, cy), 5, (0,0,255), -1)

                # ✅ lane logic
                lane = int((cx / w) * 4)
                lane = min(max(lane, 0), 3)
                lane = min(max(lane, 0), 3)

                lane_counts[lane] += 1

                # draw box
                cv2.rectangle(frame,(x1,y1),(x2,y2),(0,255,0),2)

    # ---------------- SMOOTHING ----------------
    smooth_counts = []
    for i in range(4):
        windows[i].append(lane_counts[i])
        avg = sum(windows[i]) // len(windows[i])
        smooth_counts.append(avg)

    # ---------------- DRAW LANES ----------------
    for i, roi in enumerate(lanes):
        cv2.polylines(frame, [roi], True, (255,0,0), 2)
        cv2.putText(frame, f"L{i}", tuple(roi[0]),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,0,0), 2)

    # ---------------- DISPLAY ----------------
    for i in range(4):
        cv2.putText(frame, f"Lane {i}: {smooth_counts[i]}",
                    (10,30+i*30),
                    cv2.FONT_HERSHEY_SIMPLEX,0.7,
                    (0,255,255),2)

    # ---------------- SAVE ----------------
    writer.writerow([frame_id] + smooth_counts)

    cv2.imshow("Final Traffic System", frame)

    frame_id += 1

    if frame_id >= MAX_FRAMES:
        break

    if cv2.waitKey(1) & 0xFF == 27:
        break

# ---------------- CLEANUP ----------------
file.close()
cap.release()
cv2.destroyAllWindows()