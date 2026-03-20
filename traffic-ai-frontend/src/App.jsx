/*import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import TrafficMap from './components/TrafficMap';
import RoutingForm from './components/RoutingForm';
import LaneMetrics from './components/LaneMetrics';
import SignalPanel from './components/SignalPanel';
import Sustainability from './components/Sustainability';
import RouteComparison from './components/RouteComparison';

function App() {
  const [trafficData, setTrafficData] = useState(null);
  const [routeResult, setRouteResult] = useState(null);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [acceptedRoute, setAcceptedRoute] = useState(null);

  const handleRouteRequest = (src, dst) => {
    console.log(`Route requested: "${src}" -> "${dst}"`);
    setSource(src);
    setDestination(dst);
    setAcceptedRoute(null);
  };

  const handleRouteResult = (result) => {
    console.log('Route result in App:', {
      points: result.route?.length,
      status: result.status,
      lcsi: result.avg_lcsi
    });
    setRouteResult(result);
  };

  const handleAcceptRoute = () => {
    setAcceptedRoute(routeResult);
    console.log('User accepted AI route');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">TrafficAI Dashboard</h1>
        <p className="text-gray-600">Real-time congestion intelligence and adaptive routing</p>
      </header>

      <div className="space-y-6">
        <div className="w-full space-y-4">
          <RoutingForm onRouteRequest={handleRouteRequest} />
          <TrafficMap source={source} destination={destination} onRouteResult={handleRouteResult} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-4 lg:col-span-1">
            {trafficData ? (
              <>
                <LaneMetrics trafficData={trafficData} />
                <SignalPanel signalRec={trafficData.signal_recommendation} />

                {routeResult?.comparison && !acceptedRoute && (
                  <RouteComparison comparison={routeResult.comparison} onAcceptRoute={handleAcceptRoute} />
                )}

                {acceptedRoute && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Route Accepted!</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        You will save <strong>{acceptedRoute.comparison.time_saved}</strong> and{' '}
                        <strong>{acceptedRoute.comparison.co2_saved_grams}g CO2</strong> vs the shortest path.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setAcceptedRoute(null)}>
                        Plan Another Trip
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Sustainability routeData={routeResult} />
              </>
            ) : (
              <div className="p-4 text-center text-gray-500 bg-white rounded-lg">Loading live traffic data...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
*/
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import ControllerDashboard from "./components/controllerDashboard";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/controller" element={<ControllerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;