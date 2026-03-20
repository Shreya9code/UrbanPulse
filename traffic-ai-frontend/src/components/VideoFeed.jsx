import React, { useState } from "react";

export default function VideoFeed({ url, mode }) {
  const [imgError, setImgError] = useState(false);
  const isLive = mode === "live";

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <span style={styles.title}>Video Feed</span>
        <div style={styles.badges}>
          <span style={{...styles.badge, color:"#f5a623", borderColor:"#f5a62355"}}>
            ● REC
          </span>
          <span style={{...styles.badge,
            color:       isLive ? "#00ff87" : "#60a5fa",
            borderColor: isLive ? "#00ff8755" : "#60a5fa55"
          }}>
            {isLive ? "LIVE" : "SYNTHETIC"}
          </span>
        </div>
      </div>

      <div style={styles.feedBox}>
        {isLive && !imgError ? (
          <img
            src={url}
            alt="Live traffic feed"
            style={styles.img}
            onError={() => setImgError(true)}
          />
        ) : (
          <SyntheticVisual />
        )}
      </div>
    </div>
  );
}

function SyntheticVisual() {
  return (
    <div style={synth.wrap}>
      <div style={synth.label}>⬡ SYNTHETIC MODE</div>
      <p style={synth.sub}>No video.mp4 detected — running on simulated traffic data</p>
      <div style={synth.grid}>
        {["Lane 1","Lane 2","Lane 3"].map((l, i) => (
          <div key={l} style={{...synth.lane, animationDelay:`${i*0.3}s`}}>
            <span style={synth.laneLabel}>{l}</span>
            <div style={synth.cars}>
              {Array.from({length: 3 + i}).map((_, j) => (
                <div key={j} style={{...synth.car, animationDelay:`${j*0.5+i*0.2}s`}}>🚗</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes carMove { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .car-anim { animation: carMove 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

const styles = {
  wrap:    { background:"#0d1220", border:"1px solid #1e2a40", borderRadius:12, overflow:"hidden", display:"flex", flexDirection:"column" },
  header:  { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderBottom:"1px solid #1e2a40" },
  title:   { fontSize:13, fontWeight:700, letterSpacing:2, color:"#8899bb" },
  badges:  { display:"flex", gap:8 },
  badge:   { fontSize:10, border:"1px solid", borderRadius:4, padding:"2px 8px", letterSpacing:1 },
  feedBox: { flex:1, minHeight:280, position:"relative", background:"#060a14" },
  img:     { width:"100%", height:"100%", objectFit:"cover", display:"block" },
};

const synth = {
  wrap:      { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", minHeight:280, gap:12, padding:24 },
  label:     { fontSize:13, fontWeight:700, letterSpacing:3, color:"#60a5fa" },
  sub:       { fontSize:11, color:"#445", textAlign:"center", margin:0 },
  grid:      { display:"flex", gap:24, marginTop:8 },
  lane:      { display:"flex", flexDirection:"column", alignItems:"center", gap:8, background:"#111a2e", borderRadius:8, padding:"12px 16px" },
  laneLabel: { fontSize:10, color:"#556", letterSpacing:1 },
  cars:      { display:"flex", flexDirection:"column", gap:4 },
  car:       { fontSize:18, animation:"carMove 2s ease-in-out infinite" },
};
