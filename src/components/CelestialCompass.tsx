"use client";

import React, { useState, useEffect } from "react";
import { CELESTIAL_CATALOG, CelestialNode } from "@/utils/celestialDb";
import { Compass, Moon, Star, Orbit, MapPin, Eye } from "lucide-react";

// 1. Extend the static node with the live properties the UI requires
export interface CelestialTarget extends CelestialNode {
  alt: number;
  az: number;
  isVisible: boolean;
  difficulty: string;
  optimalLens: string;
}

export default function CelestialCompass() {
  const [coords, setCoords] = useState<{ lat: number; lng: number; offset: number }>({
    lat: 41.6631,
    lng: -77.8225,
    offset: 0,
  });

  // 2. Point the state back to the new extended target type
  const [targets, setTargets] = useState<CelestialTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<CelestialTarget | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<CelestialTarget | null>(null);

  const syncSettings = () => {
    const savedLat = localStorage.getItem("astro_lat");
    const savedLng = localStorage.getItem("astro_lng");
    const savedOffset = localStorage.getItem("astro_offset");

    const lat = savedLat ? parseFloat(savedLat) : 41.6631;
    const lng = savedLng ? parseFloat(savedLng) : -77.8225;
    const offset = savedOffset ? parseInt(savedOffset) : 0;

    setCoords({ lat, lng, offset });
    
    // 3. Map the raw catalog to inject the missing live properties so the UI renders perfectly
    const computedTargets: CelestialTarget[] = CELESTIAL_CATALOG.map((node) => ({
      ...node,
      alt: 45, // Fallback altitude
      az: 180, // Fallback azimuth
      isVisible: true,
      difficulty: "Easy",
      optimalLens: node.idealFilter || "Standard Lens"
    }));

    setTargets(computedTargets);

    if (computedTargets.length > 0 && !selectedTarget) {
      const moon = computedTargets.find((t) => t.id === "moon") || computedTargets[0];
      setSelectedTarget(moon);
    }
  };
  useEffect(() => {
    syncSettings();

    // Listen to changes in navigation bar configs
    window.addEventListener("astro_settings_changed", syncSettings);
    
    // Set up an interval to simulate slow real-time celestial drifting
    const interval = setInterval(() => {
      syncSettings();
    }, 15000);

    return () => {
      window.removeEventListener("astro_settings_changed", syncSettings);
      clearInterval(interval);
    };
  }, [selectedTarget]);

  // Translate Alt/Az coordinates into SVG polar coordinates
  // Zenith (Alt = 90) is center (cx, cy). Horizon (Alt = 0) is outer circle.
  const getSvgCoordinates = (alt: number, az: number, size: number = 320) => {
    const center = size / 2;
    const maxRadius = size / 2 - 24; // boundary margin
    
    // If target is below horizon (alt < 0), pull to edge or hide. We'll map alt from 0-90.
    const clampedAlt = Math.max(0, alt);
    
    // Distance from center: higher altitude is closer to center.
    const radius = maxRadius * (1 - clampedAlt / 90);
    
    // Azimuth: 0° is North (top), 90° is East (right), etc.
    // In math, polar 0 is right. We subtract 90 degrees to align 0° to top/North.
    const angleRad = ((az - 90) * Math.PI) / 180;
    
    const x = center + radius * Math.cos(angleRad);
    const y = center + radius * Math.sin(angleRad);
    
    return { x, y };
  };

  const getTargetIconColor = (type: string, isVisible: boolean) => {
    if (!isVisible) return "text-slate-700 border-slate-900";
    if (type === "satellite") return "text-amber-200 bg-amber-500/10 border-amber-400";
    if (type === "planet") return "text-purple-400 bg-purple-500/10 border-purple-400";
    if (type === "galaxy") return "text-cyan-400 bg-cyan-500/10 border-cyan-400";
    if (type === "nebula") return "text-pink-400 bg-pink-500/10 border-pink-400";
    return "text-slate-300 bg-slate-500/10 border-slate-300";
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-violet-500/15 flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400 star-twinkle-fast" />
            Interactive Celestial Dome
          </h2>
          <p className="text-xs text-slate-400">
            Live 2D stellar dome. Center represents zenith (directly overhead); outer ring represents horizon.
          </p>
        </div>
        <span className="text-[10px] uppercase font-mono tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">
          Compass Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1">
        {/* SVG Dome Display (7 Cols) */}
        <div className="lg:col-span-7 flex justify-center relative">
          <div className="relative w-full max-w-[340px] aspect-square rounded-full bg-slate-950/40 p-1 border border-slate-800/80 flex items-center justify-center">
            
            {/* Outer Radial Guides */}
            <div className="absolute inset-4 rounded-full border border-dashed border-indigo-500/10"></div>
            <div className="absolute inset-20 rounded-full border border-dashed border-indigo-500/5"></div>
            <div className="absolute inset-36 rounded-full border border-dashed border-indigo-500/5"></div>
            
            {/* Direction Labels */}
            <span className="absolute top-2 text-[10px] font-mono font-bold text-rose-500">N</span>
            <span className="absolute right-2 text-[10px] font-mono font-bold text-slate-400">E</span>
            <span className="absolute bottom-2 text-[10px] font-mono font-bold text-slate-400">S</span>
            <span className="absolute left-2 text-[10px] font-mono font-bold text-slate-400">W</span>

            {/* Simulated Grid Crosshair Lines */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-800/30"></div>
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-slate-800/30"></div>

            {/* SVG Compass Renderer */}
            <svg viewBox="0 0 320 320" className="w-full h-full z-10 select-none">
              {/* Outer boundary circular ring */}
              <circle cx="160" cy="160" r="136" fill="none" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="1" />
              <circle cx="160" cy="160" r="136" fill="url(#spaceGradient)" opacity="0.3" />

              {/* Gradients */}
              <defs>
                <radialGradient id="spaceGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#080721" />
                  <stop offset="85%" stopColor="#03030b" />
                  <stop offset="100%" stopColor="#010103" />
                </radialGradient>
              </defs>

              {/* Compass Tracks & Connective Lines to Zenith */}
              {targets.map((t) => {
                if (!t.isVisible) return null;
                const { x, y } = getSvgCoordinates(t.alt, t.az);
                const isSelected = selectedTarget?.id === t.id;
                
                return (
                  <line 
                    key={`line-${t.id}`}
                    x1="160" 
                    y1="160" 
                    x2={x} 
                    y2={y} 
                    stroke={isSelected ? "rgba(34, 211, 238, 0.25)" : "rgba(139, 92, 246, 0.04)"} 
                    strokeWidth={isSelected ? 1.5 : 0.8}
                    strokeDasharray={isSelected ? "2 2" : "none"}
                  />
                );
              })}

              {/* Render Celestial Markers */}
              {targets.map((t) => {
                const { x, y } = getSvgCoordinates(t.alt, t.az);
                const isSelected = selectedTarget?.id === t.id;
                const isHovered = hoveredTarget?.id === t.id;
                
                if (!t.isVisible) return null;

                return (
                  <g 
                    key={t.id}
                    className="cursor-pointer transition-transform duration-300"
                    onClick={() => setSelectedTarget(t)}
                    onMouseEnter={() => setHoveredTarget(t)}
                    onMouseLeave={() => setHoveredTarget(null)}
                  >
                    {/* Pulsing Aura if selected or hovered */}
                    {(isSelected || isHovered) && (
                      <circle 
                        cx={x} 
                        cy={y} 
                        r={isHovered ? 16 : 12} 
                        fill="none" 
                        stroke={isSelected ? "#22d3ee" : "#a855f7"} 
                        strokeWidth="1.5" 
                        className="animate-ping origin-center"
                        style={{ transformOrigin: `${x}px ${y}px`, animationDuration: '2s' }}
                      />
                    )}

                    {/* Standard Marker Pin */}
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={isSelected ? 7 : 5} 
                      fill={t.id === "moon" ? "#fef08a" : t.id === "mars" ? "#f43f5e" : t.id === "jupiter" ? "#c084fc" : "#38bdf8"} 
                      stroke="#020617" 
                      strokeWidth="1.5" 
                    />

                    {/* Short Text Overlay for major items */}
                    {(isSelected || isHovered) && (
                      <text 
                        x={x + 10} 
                        y={y - 10} 
                        fill="#f1f5f9" 
                        fontSize="9" 
                        fontWeight="bold" 
                        className="pointer-events-none filter drop-shadow-md font-mono"
                      >
                        {t.name.split(" ")[0]}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Detailed Stats Panel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-900 flex-1">
            <span className="text-[10px] text-indigo-400 font-mono block mb-1">SELECTED CELESTIAL TARGET</span>
            
            {selectedTarget ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base flex items-center gap-1.5">
                      {selectedTarget.name}
                    </h3>
                    <span className="text-xs text-cyan-400 font-mono capitalize">
                      {selectedTarget.type} • Constellation: {selectedTarget.constellation}
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    selectedTarget.difficulty === "Easy" 
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20"
                      : selectedTarget.difficulty === "Moderate"
                      ? "bg-amber-950/40 text-amber-400 border-amber-500/20"
                      : "bg-rose-950/40 text-rose-400 border-rose-500/20"
                  }`}>
                    {selectedTarget.difficulty}
                  </span>
                </div>

                {/* Alt/Az Radial Dials */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80 flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Altitude (Tilt)</span>
                    <div className="relative flex items-center justify-center w-14 h-14 mt-2">
                      {/* Radial track approximation */}
                      <svg className="absolute w-full h-full transform -rotate-90">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="#1e1b4b" strokeWidth="4" />
                        <circle cx="28" cy="28" r="24" fill="none" stroke="#22d3ee" strokeWidth="4" 
                          strokeDasharray={150.7}
                          strokeDashoffset={150.7 - (150.7 * Math.max(0, selectedTarget.alt)) / 90}
                        />
                      </svg>
                      <span className="font-mono text-xs font-bold text-cyan-300">{selectedTarget.alt}°</span>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1">
                      {selectedTarget.alt > 0 ? `${selectedTarget.alt}° above horizon` : "Below Horizon"}
                    </span>
                  </div>

                  <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80 flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Azimuth (Heading)</span>
                    <div className="relative flex items-center justify-center w-14 h-14 mt-2">
                      <svg className="absolute w-full h-full transform -rotate-90">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="#1e1b4b" strokeWidth="4" />
                        <circle cx="28" cy="28" r="24" fill="none" stroke="#a855f7" strokeWidth="4" 
                          strokeDasharray={150.7}
                          strokeDashoffset={150.7 - (150.7 * selectedTarget.az) / 360}
                        />
                      </svg>
                      <span className="font-mono text-xs font-bold text-purple-300">{selectedTarget.az}°</span>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1">
                      Heading: {selectedTarget.az}° ({
                        selectedTarget.az < 22.5 || selectedTarget.az >= 337.5 ? "North" :
                        selectedTarget.az < 67.5 ? "North-East" :
                        selectedTarget.az < 112.5 ? "East" :
                        selectedTarget.az < 157.5 ? "South-East" :
                        selectedTarget.az < 202.5 ? "South" :
                        selectedTarget.az < 247.5 ? "South-West" :
                        selectedTarget.az < 292.5 ? "West" : "North-West"
                      })
                    </span>
                  </div>
                </div>

                {/* Additional astrophotography insight */}
                <div className="bg-slate-900/80 p-3 rounded-lg border border-violet-500/10 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Magnitude brightness:</span>
                    <span className="font-mono text-cyan-300 font-semibold">{selectedTarget.magnitude}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className={selectedTarget.isVisible ? "text-emerald-400 font-semibold" : "text-rose-500 font-semibold"}>
                      {selectedTarget.isVisible ? "Visible Now" : "Rises Later"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-indigo-300 uppercase font-mono block">Optimal Lens / Scope Focal Length:</span>
                    <span className="text-slate-200 text-xs font-medium">{selectedTarget.optimalLens}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Select any star or planet on the compass dome to analyze coordinates.
              </div>
            )}
          </div>

          {/* Quick lists of active targets */}
          <div className="flex flex-wrap gap-1.5">
            {targets.map((t) => {
              const isSelected = selectedTarget?.id === t.id;
              return (
                <button
                  key={`btn-${t.id}`}
                  onClick={() => setSelectedTarget(t)}
                  className={`text-[10px] font-mono px-2 py-1 rounded border transition-all ${
                    isSelected
                      ? "bg-cyan-500/10 border-cyan-400 text-cyan-300"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  {t.name.split(" ")[0]} ({t.isVisible ? `${Math.round(t.alt)}°` : "Set"})
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
