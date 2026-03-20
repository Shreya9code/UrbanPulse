import { MapContainer, TileLayer, Polyline, Circle, Popup, useMap, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef } from 'react';
import { trafficAPI } from '../services/api';
import L from 'leaflet';
import RouteComparison from './RouteComparison';

// Fix Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

const DEFAULT_CENTER = [22.5726, 88.3639];
const DEFAULT_ZOOM = 13;

function FitBounds({ routePath }) {
  const map = useMap();
  useEffect(() => {
    if (routePath?.length > 0) {
      setTimeout(() => {
        const bounds = L.latLngBounds(routePath);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }, 100);
    }
  }, [routePath, map]);
  return null;
}

export default function TrafficMap({ source, destination, onRouteSelected }) {
  const [trafficData, setTrafficData] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState('ai_optimized');
  const mapRef = useRef(null);

  const fetchTraffic = async () => {
    try {
      const data = await trafficAPI.getLiveTraffic();
      setTrafficData(data);
    } catch (err) {
      console.error('Traffic fetch failed:', err);
    }
  };

  const fetchRoutes = async () => {
    if (!source?.trim() || !destination?.trim()) return;

    setLoadingRoute(true);
    setError(null);

    try {
      const result = await trafficAPI.getOptimizedRoute(source, destination);

      if (result.routes?.ai_optimized?.path?.length > 0) {
        setRoutes(result.routes);
        setComparison(result.comparison);
        setSelectedRoute('ai_optimized');
        onRouteSelected?.(result);
      } else {
        setError('No valid routes found');
      }
    } catch (err) {
      console.error('Route fetch failed:', err.message);
      setError(err.message);
    } finally {
      setLoadingRoute(false);
    }
  };

  useEffect(() => {
    fetchTraffic();
    const interval = setInterval(fetchTraffic, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (source && destination) fetchRoutes();
  }, [source, destination]);

  const handleCenterRoute = () => {
    const path = routes?.[selectedRoute]?.path;
    if (path?.length && mapRef.current) {
      const bounds = L.latLngBounds(path);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  };

  const getLaneColor = (lcsi) => {
    if (lcsi > 80) return '#ef4444';
    if (lcsi > 50) return '#f97316';
    return '#22c55e';
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative w-full">
        <div className="w-full h-[65vh] min-h-[520px] rounded-xl overflow-hidden shadow-lg border border-slate-300 bg-white">
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              ref={mapRef}
            >
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {trafficData?.lanes &&
                Object.entries(trafficData.lanes).map(([lane, metrics], i) => (
                  <Circle
                    key={lane}
                    center={[DEFAULT_CENTER[0] + i * 0.0003, DEFAULT_CENTER[1] + i * 0.0003]}
                    radius={50}
                    pathOptions={{
                      color: getLaneColor(metrics.lcsi),
                      fillColor: getLaneColor(metrics.lcsi),
                      fillOpacity: 0.3,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <strong>{lane}</strong>
                      <br />
                      Vehicles: {metrics.count}
                      <br />
                      LCSI: {metrics.lcsi} ({metrics.status})
                    </Popup>
                  </Circle>
                ))}

              {routes && (
                <>
                  {routes.baseline?.path && (
                    <Polyline
                      positions={routes.baseline.path}
                      color={routes.baseline.color || '#9ca3af'}
                      weight={3}
                      opacity={selectedRoute === 'baseline' ? 1 : 0.5}
                      dashArray={selectedRoute === 'baseline' ? '0' : '5, 10'}
                      lineCap="round"
                    />
                  )}

                  {routes.ai_optimized?.path && (
                    <Polyline
                      positions={routes.ai_optimized.path}
                      color={routes.ai_optimized.color || '#2563eb'}
                      weight={selectedRoute === 'ai_optimized' ? 6 : 4}
                      opacity={1}
                      dashArray="0"
                      lineCap="round"
                      lineJoin="round"
                    />
                  )}

                  {routes.ai_optimized?.path?.length > 0 && (
                    <>
                      <Marker position={routes.ai_optimized.path[0]}>
                        <Popup>Start: {source}</Popup>
                      </Marker>
                      <Marker position={routes.ai_optimized.path[routes.ai_optimized.path.length - 1]}>
                        <Popup>End: {destination}</Popup>
                      </Marker>
                    </>
                  )}

                  <FitBounds routePath={routes[selectedRoute]?.path} />
                </>
              )}
            </MapContainer>
          </div>

          {routes && (
            <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 max-w-[75%]">
              {Object.entries(routes).map(([key, route]) => (
                <button
                  key={key}
                  onClick={() => setSelectedRoute(key)}
                  className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-md transition-all backdrop-blur ${
                    selectedRoute === key
                      ? '!bg-blue-600 text-white ring-2 ring-blue-300'
                      : 'bg-white/95 text-slate-700 hover:!bg-white border border-slate-200'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }} />
                  {route.label}
                  {route.is_recommended && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Best</span>}
                </button>
              ))}
            </div>
          )}

          {routes && (
            <button
              onClick={handleCenterRoute}
              className="absolute bottom-4 right-4 z-[1000] bg-white/95 text-slate-800 px-4 py-2 rounded-lg shadow-lg hover:bg-white border border-slate-200 flex items-center gap-2 font-medium"
            >
              Center Map
            </button>
          )}

          {loadingRoute && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[1000]">
              <div className="bg-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 border border-slate-200">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">Calculating optimal routes...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-50 text-red-700 px-4 py-2 rounded-lg shadow z-[1000] border border-red-200 text-sm">
              {error}
            </div>
          )}
      </div>

      {comparison && selectedRoute === 'ai_optimized' && (
        <div className="w-full">
          <RouteComparison comparison={comparison} onAcceptRoute={() => onRouteSelected?.({ routes, comparison })} />
        </div>
      )}
    </div>
  );
}
