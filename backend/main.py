# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn
import asyncio
import cv2
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from datetime import datetime
import socketio
import queue
import os
import time
from pydantic import BaseModel

# ✅ Import your ML components
try:
    from models.traffic_model import GCN_LSTM_Attn
    from utils.lane_detection import get_lane_id, LANE_POLYGONS
    from utils.tracker import VehicleTracker
    from utils.lcsi_calculator import LCSICalculator
    ML_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ ML modules not found: {e}")
    ML_AVAILABLE = False

# ═══════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════
VIDEO_PATH = "traffic_video.mp4"
USE_SYNTHETIC = not os.path.exists(VIDEO_PATH)
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# ═══════════════════════════════════════════════════════════
# FASTAPI SETUP
# ═══════════════════════════════════════════════════════════
app = FastAPI(title="UrbanPulse Traffic Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════
# SOCKET.IO SETUP
# ═══════════════════════════════════════════════════════════
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=['http://localhost:3000', 'http://localhost:5173', '*']
)
socket_app = socketio.ASGIApp(sio, app, socketio_path='/socket.io')

# ═══════════════════════════════════════════════════════════
# DATA MODELS
# ═══════════════════════════════════════════════════════════
class SignalControl(BaseModel):
    lane_id: str
    state: str

class TrafficConfig(BaseModel):
    mode: str
    interval: int = 2

# ═══════════════════════════════════════════════════════════
# TRAFFIC PROCESSOR
# ═══════════════════════════════════════════════════════════
class TrafficProcessor:
    def __init__(self):
        self.running = False
        self.mode = "synthetic" if USE_SYNTHETIC else "live"
        self.update_interval = 2
        self.frame_queue = queue.Queue(maxsize=10)
        self.device = DEVICE
        self.load_models()
        
        if ML_AVAILABLE:
            self.tracker = VehicleTracker()
            self.lcsi_calc = LCSICalculator(window_size=10)
        else:
            self.tracker = None
            self.lcsi_calc = None
        
        # ✅ FIXED: NO TRAILING SPACES IN KEYS
        self.state = {
            "lanes": {
                "Lane_1": {"count": 0, "lcsi": 0, "wait": 0},
                "Lane_2": {"count": 0, "lcsi": 0, "wait": 0},
                "Lane_3": {"count": 0, "lcsi": 0, "wait": 0},
            },
            "signals": {"Lane_1": "red", "Lane_2": "red", "Lane_3": "red"},
            "predicted": {"Lane_1": 0, "Lane_2": 0, "Lane_3": 0},
            "impact": {"co2Saved": 0, "timeSaved": 0},
            "mode": self.mode,
            "prediction_history": []
        }
        
        self.processing_thread = None
        self.cap = None
        self.current_frame = None
    
    def load_models(self):
        if not ML_AVAILABLE:
            print("⚠️ ML modules not available. Using simple prediction.")
            self.model = None
            return
        
        try:
            self.model = GCN_LSTM_Attn(
                num_nodes=3,
                in_channels=1,
                hidden_dim=32
            ).to(self.device)
            
            model_path = "models/urbanpulse_model.pth"
            if os.path.exists(model_path):
                self.model.load_state_dict(torch.load(model_path, map_location=self.device))
                print("✅ Model loaded successfully")
            else:
                print("⚠️ No pre-trained model found, using untrained model")
                for param in self.model.parameters():
                    nn.init.normal_(param, mean=0.0, std=0.1)
            
            self.model.eval()
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            self.model = None
    
    async def process_frame(self, frame):
        if frame is None or not ML_AVAILABLE or self.tracker is None:
            self.current_frame = frame
            return
        
        try:
            detections = self.tracker.detect_vehicles(frame)
            tracks = self.tracker.update_tracks(detections, frame)
            
            lane_counts = {"Lane_1": 0, "Lane_2": 0, "Lane_3": 0}
            
            for track in tracks:
                if not track.is_confirmed():
                    continue
                
                # ✅ FIXED: Handle both [l,t,r,b] and [l,t,w] formats
                bbox = track.to_ltrb()
                if len(bbox) == 4:
                    left, top, right, bottom = bbox
                elif len(bbox) == 3:
                    left, top, width = bbox
                    right = left + width
                    bottom = top + width
                else:
                    continue
                
                cx = (left + right) / 2
                cy = (top + bottom) / 2
                
                lane_id = get_lane_id(cx, cy, frame.shape[0], frame.shape[1])
                if lane_id in lane_counts:
                    lane_counts[lane_id] += 1
            
            # ✅ FIXED: Keys without trailing spaces
            for lane in lane_counts:
                self.state["lanes"][lane]["count"] = lane_counts[lane]
                if self.lcsi_calc:
                    lcsi_value = self.lcsi_calc.update(lane, lane_counts[lane])
                    self.state["lanes"][lane]["lcsi"] = lcsi_value
                    self.state["lanes"][lane]["wait"] = lcsi_value * 45
            
            self.update_signals()
            self.current_frame = self.annotate_frame(frame, tracks)
            
        except Exception as e:
            print(f"❌ Frame processing error: {e}")
            self.current_frame = frame
    
    def annotate_frame(self, frame, tracks):
        if not ML_AVAILABLE:
            return frame
        
        annotated = frame.copy()
        for track in tracks:
            if track.is_confirmed():
                bbox = track.to_ltrb()
                if len(bbox) >= 4:
                    cv2.rectangle(annotated, (int(bbox[0]), int(bbox[1])),
                                 (int(bbox[2]), int(bbox[3])), (0, 255, 0), 2)
                    cv2.putText(annotated, f"ID:{track.track_id}",
                               (int(bbox[0]), int(bbox[1]) - 10),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        return annotated
    
    def update_signals(self):
        lcsi_values = {
            lane: self.state["lanes"][lane]["lcsi"]
            for lane in self.state["lanes"]
        }
        
        max_lane = max(lcsi_values, key=lcsi_values.get)
        max_lcsi = lcsi_values[max_lane]  # ✅ FIXED: was "max_l csi"
        
        if max_lcsi > 0.7:
            for lane in self.state["signals"]:
                self.state["signals"][lane] = "green" if lane == max_lane else "red"
        elif max_lcsi > 0.4:
            current_time = datetime.now().second
            green_lane = list(self.state["lanes"].keys())[current_time % 3]
            for lane in self.state["signals"]:
                self.state["signals"][lane] = "green" if lane == green_lane else "red"
    
    async def predict_next(self):
        if self.model is None or not ML_AVAILABLE or self.lcsi_calc is None:
            return
        
        try:
            historical = self.lcsi_calc.get_historical(sequence_length=5)
            if len(historical) < 5:
                return
            
            historical = np.array(historical)
            if historical.ndim == 1:
                historical = historical.reshape(-1, 1)
            if historical.shape[1] < 3:
                padding = np.zeros((historical.shape[0], 3 - historical.shape[1]))
                historical = np.hstack([historical, padding])
            
            input_tensor = torch.FloatTensor(historical).unsqueeze(0).unsqueeze(-1).to(self.device)
            edge_index = torch.tensor([[0,1,2,0,1,2], [1,2,0,2,0,1]], dtype=torch.long).to(self.device)
            
            with torch.no_grad():  # ✅ FIXED: was "no_gra d()"
                predictions = self.model(input_tensor, edge_index)
                predictions = predictions.cpu().numpy()
                
                if predictions.ndim > 1:
                    predictions = predictions.squeeze()
                if predictions.ndim == 0:
                    predictions = np.array([predictions, predictions, predictions])
                elif len(predictions) < 3:
                    predictions = np.pad(predictions, (0, 3 - len(predictions)), 'constant')
            
            lanes = ["Lane_1", "Lane_2", "Lane_3"]
            for i, lane in enumerate(lanes):
                try:
                    self.state["predicted"][lane] = float(predictions[i])
                except (IndexError, TypeError):
                    self.state["predicted"][lane] = 0.0
            
            try:
                actual_val = float(historical[-1][0]) if len(historical[-1]) > 0 else 0.0
            except (IndexError, TypeError):
                actual_val = 0.0
                
            self.state["prediction_history"].append({
                "time": datetime.now().strftime("%H:%M:%S"),
                "actual": actual_val,
                "predicted": float(predictions[0])
            })
            
            if len(self.state["prediction_history"]) > 25:
                self.state["prediction_history"] = self.state["prediction_history"][-25:]
                
        except Exception as e:
            print(f"Prediction error: {e}")
    
    def generate_synthetic_data(self):
        import math
        
        current_second = datetime.now().second
        current_minute = datetime.now().minute
        t = (current_minute * 60 + current_second) / 60
        
        lane1_count = max(2, int(8 + 5 * math.sin(t * 0.5) + np.random.randint(-2, 3)))
        lane2_count = max(1, int(4 + 3 * math.sin(t * 0.3 + 2) + np.random.randint(-1, 2)))
        lane3_count = max(3, int(10 + 6 * math.sin(t * 0.4 + 1) + np.random.randint(-3, 4)))
        
        counts = [lane1_count, lane2_count, lane3_count]
        
        for i, lane in enumerate(["Lane_1", "Lane_2", "Lane_3"]):
            count = counts[i]
            self.state["lanes"][lane]["count"] = count
            lcsi = min(1.0, count / 20)
            self.state["lanes"][lane]["lcsi"] = round(lcsi, 2)
            self.state["lanes"][lane]["wait"] = round(lcsi * 60, 1)
            
            if self.lcsi_calc:
                self.lcsi_calc.update(lane, count)
        
        self.update_signals()
        asyncio.create_task(self.predict_next())
        
        total_wait_reduction = sum(
            (self.state["lanes"][lane]["lcsi"] * 30)
            for lane in self.state["lanes"]
        )
        
        self.state["impact"] = {
            "co2Saved": round(total_wait_reduction * 0.5, 1),
            "timeSaved": round(total_wait_reduction / 60, 1),
            "fuelSaved": round(total_wait_reduction * 0.05, 2)
        }
    
    async def run(self):
        self.running = True
        
        if self.mode == "live" and os.path.exists(VIDEO_PATH):
            self.cap = cv2.VideoCapture(VIDEO_PATH)
            
            if not self.cap.isOpened():
                print("❌ Could not open video. Falling back to synthetic.")
                self.mode = "synthetic"
                await self.run_synthetic()
                return
            
            print(f"🎬 Live mode: {VIDEO_PATH}")
            
            while self.running:
                ret, frame = self.cap.read()
                if not ret:
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                
                await self.process_frame(frame)
                
                if int(self.cap.get(cv2.CAP_PROP_POS_FRAMES)) % 30 == 0:
                    await self.predict_next()
                
                await asyncio.sleep(1/30)
            
            self.cap.release()
        else:
            await self.run_synthetic()
    
    async def run_synthetic(self):
        print("🧪 Synthetic mode active")
        while self.running:
            self.generate_synthetic_data()
            await asyncio.sleep(self.update_interval)
    
    def stop(self):
        self.running = False
        if self.cap is not None:
            self.cap.release()

# ═══════════════════════════════════════════════════════════
# GLOBAL PROCESSOR
# ═══════════════════════════════════════════════════════════
processor = TrafficProcessor()

# ═══════════════════════════════════════════════════════════
# SOCKET.IO EVENTS
# ═══════════════════════════════════════════════════════════
@sio.event
async def connect(sid, environ):
    print(f"✅ Client connected: {sid}")
    await sio.emit('connect_ack', {'status': 'connected'}, room=sid)
    await sio.emit('traffic_update', processor.state, room=sid)

@sio.event
async def disconnect(sid):
    print(f"❌ Client disconnected: {sid}")

@sio.event
async def start_monitoring(sid, data):
    if data.get('mode'):
        processor.mode = data['mode']
    if not processor.running:
        asyncio.create_task(processor.run())
    asyncio.create_task(send_traffic_updates(sid))

@sio.event
async def set_signal(sid, data: dict):
    lane = data.get('lane_id')
    state = data.get('state')
    if lane in processor.state['signals']:
        processor.state['signals'][lane] = state
        await sio.emit('signal_updated', {'lane': lane, 'state': state})

async def send_traffic_updates(sid):
    while processor.running:
        update_data = {
            "lanes": processor.state["lanes"],
            "signals": processor.state["signals"],
            "predicted": processor.state["predicted"],
            "impact": {
                "co2Saved": processor.state["impact"]["co2Saved"],
                "timeSaved": processor.state["impact"]["timeSaved"]
            },
            "mode": processor.mode
        }
        await sio.emit('traffic_update', update_data, room=sid)
        await asyncio.sleep(processor.update_interval)

# ═══════════════════════════════════════════════════════════
# REST API ENDPOINTS
# ═══════════════════════════════════════════════════════════
@app.get("/")
async def root():
    return {"message": "UrbanPulse Traffic Intelligence API", "status": "online"}

@app.get("/api/status")
async def get_status():
    return {
        "connected": processor.running,
        "mode": processor.mode,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/state")
async def get_state():
    return processor.state

@app.post("/api/config")
async def update_config(config: TrafficConfig):
    processor.mode = config.mode
    processor.update_interval = config.interval
    return {"status": "updated", "config": config}

@app.post("/api/signal")
async def control_signal(control: SignalControl):
    if control.lane_id in processor.state["signals"]:
        processor.state["signals"][control.lane_id] = control.state
        await sio.emit('signal_updated', {
            'lane': control.lane_id,
            'state': control.state
        })
        return {"status": "success", "signal": control}
    return {"status": "error", "message": "Invalid lane"}

@app.get("/api/history")
async def get_history(points: int = 50):
    history = processor.state["prediction_history"][-points:]
    return {"history": history}

@app.get("/video_feed")
async def video_feed():
    async def generate():
        while True:
            if processor.mode == "live" and processor.current_frame is not None:
                _, jpeg = cv2.imencode('.jpg', processor.current_frame, 
                                       [cv2.IMWRITE_JPEG_QUALITY, 70])
            else:
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(frame, f"UrbanPulse - SYNTHETIC MODE",
                           (80, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(frame, f"Vehicles: {sum(l['count'] for l in processor.state['lanes'].values())}",
                           (100, 260), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                _, jpeg = cv2.imencode('.jpg', frame)
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n')
            await asyncio.sleep(0.1)
    
    return StreamingResponse(generate(), media_type='multipart/x-mixed-replace; boundary=frame')

# ═══════════════════════════════════════════════════════════
# STARTUP/SHUTDOWN
# ═══════════════════════════════════════════════════════════
@app.on_event("startup")
async def startup_event():
    print("🚀 UrbanPulse backend starting...")
    print(f"📹 Video Path: {VIDEO_PATH}")
    print(f"🎯 Mode: {'LIVE' if not USE_SYNTHETIC else 'SYNTHETIC'}")
    asyncio.create_task(processor.run())
    print("✅ UrbanPulse backend started")

@app.on_event("shutdown")
async def shutdown_event():
    processor.stop()
    print("👋 UrbanPulse backend stopped")

# ═══════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════
if __name__ == "__main__":  # ✅ FIXED: was "if name"
    uvicorn.run(
        "main:socket_app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )