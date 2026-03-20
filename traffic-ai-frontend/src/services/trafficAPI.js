// Replace with your current ngrok URL (changes on restart!)
export const NGROK_URL = "https://marcel-unstreaming-janine.ngrok-free.dev";

export const fetchLiveMetrics = async () => {
  try {
    const response = await fetch(`${NGROK_URL}/api/live-metrics`);
    if (!response.ok) throw new Error("Failed to fetch metrics");
    return await response.json();
  } catch (error) {
    console.error("Metrics fetch error:", error);
    return null;
  }
};

export const sendSignalCommand = async (command) => {
  try {
    const response = await fetch(`${NGROK_URL}/api/signal-control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    });
    return await response.json();
  } catch (error) {
    console.error("Signal command error:", error);
    return { status: "error", message: error.message };
  }
};

export const askTrafficAI = async (message) => {
  try {
    const response = await fetch(`${NGROK_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Chat error:", error);
    return "❌ Could not connect to AI assistant.";
  }
};

// WebSocket hook for real-time metrics (auto-reconnect)
export const useTrafficWebSocket = (onMetricsUpdate) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const wsUrl = `${NGROK_URL.replace("https://", "wss://")}/ws/metrics`;
  
  // Simple non-hook version for now (we'll upgrade later)
  const connect = () => {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => console.log("🔗 WebSocket connected");
    ws.onmessage = (event) => {
      const metrics = JSON.parse(event.data);
      onMetricsUpdate(metrics);
    };
    ws.onclose = () => {
      console.log("🔌 WebSocket disconnected. Reconnecting in 5s...");
      setTimeout(connect, 5000);
    };
    ws.onerror = (err) => console.error("WebSocket error:", err);
    
    return () => ws.close(); // Cleanup function
  };
  
  return { connect };
};