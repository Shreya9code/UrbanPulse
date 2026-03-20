# utils/tracker_fixed.py
import cv2
import numpy as np
from ultralytics import YOLO

try:
    from deep_sort_realtime.deepsort_tracker import DeepSort
    DEEPSORT_AVAILABLE = True
except Exception as e:
    print(f"⚠️ DeepSort import error: {e}")
    print("Falling back to simple tracker")
    DEEPSORT_AVAILABLE = False

class SimpleTracker:
    """Simple tracker when DeepSort isn't available"""
    def __init__(self):
        self.next_id = 0
        self.tracks = {}
        
    def update_tracks(self, detections, frame=None):
        tracks = []
        for det in detections:
            bbox, conf, cls = det
            track = SimpleTrack(self.next_id, bbox, cls)
            self.tracks[self.next_id] = track
            tracks.append(track)
            self.next_id += 1
        return tracks

class SimpleTrack:
    def __init__(self, track_id, bbox, det_class):
        self.track_id = track_id
        self.bbox = bbox
        self.det_class = det_class
        self.confirmed = True
        
    def is_confirmed(self):
        return self.confirmed
        
    def to_ltrb(self):
        x, y, w, h = self.bbox
        return [x, y, x+w, y+h]
        
    def get_det_class(self):
        return self.det_class

class VehicleTracker:
    def __init__(self):
        # Load YOLO model
        self.model = YOLO('yolov8n.pt')
        self.conf_threshold = 0.5
        self.vehicle_classes = ['car', 'bus', 'truck', 'motorcycle']
        
        # Initialize tracker (DeepSort or fallback)
        if DEEPSORT_AVAILABLE:
            try:
                self.tracker = DeepSort(max_age=30, n_init=3)
                self.use_deepsort = True
            except:
                self.use_deepsort = False
                self.tracker = SimpleTracker()
        else:
            self.use_deepsort = False
            self.tracker = SimpleTracker()
            
        print(f"✅ Tracker initialized (using {'DeepSort' if self.use_deepsort else 'SimpleTracker'})")
        
    def detect_vehicles(self, frame):
        """Run YOLO detection on frame"""
        if frame is None:
            return []
            
        results = self.model(frame, verbose=False)[0]
        detections = []
        
        for box in results.boxes:
            cls = int(box.cls[0])
            if results.names[cls] in self.vehicle_classes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = float(box.conf[0])
                if conf > self.conf_threshold:
                    detections.append((
                        [int(x1), int(y1), int(x2-x1), int(y2-y1)], 
                        conf, 
                        results.names[cls]
                    ))
        
        return detections
    
    def update_tracks(self, detections, frame):
        """Update tracker"""
        if self.use_deepsort:
            return self.tracker.update_tracks(detections, frame=frame)
        else:
            return self.tracker.update_tracks(detections)