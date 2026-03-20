import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import MetricCard from "../components/MetricCard";
import PredictionChart from "../components/PredictionChart";
import SignalControl from "../components/SignalControl";
import VideoFeed from "../components/VideoFeed";
import ImpactStats from "../components/ImpactStats";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const socket = io(BACKEND_URL, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

const INITIAL = {
  lanes: {
    Lane_1: { count: 0, lcsi: 0, wait: 0 },
    Lane_2: { count: 0, lcsi: 0, wait: 0 },
    Lane_3: { count: 0, lcsi: 0, wait: 0 },
  },
  signals:    { Lane_1: "red", Lane_2: "red", Lane_3: "red" },
  predicted:  { Lane_1: 0,    Lane_2: 0,    Lane_3: 0 },
  prediction: [],
  impact:     { co2Saved: 0, timeSaved: 0 },
  mode:       "synthetic",
};

export default function Dashboard() {
  const [connected, setConnected] = useState(false);
  const [data, setData]           = useState(INITIAL);
  const [tick, setTick]           = useState(0);

  useEffect(() => {
    socket.on("connect",    () => setConnected(true));
    socket.emit("start_monitoring", { mode: "auto" });
    socket.on("disconnect", () => setConnected(false));

    socket.on("traffic_update", (newData) => {
      setData((prev) => {
        const point = {
          time:      new Date().toLocaleTimeString(),
          actual:    newData.lanes?.Lane_1?.lcsi    ?? 0,
          predicted: newData.predicted?.Lane_1      ?? 0,
        };
        const prediction = [...prev.prediction, point].slice(-25);
        return { ...newData, prediction };
      });
      setTick(t => t + 1);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("traffic_update");
    };
  }, []);

  return (
    <div style={styles.shell}>
      {/* ── Sidebar ── */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⬡</span>
          <span style={styles.logoText}>Urban<b>Pulse</b></span>
        </div>

        <nav style={styles.nav}>
          {["Dashboard","Analytics","History","Settings"].map((item, i) => (
            <div key={item} style={{...styles.navItem, ...(i===0 ? styles.navActive : {})}}>
              {item}
            </div>
          ))}
        </nav>

        <div style={styles.sideFooter}>
          <span style={{...styles.dot, background: connected ? "#00ff87" : "#ff4444"}} />
          <span style={{fontSize:12, color:"#aaa"}}>{connected ? "Live" : "Connecting…"}</span>
          <div style={styles.modeTag}>
            {data.mode === "live" ? "📹 Live" : "🧪 Synthetic"}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={styles.main}>
        <header style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>Control Center</h1>
            <p style={styles.pageSub}>Real-time traffic intelligence · 3 lanes monitored</p>
          </div>
          <div style={styles.tickBadge}>Update #{tick}</div>
        </header>

        <ImpactStats data={data.impact} />

        <div style={styles.midGrid}>
          <VideoFeed url={`${BACKEND_URL}/video_feed`} mode={data.mode} />
          <SignalControl signals={data.signals} lanes={data.lanes} />
        </div>

        <div style={styles.cardsGrid}>
          {Object.entries(data.lanes).map(([lane, m]) => (
            <MetricCard
              key={lane}
              name={lane}
              count={m.count}
              lcsi={m.lcsi}
              wait={m.wait}
              predicted={data.predicted?.[lane] ?? 0}
              signal={data.signals?.[lane] ?? "red"}
            />
          ))}
        </div>

        <PredictionChart data={data.prediction} />
      </main>
    </div>
  );
}

const styles = {
  shell:      { display:"flex", minHeight:"100vh", background:"#0a0e1a", color:"#e0e6f0", fontFamily:"'IBM Plex Mono', monospace" },
  sidebar:    { width:220, background:"#0d1220", borderRight:"1px solid #1e2a40", display:"flex", flexDirection:"column", padding:"24px 16px", gap:8, flexShrink:0 },
  logo:       { display:"flex", alignItems:"center", gap:10, marginBottom:32 },
  logoIcon:   { fontSize:28, color:"#00ff87" },
  logoText:   { fontSize:16, color:"#fff", letterSpacing:1 },
  nav:        { display:"flex", flexDirection:"column", gap:4, flex:1 },
  navItem:    { padding:"10px 14px", borderRadius:8, fontSize:13, color:"#778", cursor:"pointer", transition:"all 0.2s" },
  navActive:  { background:"#00ff8720", color:"#00ff87", borderLeft:"3px solid #00ff87", paddingLeft:11 },
  sideFooter: { display:"flex", flexDirection:"column", gap:8, paddingTop:16, borderTop:"1px solid #1e2a40" },
  dot:        { width:8, height:8, borderRadius:"50%", display:"inline-block", marginRight:6 },
  modeTag:    { fontSize:11, background:"#1a2235", borderRadius:6, padding:"4px 8px", color:"#778" },
  main:       { flex:1, padding:"24px 32px", display:"flex", flexDirection:"column", gap:20, overflowY:"auto" },
  topbar:     { display:"flex", justifyContent:"space-between", alignItems:"flex-start" },
  pageTitle:  { margin:0, fontSize:22, fontWeight:700, letterSpacing:1, color:"#fff" },
  pageSub:    { margin:"4px 0 0", fontSize:12, color:"#556", letterSpacing:0.5 },
  tickBadge:  { background:"#1a2235", border:"1px solid #2a3a55", borderRadius:20, padding:"6px 14px", fontSize:12, color:"#00ff87" },
  midGrid:    { display:"grid", gridTemplateColumns:"1fr 340px", gap:20 },
  cardsGrid:  { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 },
};
