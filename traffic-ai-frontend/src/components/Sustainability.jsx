import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Fuel, Coins } from "lucide-react";

export default function Sustainability({ routeData }) {
  // Mock calculation based on route response
  const co2Saved = routeData?.co2_saved_grams || 0;
  const fuelSaved = (co2Saved * 0.0004).toFixed(2); // Approx conversion
  const moneySaved = (fuelSaved * 106).toFixed(2); // ₹106/liter petrol

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-600" />
          Sustainability Impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded">
            <Leaf className="w-6 h-6 mx-auto text-green-600 mb-1" />
            <p className="text-xl font-bold">{co2Saved}g</p>
            <p className="text-xs text-gray-500">CO₂ Saved</p>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <Fuel className="w-6 h-6 mx-auto text-blue-600 mb-1" />
            <p className="text-xl font-bold">{fuelSaved}L</p>
            <p className="text-xs text-gray-500">Fuel Saved</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded">
            <Coins className="w-6 h-6 mx-auto text-yellow-600 mb-1" />
            <p className="text-xl font-bold">₹{moneySaved}</p>
            <p className="text-xs text-gray-500">Per 1000 Vehicles</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}