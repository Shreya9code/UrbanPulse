# run.py
import subprocess
import sys
import os

def main():
    print("🚀 Starting UrbanPulse Backend...")
    
    # Check if video exists
    if not os.path.exists("traffic_video.mp4"):
        print("⚠️ No video file found. Running in synthetic mode.")
    
    # Start FastAPI server
    subprocess.run([
        sys.executable, "-m", "uvicorn", 
        "main:socket_app", 
        "--host", "0.0.0.0", 
        "--port", "8000",
        "--reload"
    ])

if __name__ == "__main__":
    main()