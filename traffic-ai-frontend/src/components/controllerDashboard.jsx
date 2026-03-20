import React, { useState, useEffect, useRef } from 'react';
import { fetchLiveMetrics, sendSignalCommand, askTrafficAI, useTrafficWebSocket } from '../services/trafficAPI';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Gauge, 
  AlertTriangle, 
  Bot, 
  Send, 
  RefreshCw, 
  Play, 
  Pause, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Car,
  Truck,
  Bus
} from 'lucide-react';

const NGROK_URL = "https://marcel-unstreaming-janine.ngrok-free.dev";

const ControllerDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [activeTab, setActiveTab] = useState("overview");
  const [signalOverrides, setSignalOverrides] = useState({});
  const chatEndRef = useRef(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // WebSocket connection (mock for now since useTrafficWebSocket might not be implemented)
  useEffect(() => {
    // Simulating WebSocket connection
    const timer = setTimeout(() => {
      // Mock data for demonstration
      setMetrics({
        lcsi: 45,
        vehicle_count: 24,
        avg_speed: 32,
        emergency_detected: false,
        signal_recommendation: "EXTEND_GREEN",
        lane_density: {
          lane1: 12,
          lane2: 8,
          lane3: 4
        }
      });
      setLastUpdate(new Date());
      setLoading(false);
      setConnectionStatus("connected");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Fallback polling
  useEffect(() => {
    if (!metrics) {
      const interval = setInterval(async () => {
        try {
          const data = await fetchLiveMetrics();
          if (data) {
            setMetrics(data);
            setLastUpdate(new Date());
            setLoading(false);
            setConnectionStatus("connected");
          }
        } catch (error) {
          setConnectionStatus("disconnected");
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [metrics]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const getLCSIStatus = (lcsi) => {
    if (lcsi >= 70) return { label: "Critical", variant: "destructive", icon: AlertTriangle };
    if (lcsi >= 40) return { label: "Moderate", variant: "warning", icon: AlertCircle };
    return { label: "Flowing", variant: "success", icon: CheckCircle2 };
  };

  const getRecommendationStyle = (rec) => {
    switch (rec) {
      case "EMERGENCY_OVERRIDE": return "bg-red-500/20 text-red-700 border-red-500/50";
      case "EXTEND_GREEN": return "bg-amber-500/20 text-amber-700 border-amber-500/50";
      default: return "bg-green-500/20 text-green-700 border-green-500/50";
    }
  };

  const handleSignalOverride = async (lane, action) => {
    const key = `${lane}-${action}`;
    setSignalOverrides(prev => ({ ...prev, [key]: true }));
    
    try {
      const result = await sendSignalCommand({
        junction_id: "J01",
        lane,
        action,
        duration: 30
      });
      
      setChatHistory(prev => [...prev, 
        { user: "system", text: `✅ Signal: ${action.replace('_', ' ')} → ${lane}`, timestamp: new Date() }
      ]);
      
      setTimeout(() => {
        setSignalOverrides(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      setSignalOverrides(prev => ({ ...prev, [key]: false }));
      setChatHistory(prev => [...prev, 
        { user: "system", text: `❌ Failed: ${error.message}`, timestamp: new Date() }
      ]);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || !metrics) return;
    
    const userMsg = chatInput.trim();
    setChatHistory(prev => [...prev, { user: "user", text: userMsg, timestamp: new Date() }]);
    setChatInput("");
    
    try {
      const response = await askTrafficAI(userMsg);
      setChatHistory(prev => [...prev, { 
        user: "ai", 
        text: response, 
        timestamp: new Date(),
        context: { lcsi: metrics.lcsi, recommendation: metrics.signal_recommendation }
      }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { 
        user: "system", 
        text: "❌ AI Assistant unavailable. Check connection.", 
        timestamp: new Date() 
      }]);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await fetchLiveMetrics();
      if (data) {
        setMetrics(data);
        setLastUpdate(new Date());
        setConnectionStatus("connected");
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    }
    setLoading(false);
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin h-5 w-5" />
              Connecting to Command Center
            </CardTitle>
            <CardDescription>Establishing secure link to traffic AI backend...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Backend Status</span>
                <Badge variant={connectionStatus === "connected" ? "default" : "destructive"}>
                  {connectionStatus.toUpperCase()}
                </Badge>
              </div>
              <Progress value={connectionStatus === "connected" ? 100 : 33} className="h-2" />
            </div>
            <div className="text-center text-gray-500 text-sm">
              {connectionStatus === "connected" 
                ? "🎯 Ready to control" 
                : "🔄 Attempting connection..."}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Failed</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Could not connect to traffic backend at:</p>
            <code className="block bg-gray-100 p-2 rounded text-xs break-all">{NGROK_URL}</code>
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Retry
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(`${NGROK_URL}/api/live-metrics`, '_blank')}
                className="border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Test API Endpoint
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const lcsiStatus = getLCSIStatus(metrics.lcsi);
  const LCSIIcon = lcsiStatus.icon;

  return (
    <div className="min-h-screen !bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 !bg-blue-100 rounded-lg">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Traffic Controller Command Center</h1>
                <p className="text-sm text-gray-500">Junction J01 • Real-time AI Monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
  <Clock className="h-4 w-4 text-blue-500" />
  <span className="text-gray-600">Updated:</span>
  <span className="font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
    {lastUpdate?.toLocaleTimeString()}
  </span>
</div>
              
              <Badge variant={connectionStatus === "connected" ? "default" : "destructive"} className="gap-1">
                <span className={`h-2 w-2 rounded-full ${connectionStatus === "connected" ? "!bg-green-500 animate-pulse" : "!bg-red-500"}`} />
                {connectionStatus.toUpperCase()}
              </Badge>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRefresh} 
                disabled={loading}
                className="hover:!bg-gray-100 text-gray-700"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Status Banner */}
        {metrics.emergency_detected && (
          <Alert variant="destructive" className="mb-6 animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>🚨 EMERGENCY VEHICLE DETECTED</AlertTitle>
            <AlertDescription>
              Priority override recommended. Consider activating emergency signal protocol.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Video + Metrics */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Video Feed */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Live Junction Feed
                  </CardTitle>
                  <Badge variant="outline" className="gap-1">
                    <span className="h-2 w-2 rounded-full !bg-green-500 animate-pulse" />
                    LIVE • AI Enhanced
                  </Badge>
                </div>
                <CardDescription>Real-time detection with YOLOv8 + DeepSORT tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video !bg-black rounded-lg overflow-hidden border">
                  <img 
                    src={`${NGROK_URL}/video-feed`} 
                    alt="Live Traffic Feed" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/640x360?text=Live+Feed+Preview";
                    }}
                  />
                  {/* Overlay Stats */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
                    <div className="space-y-1">
                      <Badge variant="secondary" className="backdrop-blur !bg-black/50 text-white border-0">
                        <Car className="h-3 w-3 mr-1" />
                        {metrics.vehicle_count} vehicles
                      </Badge>
                      <Badge variant="secondary" className="backdrop-blur !bg-black/50 text-white border-0">
                        <Zap className="h-3 w-3 mr-1" />
                        {metrics.avg_speed} km/h avg
                      </Badge>
                    </div>
                    <Badge className={`backdrop-blur border ${getRecommendationStyle(metrics.signal_recommendation)}`}>
                      {metrics.signal_recommendation.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-gray-500">
                <span>Camera: Junction-J01-CAM01</span>
                <span>Resolution: 640×360 • 15 FPS</span>
              </CardFooter>
            </Card>

            {/* Analytics Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="lanes">Lane Analysis</TabsTrigger>
                <TabsTrigger value="history">Trends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* LCSI Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Congestion Index</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          lcsiStatus.variant === 'destructive' ? '!bg-red-100' : 
                          lcsiStatus.variant === 'warning' ? '!bg-amber-100' : 
                          '!bg-green-100'
                        }`}>
                          <LCSIIcon className={`h-5 w-5 ${
                            lcsiStatus.variant === 'destructive' ? 'text-red-600' : 
                            lcsiStatus.variant === 'warning' ? 'text-amber-600' : 
                            'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{metrics.lcsi}</div>
                          <Badge variant={lcsiStatus.variant === 'destructive' ? 'destructive' : 'default'} className="mt-1">
                            {lcsiStatus.label}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vehicle Count */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Total Vehicles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg !bg-blue-100">
                          <Car className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{metrics.vehicle_count}</div>
                          <p className="text-xs text-gray-500">Detected this cycle</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Avg Speed */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Avg Speed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg !bg-purple-100">
                          <Gauge className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{metrics.avg_speed} <span className="text-sm font-normal text-gray-500">km/h</span></div>
                          <p className="text-xs text-gray-500">Lane-weighted average</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emergency Status */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Emergency Alert</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${metrics.emergency_detected ? '!bg-red-100' : '!bg-green-100'}`}>
                          {metrics.emergency_detected 
                            ? <AlertTriangle className="h-5 w-5 text-red-600" />
                            : <CheckCircle2 className="h-5 w-5 text-green-600" />
                          }
                        </div>
                        <div>
                          <div className="text-lg font-semibold">
                            {metrics.emergency_detected ? 'ACTIVE' : 'Clear'}
                          </div>
                          <p className="text-xs text-gray-500">
                            {metrics.emergency_detected ? 'Priority override available' : 'No emergencies detected'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Recommendation */}
                <Alert className={getRecommendationStyle(metrics.signal_recommendation)}>
                  <Bot className="h-4 w-4" />
                  <AlertTitle>AI Signal Recommendation</AlertTitle>
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      Current strategy: <strong>{metrics.signal_recommendation.replace('_', ' ')}</strong>
                      {metrics.signal_recommendation === "EXTEND_GREEN" && " • Suggest +15s green time"}
                      {metrics.signal_recommendation === "EMERGENCY_OVERRIDE" && " • Activate emergency corridor"}
                    </span>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="ml-4 !bg-white hover:!bg-gray-100 text-gray-900 border border-gray-300"
                    >
                      Apply Recommendation
                    </Button>
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="lanes" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Lane-wise Density Analysis</CardTitle>
                    <CardDescription>Vehicle distribution across monitored lanes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(metrics.lane_density).map(([lane, count], idx) => {
                      const maxCount = Math.max(...Object.values(metrics.lane_density));
                      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      return (
                        <div key={lane} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium capitalize">{lane.replace('lane', 'Lane ')}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{count} vehicles</Badge>
                              <span className="text-gray-500 text-xs">{percentage.toFixed(0)}% of max</span>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Trends</CardTitle>
                    <CardDescription>Historical patterns (mock data for demo)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center border rounded-lg !bg-gray-50">
                      <p className="text-gray-500 text-sm">📊 Chart component would render here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Controls + Chat */}
          <div className="space-y-6">
            
            {/* Signal Control Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Signal Control
                </CardTitle>
                <CardDescription>Manual override for traffic signals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['lane1', 'lane2', 'lane3'].map((lane) => (
                  <div key={lane} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{lane.replace('lane', 'Lane ')}</span>
                      <Badge variant="outline" className="text-xs">
                        {metrics.lane_density[lane]} vehicles
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSignalOverride(lane, "EXTEND_GREEN")}
                        disabled={signalOverrides[`${lane}-EXTEND_GREEN`]}
                        className="justify-start !bg-green-50 hover:!bg-green-100 text-green-700 border-green-300"
                      >
                        {signalOverrides[`${lane}-EXTEND_GREEN`] 
                          ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> 
                          : <Play className="h-3 w-3 mr-1" />
                        }
                        Extend Green
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSignalOverride(lane, "FORCE_RED")}
                        disabled={signalOverrides[`${lane}-FORCE_RED`]}
                        className="justify-start !bg-red-50 hover:!bg-red-100 text-red-700 border-red-300"
                      >
                        {signalOverrides[`${lane}-FORCE_RED`] 
                          ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> 
                          : <Pause className="h-3 w-3 mr-1" />
                        }
                        Force Red
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <Button 
                  variant="destructive" 
                  className="w-full !bg-red-600 hover:!bg-red-700 text-white"
                  onClick={() => handleSignalOverride("all", "EMERGENCY_OVERRIDE")}
                  disabled={signalOverrides['all-EMERGENCY_OVERRIDE']}
                >
                  {signalOverrides['all-EMERGENCY_OVERRIDE']
                    ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    : <AlertTriangle className="h-4 w-4 mr-2" />
                  }
                  {signalOverrides['all-EMERGENCY_OVERRIDE'] ? 'Activating...' : '🚑 Emergency Override (All Lanes)'}
                </Button>
              </CardContent>
              <CardFooter className="text-xs text-gray-500">
                Overrides last 30 seconds • AI will resume after timeout
              </CardFooter>
            </Card>

            {/* AI Chat Assistant */}
            <Card className="flex flex-col h-[400px]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Traffic AI Assistant
                </CardTitle>
                <CardDescription>Ask about congestion, signals, or emergencies</CardDescription>
              </CardHeader>
              
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-3 pb-4">
                  {chatHistory.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-8">
                      <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Ask me anything about traffic conditions</p>
                      <p className="text-xs mt-1">Try: "What's the congestion level?" or "Any emergencies?"</p>
                    </div>
                  )}
                  
                  {chatHistory.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.user === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        msg.user === 'user' 
                          ? '!bg-blue-600 text-white' 
                          : msg.user === 'system'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-gray-100'
                      }`}>
                        {msg.user === 'ai' && msg.context && (
                          <div className="text-xs opacity-70 mb-1">
                            LCSI: {msg.context.lcsi} • {msg.context.recommendation}
                          </div>
                        )}
                        {msg.text}
                        <div className="text-[10px] opacity-60 mt-1 text-right">
                          {msg.timestamp?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              
              <CardFooter className="pt-0">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleChatSend(); }}
                  className="flex w-full gap-2"
                >
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about traffic..."
                    className="flex-1"
                    disabled={!metrics}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!chatInput.trim() || !metrics}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ControllerDashboard;