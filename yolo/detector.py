from ultralytics import YOLO

class VehicleDetector:
    def __init__(self):
        self.model = YOLO("yolov8n.pt")

    def detect(self, frame):
        results = self.model(frame)
        detections = []

        for r in results:
            for box in r.boxes:
                cls = int(box.cls[0])
                if cls in [2,3,5,7]:
                    x1,y1,x2,y2 = map(int, box.xyxy[0])
                    detections.append((x1,y1,x2,y2))

        return detections