import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoutingForm({ onRouteRequest }) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!source.trim() || !destination.trim()) return;

    setLoading(true);
    try {
      console.log(`Submitting route request: ${source} → ${destination}`);
      await onRouteRequest(source, destination);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🗺️ AI Smart Routing</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source">Source Location</Label>
            <Input
              id="source"
              placeholder="e.g., Salt Lake, Kolkata"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              placeholder="e.g., Park Street, Kolkata"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className={`
    w-full
    px-6 py-3
    text-base font-semibold
    transition-all duration-200 ease-in-out
    transform hover:scale-[1.02] active:scale-[0.98]
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    ${
      loading || !source || !destination
        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl active:shadow-md focus:ring-blue-500 hover:from-blue-700 hover:to-indigo-700"
    }
  `}
            disabled={loading || !source || !destination}
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Finding Route...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Get AI-Optimized Route</span>
                </>
              )}
            </span>
          </Button>
        </form>

        <p className="text-xs text-blue-500 mt-3">
          💡 Tip: Use real place names like "Victoria Memorial, Kolkata" for
          best results.
        </p>
      </CardContent>
    </Card>
  );
}
