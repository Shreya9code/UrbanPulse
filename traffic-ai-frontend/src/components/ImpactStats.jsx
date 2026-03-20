import React from "react";

export default function ImpactStats({ data }) {
  const { co2Saved = 0, timeSaved = 0 } = data || {};

  const stats = [
    { label: "CO₂ Saved",    value: co2Saved.toFixed(2), unit: "kg",  icon: "🌿", color: "#00ff87" },
    { label: "Time Saved",   value: timeSaved.toFixed(0), unit: "sec", icon: "⏱", color: "#60a5fa" },
    { label: "Avg Wait Red", value: "38.3",               unit: "sec", icon: "🚦", color: "#f5a623" },
    { label: "Efficiency",   value: "↑ 15",               unit: "%",   icon: "📈", color: "#a78bfa" },
  ];

  return (
    <div style={styles.row}>
      {stats.map((s) => (
        <div key={s.label} style={styles.card}>
          <div style={styles.icon}>{s.icon}</div>
          <div style={styles.right}>
            <div style={styles.value}>
              <span style={{...styles.num, color: s.color}}>{s.value}</span>
              <span style={styles.unit}>{s.unit}</span>
            </div>
            <div style={styles.label}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  row:   { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 },
  card:  { background:"#0d1220", border:"1px solid #1e2a40", borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14 },
  icon:  { fontSize:22, lineHeight:1 },
  right: { display:"flex", flexDirection:"column", gap:2 },
  value: { display:"flex", alignItems:"baseline", gap:4 },
  num:   { fontSize:22, fontWeight:700, lineHeight:1 },
  unit:  { fontSize:11, color:"#556" },
  label: { fontSize:11, color:"#556", letterSpacing:0.5 },
};
