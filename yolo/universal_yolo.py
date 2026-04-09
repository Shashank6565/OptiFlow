import cv2
import numpy as np
import csv
import os
from ultralytics import YOLO
from tkinter import Tk, filedialog

# ---------------- INIT ----------------
model = YOLO("yolov8n.pt")

# Hide tkinter window
Tk().withdraw()

# ---------------- FILE PICKER ----------------
file_path = filedialog.askopenfilename(
    title="Select Image or Video",
    filetypes=[("Media Files", "*.jpg *.png *.jpeg *.mp4 *.avi")]
)

if not file_path:
    print("No file selected!")
    exit()

print("Selected:", file_path)

# ---------------- FIXED CSV PATH ----------------
base_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(base_dir, "..", "data", "lane_counts.csv")

# Ensure data folder exists
os.makedirs(os.path.dirname(data_path), exist_ok=True)

# Open CSV file
csv_file = open(data_path, "w", newline='')
writer = csv.writer(csv_file)
writer.writerow(["Frame","Lane0","Lane1","Lane2","Lane3"])

print("Saving CSV to:", data_path)

frame_id = 0

# ---------------- FUNCTION ----------------
def process_frame(frame):
    frame = cv2.resize(frame, (640,480))
    h, w, _ = frame.shape

    lane_counts = [0]*4

    results = model(frame)

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])

            # vehicle classes only
            if cls in [2,3,5,7]:
                x1,y1,x2,y2 = map(int, box.xyxy[0])

                cx = (x1 + x2) // 2
                cy = (y1 + y2) // 2

                # 🔴 center point
                cv2.circle(frame, (cx, cy), 5, (0,0,255), -1)

                # ✅ lane detection (robust)
                lane = int((cx / w) * 4)
                lane = min(max(lane, 0), 3)

                lane_counts[lane] += 1

                # draw bounding box
                cv2.rectangle(frame,(x1,y1),(x2,y2),(0,255,0),2)

    # display lane counts
    for i in range(4):
        cv2.putText(frame, f"Lane {i}: {lane_counts[i]}",
                    (10,30+i*30),
                    cv2.FONT_HERSHEY_SIMPLEX,0.7,
                    (0,255,255),2)

    return frame, lane_counts

# ---------------- PROCESS ----------------
if file_path.endswith((".jpg", ".png", ".jpeg")):

    # -------- IMAGE MODE --------
    frame = cv2.imread(file_path)

    if frame is None:
        print("Error loading image!")
        exit()

    output, counts = process_frame(frame)

    print("Lane Counts:", counts)

    # save one row
    writer.writerow([0] + counts)

    cv2.imshow("YOLO Image Analysis", output)
    cv2.waitKey(0)

else:
    # -------- VIDEO MODE --------
    cap = cv2.VideoCapture(file_path)

    if not cap.isOpened():
        print("Error opening video!")
        exit()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        output, counts = process_frame(frame)

        # ✅ SAVE CSV
        writer.writerow([frame_id] + counts)

        print("Frame", frame_id, ":", counts)

        frame_id += 1

        cv2.imshow("YOLO Video Analysis", output)

        if cv2.waitKey(1) & 0xFF == 27:
            break

    cap.release()

# ---------------- CLEANUP ----------------
csv_file.close()
cv2.destroyAllWindows()

print("✅ CSV saved successfully!")
print("📁 File location:", data_path)