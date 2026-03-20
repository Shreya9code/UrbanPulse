import React from "react";

const LCSI_COLOR = (v) => {
  if (v < 0.3) return "#00ff87";
  if (v < 0.6) return "#f5a623";
  return "#ff4444";
};

const LCSI_LABEL = (v) => {
  if (v < 0.3) return "FREE FLOW";
  if (v < 0.6) return "MODERATE";
  return "CONGESTED";
};

export default function MetricCard({ name, count, lcsi, wait, predicted, signal }) {
  const color = LCSI_COLOR(lcsi);
  const label = LCSI_LABEL(lcsi);
  const pct   = Math.round(lcsi * 100);

  return (
    <div style={{...styles.card, borderTop: `3px solid ${color}`}}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.laneName}>{name.replace("_", " ")}</span>
        <span style={{...styles.statusBadge, color, borderColor: color, background: color+"18"}}>
          {label}
        </span>
      </div>

      {/* LCSI Gauge */}
      <div style={styles.gaugeWrap}>
        <div style={styles.gaugeBg}>
          <div style={{...styles.gaugeFill, width:`${pct}%`, background: color}} />
        </div>
        <div style={styles.gaugeLabels}>
          <span style={{color, fontSize:24, fontWeight:700}}>{pct}<span style={{fontSize:13}}>%</span></span>
          <span style={{fontSize:11, color:"#556"}}>LCSI</span>
        </div>
      </div>

      {/* Stats row */}
      <div style={styles.stats}>
        <Stat label="Vehicles" value={count} />
        <Stat label="Wait" value={`${wait}s`} />
        <Stat label="Predicted" value={`${Math.round(predicted*100)}%`} dim />
      </div>

      {/* Signal pill */}
      <div style={styles.signalRow}>
        <span style={{...styles.signalPill,
          background: signal === "green" ? "#00ff8722" : "#ff444422",
          color:       signal === "green" ? "#00ff87"   : "#ff4444",
          border:     `1px solid ${signal === "green" ? "#00ff8755" : "#ff444455"}`
        }}>
          {signal === "green" ? "● GREEN — Priority" : "● RED — Waiting"}
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value, dim }) {
  return (
    <div style={styles.stat}>
      <span style={{...styles.statVal, color: dim ? "#556" : "#c0cce0"}}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

const styles = {
  card:        { background:"#0d1220", borderRadius:12, padding:20, display:"flex", flexDirection:"column", gap:14, border:"1px solid #1e2a40" },
  header:      { display:"flex", justifyContent:"space-between", alignItems:"center" },
  laneName:    { fontSize:13, fontWeight:700, letterSpacing:2, color:"#8899bb" },
  statusBadge: { fontSize:10, fontWeight:700, letterSpacing:1.5, border:"1px solid", borderRadius:4, padding:"2px 7px" },
  gaugeWrap:   { display:"flex", alignItems:"center", gap:14 },
  gaugeBg:     { flex:1, height:6, background:"#1e2a40", borderRadius:3, overflow:"hidden" },
  gaugeFill:   { height:"100%", borderRadius:3, transition:"width 0.8s ease" },
  gaugeLabels: { display:"flex", flexDirection:"column", alignItems:"flex-end", minWidth:52 },
  stats:       { display:"flex", justifyContent:"space-between" },
  stat:        { display:"flex", flexDirection:"column", alignItems:"center", gap:2 },
  statVal:     { fontSize:15, fontWeight:700 },
  statLabel:   { fontSize:10, color:"#445", letterSpacing:1 },
  signalRow:   { display:"flex" },
  signalPill:  { fontSize:11, borderRadius:20, padding:"5px 12px", letterSpacing:0.5 },
};
