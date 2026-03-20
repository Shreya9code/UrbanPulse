import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, Clock, Fuel, Coins, CheckCircle, ArrowRight } from 'lucide-react';

export default function RouteComparison({ comparison, onAcceptRoute }) {
  if (!comparison) return null;

  const { time_saved, co2_saved_grams, fuel_saved_liters, money_saved_inr, congestion_avoided, avg_lcsi } = comparison;

  return (
    <Card className="w-full border border-blue-200 bg-gradient-to-b from-blue-50 to-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-blue-700 text-lg">
            <CheckCircle className="w-5 h-5" />
            AI Route Benefits
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Recommended
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-slate-700">Time Saved</p>
              <p className="text-sm text-slate-500">vs shortest path</p>
            </div>
          </div>
          <span className="text-xl font-bold text-green-600">{time_saved}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
            <Leaf className="w-5 h-5 mx-auto text-green-600 mb-1" />
            <p className="text-lg font-bold text-slate-800">{co2_saved_grams}g</p>
            <p className="text-xs text-slate-500">CO2 Saved</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
            <Fuel className="w-5 h-5 mx-auto text-blue-600 mb-1" />
            <p className="text-lg font-bold text-slate-800">{fuel_saved_liters}L</p>
            <p className="text-xs text-slate-500">Fuel Saved</p>
          </div>
        </div>

        {money_saved_inr > 0 && (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Coins className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-slate-700">Money Saved</p>
                <p className="text-sm text-slate-500">at INR 106/L petrol</p>
              </div>
            </div>
            <span className="text-xl font-bold text-yellow-600">INR {money_saved_inr}</span>
          </div>
        )}

        {congestion_avoided && (
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-700">Avoided high-congestion lanes (LCSI: {avg_lcsi})</p>
          </div>
        )}

        <Button onClick={onAcceptRoute} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Use This Route <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <p className="text-xs text-slate-400 text-center">Benefits estimated from real-time traffic intelligence</p>
      </CardContent>
    </Card>
  );
}
