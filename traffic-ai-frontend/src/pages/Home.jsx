import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Camera, 
  BarChart3, 
  BrainCircuit, 
  Leaf, 
  Activity,
  Moon,
  Sun,
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
  Sparkles,
  Shield,
  Zap,
  Globe,
  TrendingUp,
  Clock,
  Cloud,
  Map
} from "lucide-react";

const Home = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle mouse move for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Real-time Detection",
      desc: "High-precision vehicle tracking using YOLOv8 + DeepSORT computer vision.",
      color: "from-cyan-400 to-blue-500",
      stats: "99.7% accuracy",
      gradient: "cyan"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Congestion Analysis",
      desc: "Live lane density metrics and bottleneck identification with LCSI scoring.",
      color: "from-purple-400 to-pink-500",
      stats: "Real-time LCSI",
      gradient: "purple"
    },
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: "AI Prediction",
      desc: "Forecasting traffic flow with GCN + LSTM attention models (5-min ahead).",
      color: "from-pink-400 to-rose-500",
      stats: "92% accuracy",
      gradient: "pink"
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Eco Impact",
      desc: "Estimate CO₂ reduction and time saved with adaptive signal control.",
      color: "from-green-400 to-emerald-500",
      stats: "35% reduction",
      gradient: "green"
    }
  ];

  const stats = [
    { icon: <Globe className="w-5 h-5" />, value: "3", label: "Lanes Monitored", change: "+2 this month" },
    { icon: <Clock className="w-5 h-5" />, value: "24/7", label: "Real-time Analysis", change: "99.9% uptime" },
    { icon: <TrendingUp className="w-5 h-5" />, value: "45s", label: "Avg. Wait Reduction", change: "vs traditional" },
    { icon: <Cloud className="w-5 h-5" />, value: "2.4kg", label: "CO₂ Saved/Hour", change: "per intersection" }
  ];

  const testimonials = [
    {
      quote: "Reduced congestion by 40% in first week. The AI predictions are remarkably accurate.",
      author: "Dr. Sarah Chen",
      role: "Transportation Director",
      city: "Singapore"
    },
    {
      quote: "The real-time LCSI scoring helped us optimize signal timing across 15 intersections.",
      author: "Marcus Rivera",
      role: "City Planner",
      city: "Barcelona"
    },
    {
      quote: "Environmental impact tracking showed 35% reduction in idle emissions.",
      author: "Elena Voskov",
      role: "Sustainability Officer",
      city: "Amsterdam"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200' 
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-800'
    } overflow-hidden relative`}>
      
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" 
           style={{
             backgroundImage: `radial-gradient(circle at 1px 1px, ${
               darkMode ? '#3b82f6' : '#6366f1'
             } 1px, transparent 0)`,
             backgroundSize: '50px 50px'
           }} />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse pointer-events-none"
           style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"
           style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` }} />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? darkMode 
            ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50 py-3' 
            : 'bg-white/95 backdrop-blur-xl border-b border-slate-200/50 py-3'
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Activity className={`w-7 h-7 transition-colors ${
                darkMode ? 'text-cyan-400' : 'text-cyan-600'
              } group-hover:scale-110 transition-transform duration-300`} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
            </div>
            <span className={`font-bold text-xl tracking-tight ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Urban<span className="text-cyan-500">Pulse</span>
              <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                v2.0
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                darkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Dashboard Button */}
            <Link to="/dashboard">
              <button className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95">
                <span>Launch Dashboard</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-xs font-medium ${
                darkMode 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                  : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
              }`}>
                <span className="relative flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  System Operational • 3 Lanes Active
                </span>
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              <span className={darkMode ? 'text-white' : 'text-slate-900'}>
                Intelligence for{' '}
                <br />
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 relative">
                Urban Mobility
                <Sparkles className="absolute -top-6 -right-8 w-6 h-6 text-yellow-400 animate-spin-slow" />
              </span>
            </h1>
            
            <p className={`text-lg md:text-xl leading-relaxed max-w-xl ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              AI-Powered Traffic Intelligence System designed to optimize flow, 
              reduce congestion, and build sustainable cities using real-time computer vision 
              and deep learning.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard">
                <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl transition-all hover:shadow-2xl hover:shadow-cyan-500/30 hover:scale-105 active:scale-95">
                  <span>Explore Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </button>
              </Link>
              
              <button className={`px-8 py-4 rounded-xl font-semibold transition-all ${
                darkMode 
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}>
                Watch Demo
              </button>
            </div>

            {/* Live Stats Ticker */}
            <div className="flex items-center gap-6 pt-8">
              {stats.slice(0, 2).map((stat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    darkMode ? 'bg-slate-800' : 'bg-slate-100'
                  }`}>
                    {React.cloneElement(stat.icon, { 
                      className: darkMode ? 'text-cyan-400' : 'text-cyan-600' 
                    })}
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>{stat.value}</div>
                    <div className="text-xs text-slate-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Dashboard Preview */}
          <div className="relative">
            <div className={`relative rounded-2xl overflow-hidden shadow-2xl ${
              darkMode ? 'shadow-cyan-500/10' : 'shadow-slate-500/20'
            }`}>
              <img 
                src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Dashboard Preview"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              
              {/* Overlay Stats */}
              <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
                <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-slate-800">
                  <div className="text-xs text-cyan-400">Lane 1</div>
                  <div className="text-white font-bold">12 vehicles</div>
                  <div className="text-xs text-green-400">LCSI: 0.45</div>
                </div>
                <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-slate-800">
                  <div className="text-xs text-purple-400">Lane 2</div>
                  <div className="text-white font-bold">8 vehicles</div>
                  <div className="text-xs text-yellow-400">LCSI: 0.32</div>
                </div>
                <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-slate-800">
                  <div className="text-xs text-pink-400">Lane 3</div>
                  <div className="text-white font-bold">15 vehicles</div>
                  <div className="text-xs text-red-400">LCSI: 0.78</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-32">
          {stats.map((stat, idx) => (
            <div key={idx} className={`p-6 rounded-2xl ${
              darkMode 
                ? 'bg-slate-900/50 border border-slate-800' 
                : 'bg-white border border-slate-200 shadow-lg'
            } backdrop-blur-sm`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                darkMode ? 'bg-slate-800' : 'bg-slate-100'
              }`}>
                {React.cloneElement(stat.icon, { 
                  className: darkMode ? 'text-cyan-400' : 'text-cyan-600' 
                })}
              </div>
              <div className={`text-3xl font-bold mb-1 ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>{stat.value}</div>
              <div className="text-sm text-slate-500 mb-2">{stat.label}</div>
              <div className="text-xs text-green-500">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-32">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Powered by Advanced AI
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Our system combines computer vision, graph neural networks, and real-time analytics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className={`group relative p-6 rounded-2xl transition-all duration-500 hover:-translate-y-2 ${
                  darkMode 
                    ? 'bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80' 
                    : 'bg-white border border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl'
                } backdrop-blur-sm overflow-hidden`}
              >
                {/* Gradient Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} p-0.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`w-full h-full rounded-lg ${
                    darkMode ? 'bg-slate-900' : 'bg-white'
                  } flex items-center justify-center`}>
                    <div className={darkMode ? 'text-white' : 'text-slate-900'}>
                      {feature.icon}
                    </div>
                  </div>
                </div>
                
                <h3 className={`text-lg font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {feature.title}
                </h3>
                
                <p className={`text-sm mb-4 ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {feature.desc}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono ${
                    darkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {feature.stats}
                  </span>
                  <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-32">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Trusted by Cities Worldwide
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              See what traffic engineers and city planners are saying
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className={`p-6 rounded-2xl ${
                darkMode 
                  ? 'bg-slate-900/50 border border-slate-800' 
                  : 'bg-white border border-slate-200 shadow-lg'
              }`}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className={`text-sm mb-4 italic ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-semibold ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>{testimonial.author}</div>
                    <div className="text-xs text-slate-500">{testimonial.role}</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {testimonial.city}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className={`relative rounded-3xl p-12 text-center overflow-hidden ${
          darkMode 
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800' 
            : 'bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-xl'
        }`}>
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          
          <div className="relative z-10">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Ready to Transform Your City's Traffic?
            </h2>
            <p className={`text-lg mb-8 max-w-2xl mx-auto ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Join hundreds of cities using UrbanPulse to reduce congestion and emissions
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/dashboard">
                <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl transition-all hover:shadow-2xl hover:shadow-cyan-500/30 hover:scale-105 active:scale-95">
                  <span>Get Started Now</span>
                  <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                </button>
              </Link>
              
              <button className={`px-8 py-4 rounded-xl font-semibold transition-all ${
                darkMode 
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}>
                Contact Sales
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-xs text-slate-500">Enterprise Grade</span>
              </div>
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-slate-500">Global Coverage</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-slate-500">Real-time Processing</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`w-full py-12 border-t ${
        darkMode ? 'border-slate-900 bg-slate-950' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className={`w-5 h-5 ${
                  darkMode ? 'text-cyan-400' : 'text-cyan-600'
                }`} />
                <span className={`font-bold ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>UrbanPulse</span>
              </div>
              <p className="text-xs text-slate-500">
                AI-powered traffic intelligence for smarter, sustainable cities.
              </p>
            </div>
            
            {['Product', 'Company', 'Resources'].map((section) => (
              <div key={section}>
                <h4 className={`text-sm font-semibold mb-4 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>{section}</h4>
                <ul className="space-y-2 text-xs text-slate-500">
                  <li className="hover:text-cyan-400 cursor-pointer">Features</li>
                  <li className="hover:text-cyan-400 cursor-pointer">Pricing</li>
                  <li className="hover:text-cyan-400 cursor-pointer">API</li>
                </ul>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} UrbanPulse AI. All rights reserved.
            </p>
            
            <div className="flex gap-4 mt-4 md:mt-0">
              {[Github, Twitter, Linkedin].map((Icon, idx) => (
                <Icon key={idx} className={`w-4 h-4 cursor-pointer transition-colors ${
                  darkMode ? 'text-slate-500 hover:text-cyan-400' : 'text-slate-400 hover:text-cyan-600'
                }`} />
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

// Star component for testimonials
const Star = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default Home;