import React from "react";

const LANE_LABELS = { Lane_1: "Lane 1", Lane_2: "Lane 2", Lane_3: "Lane 3" };

export default function SignalControl({ signals, lanes }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.title}>Signal Control</span>
        <span style={styles.sub}>Adaptive · Auto</span>
      </div>

      <div style={styles.lanes}>
        {Object.entries(signals).map(([lane, sig]) => {
          const lcsi  = lanes?.[lane]?.lcsi ?? 0;
          const isGreen = sig === "green";
          return (
            <div key={lane} style={styles.laneRow}>
              <span style={styles.laneLabel}>{LANE_LABELS[lane]}</span>

              {/* Traffic light */}
              <div style={styles.light}>
                <div style={{...styles.bulb, background: isGreen ? "#222" : "#ff4444", boxShadow: !isGreen ? "0 0 12px #ff4444aa" : "none"}} />
                <div style={{...styles.bulb, background: "#222"}} />
                <div style={{...styles.bulb, background: isGreen ? "#00ff87" : "#222", boxShadow: isGreen ? "0 0 12px #00ff87aa" : "none"}} />
              </div>

              {/* LCSI mini bar */}
              <div style={styles.miniBarBg}>
                <div style={{
                  ...styles.miniBarFill,
                  width: `${Math.round(lcsi*100)}%`,
                  background: isGreen ? "#00ff87" : "#ff4444"
                }} />
              </div>

              <span style={{...styles.sig, color: isGreen ? "#00ff87" : "#ff4444"}}>
                {isGreen ? "GO" : "STOP"}
              </span>
            </div>
          );
        })}
      </div>

      <div style={styles.footer}>
        <span style={styles.footNote}>● Highest LCSI lane gets green priority</span>
      </div>
    </div>
  );
}

const styles = {
  card:       { background:"#0d1220", borderRadius:12, padding:20, border:"1px solid #1e2a40", display:"flex", flexDirection:"column", gap:16 },
  cardHeader: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  title:      { fontSize:13, fontWeight:700, letterSpacing:2, color:"#8899bb" },
  sub:        { fontSize:10, color:"#445", letterSpacing:1 },
  lanes:      { display:"flex", flexDirection:"column", gap:14 },
  laneRow:    { display:"flex", alignItems:"center", gap:12 },
  laneLabel:  { fontSize:12, color:"#667", width:52, flexShrink:0 },
  light:      { display:"flex", flexDirection:"column", gap:3, background:"#111", borderRadius:6, padding:"5px 8px", flexShrink:0 },
  bulb:       { width:12, height:12, borderRadius:"50%", transition:"all 0.4s" },
  miniBarBg:  { flex:1, height:5, background:"#1e2a40", borderRadius:3, overflow:"hidden" },
  miniBarFill:{ height:"100%", borderRadius:3, transition:"width 0.8s ease" },
  sig:        { fontSize:11, fontWeight:700, letterSpacing:2, width:36, textAlign:"right", flexShrink:0 },
  footer:     { borderTop:"1px solid #1e2a40", paddingTop:12 },
  footNote:   { fontSize:10, color:"#445", letterSpacing:0.5 },
};
