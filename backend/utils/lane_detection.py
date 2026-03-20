# utils/lane_detection.py
import numpy as np
import cv2

# Lane polygons (normalized coordinates 0-1)
LANE_POLYGONS = {
    "Lane_1": np.array([
        [0.58, 0.05], [0.68, 0.05], [0.70, 0.45], [0.60, 0.45]
    ]),
    "Lane_2": np.array([
        [0.45, 0.05], [0.75, 0.05], [0.75, 0.20], [0.45, 0.20]
    ]),
    "Lane_3": np.array([
        [0.35, 0.60], [0.45, 0.60], [0.50, 0.95], [0.40, 0.95]
    ])
}

def get_lane_id(centroid_x, centroid_y, frame_h, frame_w):
    """Determines which lane a vehicle centroid belongs to."""
    norm_x = centroid_x / frame_w
    norm_y = centroid_y / frame_h
    point = np.array([[norm_x, norm_y]], dtype=np.float32)

    for lane_name, poly in LANE_POLYGONS.items():
        dist = cv2.pointPolygonTest(poly.astype(np.float32), (norm_x, norm_y), measureDist=False)
        if dist >= 0:
            return lane_name
    return "Unknown"