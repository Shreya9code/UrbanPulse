import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltip.box}>
      <p style={tooltip.time}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{...tooltip.val, color: p.color}}>
          {p.name}: {(p.value * 100).toFixed(0)}%
        </p>
      ))}
    </div>
  );
};

export default function PredictionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyText}>Waiting for data…</span>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>LCSI Prediction — Lane 1</span>
        <div style={styles.legend}>
          <span style={{color:"#00ff87"}}>━ Actual</span>
          <span style={{color:"#60a5fa"}}>━ Predicted</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{top:8, right:20, bottom:0, left:-10}}>
          <CartesianGrid stroke="#1e2a40" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{fill:"#445", fontSize:10}}
            axisLine={{stroke:"#1e2a40"}}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 1]}
            tickFormatter={v => `${Math.round(v*100)}%`}
            tick={{fill:"#445", fontSize:10}}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#00ff87"
            strokeWidth={2}
            dot={false}
            name="Actual"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#60a5fa"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            name="Predicted"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles = {
  card:      { background:"#0d1220", border:"1px solid #1e2a40", borderRadius:12, padding:"18px 20px" },
  header:    { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 },
  title:     { fontSize:13, fontWeight:700, letterSpacing:2, color:"#8899bb" },
  legend:    { display:"flex", gap:16, fontSize:11, color:"#556" },
  empty:     { background:"#0d1220", border:"1px solid #1e2a40", borderRadius:12, padding:40, display:"flex", justifyContent:"center" },
  emptyText: { fontSize:12, color:"#334", letterSpacing:1 },
};

const tooltip = {
  box:  { background:"#111a2e", border:"1px solid #2a3a55", borderRadius:8, padding:"8px 12px" },
  time: { fontSize:10, color:"#556", margin:"0 0 4px" },
  val:  { fontSize:12, fontWeight:700, margin:"2px 0" },
};
