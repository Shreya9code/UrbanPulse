export const API_BASE = "https://marcel-unstreaming-janine.ngrok-free.dev";

// export const API_BASE = import.meta.env.VITE_API_BASE || "https://...dev";

export const trafficAPI = {
  //Fetch live traffic metrics from MongoDB via FastAPI
  getLiveTraffic: async (junctionId = "Junction_01") => {
    const url = `${API_BASE}/api/traffic?junction_id=${junctionId}`;
    //console.log(`🔍 Fetching traffic: ${url}`);

    try {
      const res = await fetch(url, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      //console.log(`Received response: ${res.status} ${res.statusText}`);
      // Check for HTML error pages (CORS/404 issues)
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
        const text = await res.text();
        console.error(`❌ API Error ${res.status}:`, text.substring(0, 200));

        if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
          throw new Error("Received HTML error page. Check Ngrok URL & CORS.");
        }
        throw new Error(`API failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      /*console.log("Fetched traffic data:", data);
      console.log("✅ Traffic data received:", {
        junction: data.junction_id,
        lcsi: data.avg_lcsi,
        lanes: Object.keys(data.lanes || {}).length,
      });*/
      return data;
    } catch (err) {
      console.error("🚨 getLiveTraffic error:", err.message);
      throw err;
    }
  },

  //Fetch historical traffic data for charts
  getTrafficHistory: async (minutes = 10, junctionId = "Junction_01") => {
    const url = `${API_BASE}/api/traffic/history?minutes=${minutes}&junction_id=${junctionId}`;

    try {
      const res = await fetch(url, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      console.log(`Received response: ${res.status} ${res.statusText}`);
      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ History API Error ${res.status}:`, text);
        throw new Error(`History API failed: ${res.status}`);
      }

      const data = await res.json();
      console.log(`✅ History data: ${data.length} records`);
      return data;
    } catch (err) {
      console.error("🚨 getTrafficHistory error:", err.message);
      throw err;
    }
  },

  //Get AI-optimized route with OSRM + congestion weighting
  getOptimizedRoute: async (source, destination) => {
    if (!source?.trim() || !destination?.trim()) {
      throw new Error("Source and destination are required");
    }

    const url = `${API_BASE}/api/route`;
    //console.log(`🗺️ Requesting route: "${source}" → "${destination}"`);
    //console.log(`🔗 POST ${url}`);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          source: source.trim(),
          destination: destination.trim(),
        }),
      });

      // Handle HTML errors (CORS/404)
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
        const text = await res.text();
        console.error(
          `❌ Route API Error ${res.status}:`,
          text.substring(0, 300),
        );

        if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
          throw new Error(
            "Received HTML error. Check: 1) Ngrok URL 2) CORS 3) Server running",
          );
        }
        throw new Error(
          `Route API failed: ${res.status} - ${text.substring(0, 100)}`,
        );
      }

      const data = await res.json();

      console.log("✅ Routes received:", {
        baseline_points: data.routes.baseline?.path?.length,
        ai_points: data.routes.ai_optimized?.path?.length,
        time_saved: data.comparison?.time_saved,
      });
      
      return data;
    } catch (err) {
      console.error("🚨 getOptimizedRoute error:", err.message);
      throw new Error(`Route fetch failed: ${err.message}`);
    }
  },
};

/**
 * Utility: Test API connection
 * Call this in browser console: trafficAPI.testConnection()
 */ /*
trafficAPI.testConnection = async () => {
  console.log("🔌 Testing API connection...");
  try {
    const traffic = await trafficAPI.getLiveTraffic();
    console.log("✅ Connection successful!");
    console.log("📊 Sample data:", {
      lcsi: traffic.avg_lcsi,
      lanes: Object.keys(traffic.lanes),
    });
    return true;
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    console.log("💡 Troubleshooting:");
    console.log("  1. Check API_BASE URL (no trailing spaces!)");
    console.log("  2. Ensure Colab FastAPI cell is running");
    console.log("  3. Verify Ngrok tunnel is active");
    console.log("  4. Check browser console for CORS errors");
    return false;
  }
};*/
