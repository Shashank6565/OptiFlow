import cv2
import numpy as np
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

# ---------------- FUNCTION ----------------
def process_frame(frame):
    frame = cv2.resize(frame, (640,480))
    h, w, _ = frame.shape

    lane_counts = [0]*4

    results = model(frame)

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])

            if cls in [2,3,5,7]:
                x1,y1,x2,y2 = map(int, box.xyxy[0])

                cx = (x1 + x2) // 2
                cy = (y1 + y2) // 2

                # 🔴 center point
                cv2.circle(frame, (cx, cy), 5, (0,0,255), -1)

                # ✅ lane logic
                lane = int((cx / w) * 4)
                lane = min(max(lane, 0), 3)

                lane_counts[lane] += 1

                # draw box
                cv2.rectangle(frame,(x1,y1),(x2,y2),(0,255,0),2)

    # display counts
    for i in range(4):
        cv2.putText(frame, f"Lane {i}: {lane_counts[i]}",
                    (10,30+i*30),
                    cv2.FONT_HERSHEY_SIMPLEX,0.7,
                    (0,255,255),2)

    return frame, lane_counts

# ---------------- CHECK FILE TYPE ----------------
if file_path.endswith((".jpg", ".png", ".jpeg")):

    # -------- IMAGE MODE --------
    frame = cv2.imread(file_path)

    output, counts = process_frame(frame)

    print("Lane Counts:", counts)

    cv2.imshow("YOLO Image Analysis", output)
    cv2.waitKey(0)

else:
    # -------- VIDEO MODE --------
    cap = cv2.VideoCapture(file_path)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        output, counts = process_frame(frame)

        cv2.imshow("YOLO Video Analysis", output)

        # print counts (optional)
        print("Lane Counts:", counts)

        if cv2.waitKey(1) & 0xFF == 27:
            break

    cap.release()

cv2.destroyAllWindows()