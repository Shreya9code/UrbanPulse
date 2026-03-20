import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrafficCone, Clock, CheckCircle } from "lucide-react";

export default function SignalPanel({ signalRec }) {
  if (!signalRec) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrafficCone className="w-5 h-5" />
          Signal Control Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Current Green Time</p>
            <p className="text-2xl font-bold">{signalRec.current_green_time}s</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">AI Recommended</p>
            <p className="text-2xl font-bold text-blue-600">
              {signalRec.recommended_green_time}s
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 ! bg-gray-50 rounded">
          <div>
            <p className="font-medium">{signalRec.action}</p>
            <p className="text-sm text-gray-500">Fairness Check: {signalRec.fairness_check}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
      </CardContent>
    </Card>
  );
}