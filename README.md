# 🚦 UrbanPulse

> **AI-Powered Traffic Intelligence System**  
> Real-time vehicle detection, congestion analysis (LCSI), adaptive signal control, and traffic flow prediction using YOLOv8 + GCN-LSTM.

![Status](https://img.shields.io/badge/status-active-success)
![Python](https://img.shields.io/badge/python-3.10+-blue)
![Node](https://img.shields.io/badge/node-18+-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- 🎥 **Live Video Processing:** YOLOv8 + DeepSORT for vehicle detection & tracking
- 🧠 **AI Prediction:** GCN-LSTM-Attention model for traffic flow forecasting
- 🚦 **Adaptive Signals:** Real-time signal control based on Lane Congestion Severity Index (LCSI)
- 📡 **Real-Time Dashboard:** React + Socket.IO frontend with live updates
- 🧪 **Synthetic Mode:** Auto-fallback to simulated data if no video is detected

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/Shreya9code/UrbanPulse.git
cd urbanpulse
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```
> **Note:** Place `traffic_video.mp4` in `backend/` for **Live Mode**. Otherwise, it runs in **Synthetic Mode**.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Open Dashboard
Navigate to **`http://localhost:5173`**

---

## 📁 Project Structure

```
urbanpulse/
├── backend/
│   ├── main.py                 # FastAPI + Socket.IO server
│   ├── requirements.txt        # Python dependencies
│   ├── models/                 # GCN-LSTM model definition
│   └── utils/                  # Tracking, LCSI, Lane detection
│   └── colab_training.ipynb    # Model training script
├── frontend/
│   ├── src/
│   │   ├── components/         # React components (Dashboard, Cards, etc.)
│   │   └── App.jsx
│   └── package.json
│   
└── README.md
```

---

## ⚙️ Configuration

### Backend (`backend/.env`)
```env
fastapi
uvicorn
python-socketio
python-multipart
opencv-python
ultralytics
deep-sort-realtime
pandas
numpy
torch
torchvision
torch-geometric
opencv-python-headless
scikit-learn
Pillow
```

### Frontend (`frontend/.env.local`)
```env
VITE_API_BASE=https://marcel-unstreaming-janine.ngrok-free.dev
REACT_APP_NGROK_URL=https://marcel-unstreaming-janine.ngrok-free.dev
VITE_BACKEND_URL=http://localhost:8000
```

---

## 📡 API & WebSocket

| Event/Endpoint | Method | Description |
|----------------|--------|-------------|
| `/video_feed`  | GET    | MJPEG video stream |
| `/api/state`   | GET    | Current traffic state |
| `traffic_update` | WS   | Real-time data stream |
| `set_signal`   | WS     | Manual signal override |

---

## 📄 License

MIT License © 2024 UrbanPulse 
