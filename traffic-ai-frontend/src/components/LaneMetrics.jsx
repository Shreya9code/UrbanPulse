import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function LaneMetrics({ trafficData }) {
  if (!trafficData) return <div>Loading...</div>;

  // Prepare chart data
  const chartData = Object.entries(trafficData.lanes).map(([lane, metrics]) => ({
    lane,
    vehicles: metrics.count,
    occupancy: metrics.occupancy,
    lcsi: metrics.lcsi,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Summary Cards */}
      {Object.entries(trafficData.lanes).map(([lane, metrics]) => (
        <Card key={lane} className={`border-l-4 ${
          metrics.lcsi > 80 ? 'border-red-500' : 
          metrics.lcsi > 50 ? 'border-orange-500' : 'border-green-500'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{lane}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.count}</div>
            <p className="text-sm text-gray-500">Vehicles</p>
            <div className="mt-2 flex justify-between text-sm">
              <span>Occupancy: {metrics.occupancy}%</span>
              <span className={`font-medium ${
                metrics.lcsi > 80 ? 'text-red-600' : 
                metrics.lcsi > 50 ? 'text-orange-600' : 'text-green-600'
              }`}>
                LCSI: {metrics.lcsi}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Chart */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Congestion Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="lane" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="lcsi" fill="#3b82f6" name="LCSI Score" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}