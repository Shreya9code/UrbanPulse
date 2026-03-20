import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const navItem = (path, name) => (
    <Link
      to={path}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        location.pathname === path
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      }`}
    >
      {name}
    </Link>
  );

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Activity className="text-blue-500" />
        <h2 className="text-xl font-semibold text-white tracking-wide">
          UrbanPulse
        </h2>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-3">
        {navItem("/", "Home")}
        {navItem("/dashboard", "Dashboard")}
      </div>

      {/* Status Indicator */}
      <div className="hidden md:flex items-center gap-2 text-sm text-green-400 font-medium">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        Live
      </div>
    </nav>
  );
};

export default Navbar;