# utils/lcsi_calculator.py
import numpy as np
from collections import deque
from sklearn.preprocessing import MinMaxScaler

class LCSICalculator:
    def __init__(self, window_size=10, history_size=50):
        self.window_size = window_size
        self.history_size = history_size
        self.lane_data = {
            "Lane_1": deque(maxlen=history_size),
            "Lane_2": deque(maxlen=history_size),
            "Lane_3": deque(maxlen=history_size)
        }
        self.scaler = MinMaxScaler()
        
    def update(self, lane, count):
        """Update lane data and calculate LCSI"""
        # Add to history
        self.lane_data[lane].append(count)
        
        # Need at least window_size data points
        if len(self.lane_data[lane]) < self.window_size:
            return 0.5  # Default
        
        # Get recent window
        recent = list(self.lane_data[lane])[-self.window_size:]
        
        # Calculate metrics
        density = np.mean(recent) / 20  # Normalize by max expected
        density = min(1.0, density)
        
        # Waiting time proxy (based on density and trend)
        trend = recent[-1] - recent[0] if len(recent) > 1 else 0
        wait_factor = density * (1 + max(0, trend / 10))
        wait_time = min(1.0, wait_factor)
        
        # Flow stability (inverse of variance)
        if len(recent) > 1:
            variance = np.var(recent) / 100
            flow_instability = min(1.0, variance)
        else:
            flow_instability = 0.5
        
        # LCSI Formula: 40% Density + 40% Wait Time + 20% Flow Instability
        lcsi = (0.4 * density) + (0.4 * wait_time) + (0.2 * flow_instability)
        
        return float(lcsi)
    
    def get_historical(self, lane="Lane_1", sequence_length=5):
        """Get historical LCSI values for prediction"""
        if len(self.lane_data[lane]) < sequence_length:
            return []
        
        # Get raw counts
        recent_counts = list(self.lane_data[lane])[-sequence_length:]
        
        # Convert to LCSI values
        lcsi_values = []
        for count in recent_counts:
            density = count / 20
            lcsi_values.append(min(1.0, density))
        
        return lcsi_values
    
    def get_all_historical(self, sequence_length=5):
        """Get historical data for all lanes"""
        result = []
        for lane in ["Lane_1", "Lane_2", "Lane_3"]:
            result.append(self.get_historical(lane, sequence_length))
        return np.array(result).T  # Shape: (seq_len, 3)