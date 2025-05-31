
import React from "react";

export const TravelDestinationMockup = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
    <defs>
      <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#87CEEB" />
        <stop offset="100%" stopColor="#E0F6FF" />
      </linearGradient>
      <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8B7355" />
        <stop offset="100%" stopColor="#A0522D" />
      </linearGradient>
    </defs>
    
    {/* Sky */}
    <rect width="300" height="120" fill="url(#skyGradient)" />
    
    {/* Mountains */}
    <polygon points="0,120 80,60 160,120" fill="url(#mountainGradient)" />
    <polygon points="120,120 200,40 280,120" fill="url(#mountainGradient)" opacity="0.8" />
    
    {/* Sun */}
    <circle cx="250" cy="40" r="20" fill="#FFD700">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
    </circle>
    
    {/* Clouds */}
    <ellipse cx="60" cy="30" rx="25" ry="8" fill="white" opacity="0.7">
      <animateTransform attributeName="transform" type="translate" values="0 0;10 0;0 0" dur="8s" repeatCount="indefinite" />
    </ellipse>
    <ellipse cx="180" cy="50" rx="20" ry="6" fill="white" opacity="0.5">
      <animateTransform attributeName="transform" type="translate" values="0 0;-8 0;0 0" dur="6s" repeatCount="indefinite" />
    </ellipse>
    
    {/* Ground */}
    <rect y="120" width="300" height="80" fill="#228B22" />
    
    {/* Trees */}
    <rect x="40" y="100" width="8" height="20" fill="#8B4513" />
    <polygon points="44,100 34,80 54,80" fill="#228B22" />
    
    <rect x="220" y="105" width="6" height="15" fill="#8B4513" />
    <polygon points="223,105 218,90 228,90" fill="#228B22" />
  </svg>
);

export const HotelMockup = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
    <defs>
      <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F5F5F5" />
        <stop offset="100%" stopColor="#E5E5E5" />
      </linearGradient>
    </defs>
    
    {/* Sky */}
    <rect width="300" height="200" fill="#87CEEB" />
    
    {/* Main building */}
    <rect x="50" y="50" width="200" height="150" fill="url(#buildingGradient)" stroke="#D3D3D3" strokeWidth="2" />
    
    {/* Windows grid */}
    {Array.from({ length: 6 }).map((_, row) =>
      Array.from({ length: 8 }).map((_, col) => (
        <rect
          key={`${row}-${col}`}
          x={70 + col * 20}
          y={70 + row * 20}
          width="12"
          height="12"
          fill="#4A90E2"
          opacity={Math.random() > 0.3 ? "0.8" : "0.3"}
        />
      ))
    )}
    
    {/* Entrance */}
    <rect x="130" y="160" width="40" height="40" fill="#8B4513" />
    <rect x="140" y="170" width="20" height="30" fill="#654321" />
    
    {/* Entrance steps */}
    <rect x="125" y="195" width="50" height="5" fill="#A9A9A9" />
    
    {/* Palm trees */}
    <rect x="25" y="160" width="4" height="40" fill="#8B4513" />
    <ellipse cx="27" cy="155" rx="15" ry="8" fill="#228B22" />
    
    <rect x="270" y="170" width="4" height="30" fill="#8B4513" />
    <ellipse cx="272" cy="165" rx="12" ry="6" fill="#228B22" />
  </svg>
);

export const FlightMockup = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
    <defs>
      <linearGradient id="skyGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4A90E2" />
        <stop offset="100%" stopColor="#87CEEB" />
      </linearGradient>
    </defs>
    
    {/* Sky */}
    <rect width="300" height="200" fill="url(#skyGradient2)" />
    
    {/* Airplane */}
    <g transform="translate(150,100)">
      {/* Fuselage */}
      <ellipse cx="0" cy="0" rx="60" ry="8" fill="#E5E5E5" />
      
      {/* Wings */}
      <ellipse cx="-10" cy="0" rx="8" ry="25" fill="#D3D3D3" />
      
      {/* Tail */}
      <polygon points="50,0 60,-8 60,8" fill="#D3D3D3" />
      
      {/* Windows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <circle key={i} cx={-40 + i * 10} cy="-2" r="2" fill="#4A90E2" />
      ))}
      
      {/* Animation */}
      <animateTransform
        attributeName="transform"
        type="translate"
        values="50,120;250,80;50,120"
        dur="10s"
        repeatCount="indefinite"
      />
    </g>
    
    {/* Clouds */}
    <ellipse cx="80" cy="60" rx="30" ry="12" fill="white" opacity="0.8">
      <animateTransform attributeName="transform" type="translate" values="0 0;20 0;0 0" dur="12s" repeatCount="indefinite" />
    </ellipse>
    <ellipse cx="220" cy="40" rx="25" ry="10" fill="white" opacity="0.6">
      <animateTransform attributeName="transform" type="translate" values="0 0;-15 0;0 0" dur="8s" repeatCount="indefinite" />
    </ellipse>
  </svg>
);

export const MapMockup = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 300 200" className={`w-full h-full ${className}`}>
    <defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E5E5" strokeWidth="1" opacity="0.3" />
      </pattern>
    </defs>
    
    {/* Background */}
    <rect width="300" height="200" fill="#F0F8FF" />
    <rect width="300" height="200" fill="url(#grid)" />
    
    {/* Land masses */}
    <path d="M50,80 Q80,60 120,80 T180,90 Q200,100 220,85 T280,95 L280,150 Q250,140 200,145 T100,155 Q70,150 50,135 Z" 
          fill="#90EE90" opacity="0.7" />
    
    {/* Water bodies */}
    <ellipse cx="150" cy="120" rx="40" ry="25" fill="#4A90E2" opacity="0.6" />
    
    {/* Route line */}
    <path d="M50,50 Q100,80 150,70 T250,90" 
          stroke="#FF6B6B" 
          strokeWidth="3" 
          fill="none" 
          strokeDasharray="10,5">
      <animate attributeName="stroke-dashoffset" values="0;15;0" dur="2s" repeatCount="indefinite" />
    </path>
    
    {/* Location markers */}
    <circle cx="50" cy="50" r="8" fill="#FF6B6B">
      <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="150" cy="70" r="8" fill="#4ECDC4">
      <animate attributeName="r" values="8;12;8" dur="2s" begin="0.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="250" cy="90" r="8" fill="#45B7D1">
      <animate attributeName="r" values="8;12;8" dur="2s" begin="1s" repeatCount="indefinite" />
    </circle>
  </svg>
);
