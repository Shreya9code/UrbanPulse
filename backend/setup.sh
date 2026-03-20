#!/bin/bash
# setup.sh

echo "🚀 Setting up UrbanPulse Backend..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip

# Install setuptools first (fixes pkg_resources)
pip install setuptools wheel

# Install PyTorch (CPU version for compatibility)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies
pip install fastapi==0.104.1 uvicorn==0.24.0
pip install python-socketio==5.9.0 python-multipart==0.0.6
pip install opencv-python-headless==4.8.1.78
pip install numpy==1.24.3 pandas==2.0.3
pip install ultralytics==8.0.196
pip install scikit-learn==1.3.0 Pillow==10.0.1

# Install torch-geometric (may need special handling)
pip install torch-geometric==2.4.0

# Try to install deep-sort-realtime (may fail, but we have fallback)
pip install deep-sort-realtime==1.3.2 || echo "⚠️ DeepSort failed, using fallback"

echo "✅ Setup complete!"