"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Maximize, Minimize, Database, Beaker, Compass, ChevronLeft, ChevronRight, Crosshair } from "lucide-react";
import CelestialViewport, { CELESTIAL_BODIES } from "@/components/WebGLViewport";
import { useSensors } from "@/hooks/useSensors";
import { Observer, Equator, Horizon, Body } from "astronomy-engine";

const getTelemetryData = (target: string) => {
  const dict: Record<string, any> = {
    sun: { mag: "-26.7", dist: "149.6 M km", type: "G-Type Main Sequence Star", temp: "5,500°C (Surface)", grav: "27.9g", atm: "Hydrogen, Helium", desc: "The central anchor of the solar system. Accounts for 99.8% of the system's mass." },
    mercury: { mag: "-0.4", dist: "77.3 M km", type: "Terrestrial Planet", temp: "-173°C to 427°C", grav: "0.38g", atm: "Exosphere (Trace)", desc: "Innermost planet. Lacks a true atmosphere, resulting in extreme temperature fluctuations." },
    venus: { mag: "-4.6", dist: "41.4 M km", type: "Terrestrial Planet", temp: "462°C", grav: "0.90g", atm: "Carbon Dioxide, Nitrogen", desc: "Dense toxic atmosphere with runaway greenhouse effect. Hottest planet in the solar system." },
    earth: { mag: "N/A", dist: "0 km", type: "Terrestrial Planet", temp: "15°C (Avg)", grav: "1.00g", atm: "Nitrogen, Oxygen", desc: "Current observation waypoint. The only known planetary body to support active biospheres." },
    luna: { mag: "-12.7", dist: "384,400 km", type: "Natural Satellite", temp: "-173°C to 127°C", grav: "0.16g", atm: "None", desc: "Earth's sole moon. Tidally locked, presenting only one face to the primary." },
    mars: { mag: "-2.9", dist: "78.3 M km", type: "Terrestrial Planet", temp: "-63°C (Avg)", grav: "0.38g", atm: "Carbon Dioxide", desc: "The Red Planet. Features massive extinct volcanoes and deep canyon systems." },
    jupiter: { mag: "-2.9", dist: "628.7 M km", type: "Gas Giant", temp: "-108°C", grav: "2.52g", atm: "Hydrogen, Helium", desc: "Largest planet in the system. Home to the Great Red Spot, a massive ongoing storm." },
    saturn: { mag: "-0.2", dist: "1.2 B km", type: "Gas Giant", temp: "-139°C", grav: "1.06g", atm: "Hydrogen, Helium", desc: "Known for its extensive, highly complex ring system made of ice and rock debris." },
    titan: { mag: "8.2", dist: "1.2 B km", type: "Natural Satellite", temp: "-179°C", grav: "0.14g", atm: "Nitrogen, Methane", desc: "Saturn's largest moon. The only moon with a dense atmosphere and liquid surface lakes." },
  };

  const normalizedTarget = target.toLowerCase();
  return dict[normalizedTarget] || { mag: "N/A", dist: "Unknown", type: "Unknown Body", temp: "N/A", grav: "N/A", atm: "Unknown", desc: "Telemetry tracking unavailable for this node." };
};

const getAstronomyBody = (target: string): Body | null => {
  const map: Record<string, Body> = {
    sun: Body.Sun,
    luna: Body.Moon,
    mercury: Body.Mercury,
    venus: Body.Venus,
    mars: Body.Mars,
    jupiter: Body.Jupiter,
    saturn: Body.Saturn,
    uranus: Body.Uranus,
    neptune: Body.Neptune,
    pluto: Body.Pluto
  };
  return map[target.toLowerCase()] || null;
};

export default function Dashboard() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTarget, setActiveTarget] = useState<string>("Saturn");
  const [liveTelemetry, setLiveTelemetry] = useState(getTelemetryData("Saturn"));
  
  // LIVE ASTRONOMY STATE
  const [liveAlt, setLiveAlt] = useState<string>("---");
  const [liveAz, setLiveAz] = useState<string>("---");
  const [liveAzRaw, setLiveAzRaw] = useState<number | null>(null);

  const { location: gpsLocation, heading, error, isTracking, startTracking } = useSensors();

  const catalogList = Object.values(CELESTIAL_BODIES).flatMap((body: any) => [
    body.id,
    ...(body.moons?.map((m: any) => m.id) || [])
  ]);

  const filteredCatalog = catalogList.filter((item: string) =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("omni-search")?.focus();
      }
      if (e.key === "Escape") {
        setIsFullscreen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // THE LIVE CALCULATION LOOP
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isTracking && gpsLocation) {
      intervalId = setInterval(() => {
        const astroBody = getAstronomyBody(activeTarget);
        if (astroBody) {
          const date = new Date();
          const observer = new Observer(gpsLocation.lat, gpsLocation.lng, 0);
          
          const equ_2000 = Equator(astroBody, date, observer, true, true);
          const hor = Horizon(date, observer, equ_2000.ra, equ_2000.dec, "normal");
          
          setLiveAlt(hor.altitude.toFixed(2) + "°");
          setLiveAz(hor.azimuth.toFixed(2) + "°");
          setLiveAzRaw(hor.azimuth); // Store raw number for AR math
        } else {
          setLiveAlt("N/A");
          setLiveAz("N/A");
          setLiveAzRaw(null);
        }
      }, 1000); 
    }

    return () => clearInterval(intervalId);
  }, [isTracking, gpsLocation, activeTarget]);

  const executeSearch = (target: string) => {
    setActiveTarget(target);
    setLiveTelemetry(getTelemetryData(target));
    setLiveAlt("---"); 
    setLiveAz("---");
    setLiveAzRaw(null);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleSearchKeypress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filteredCatalog.length > 0) {
      executeSearch(filteredCatalog[0]);
    }
  };

  // --- AR LOCK MATH ---
  let arState = "SEARCHING";
  let offsetDeg = 0;
  
  if (isTracking && heading !== null && liveAzRaw !== null) {
    // Calculate shortest turn direction
    let diff = (liveAzRaw - heading + 360) % 360;
    if (diff > 180) diff -= 360;
    
    offsetDeg = Math.abs(diff);
    
    // 5 degree tolerance for a "Lock"
    if (offsetDeg <= 5) {
      arState = "LOCKED";
    } else if (diff > 0) {
      arState = "RIGHT";
    } else {
      arState = "LEFT";
    }
  }

  return (
    <main className="w-full h-[calc(100vh-73px)] bg-[#020202] text-white flex flex-col font-sans overflow-hidden">
      
      {/* SEARCH BAR COMPONENT */}
      <div className="w-full px-6 py-4 flex items-center z-40 shrink-0 border-b border-neutral-900/50">
        <div className="relative w-full max-w-md">
          <div className="flex items-center bg-[#0A0A0A] border border-neutral-800 rounded px-3 py-1.5 focus-within:border-[#00FF66]/50 transition-colors">
            <Search size={14} className="text-neutral-500 mr-2" />
            <input
              id="omni-search"
              type="text"
              placeholder="LOOKUP OBJECT (E.G., SATURN, TITAN)..."
              className="bg-transparent w-full outline-none text-xs font-mono text-white placeholder-neutral-600 uppercase tracking-widest"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeypress}
              autoComplete="off"
            />
          </div>
          
          <AnimatePresence>
            {isSearchOpen && searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 w-full mt-2 bg-[#050505] border border-neutral-800 rounded-lg overflow-hidden shadow-2xl z-50 max-h-64 overflow-y-auto"
              >
                {filteredCatalog.length > 0 ? (
                  filteredCatalog.map((item) => (
                    <div
                      key={item}
                      onClick={() => executeSearch(item)}
                      className="w-full text-left px-4 py-3 hover:bg-neutral-900 transition-colors border-b border-neutral-900/50 last:border-0 flex justify-between items-center group cursor-pointer"
                    >
                      <span className="text-xs font-mono text-neutral-300 group-hover:text-[#00FF66]">{item}</span>
                      <span className="text-[9px] font-mono tracking-widest group-hover:text-[#00FF66] text-transparent transition-colors">Press Enter</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-[10px] font-mono text-neutral-600 tracking-widest uppercase">No Targets Matched</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MAIN DASHBOARD CONTENT */}
      <div className="flex-1 flex gap-4 p-4 pt-0 overflow-hidden relative">
        
        {/* LEFT COLUMN: DYNAMIC TELEMETRY DATA */}
        <div className={`transition-all duration-500 flex flex-col gap-4 shrink-0 overflow-y-auto ${isFullscreen ? "w-0 opacity-0 pointer-events-none" : "w-80 opacity-100"}`}>
          
          <div className="bg-[#0A0A0A] border border-neutral-900 rounded-lg p-6 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-mono tracking-widest text-neutral-500 border-b border-neutral-800 pb-2 mb-4 uppercase">
                  Active Telemetry Node
                </div>
                <h1 className="text-3xl font-semibold tracking-wide text-white">{activeTarget}</h1>
                <div className="text-[10px] font-mono text-[#00FF66] mt-1 uppercase tracking-widest">{liveTelemetry.type}</div>
              </div>
            </div>

            {/* SENSOR CONTROL UI */}
            <div className="border-t border-neutral-800 pt-4">
               {!isTracking ? (
                  <button
                    onClick={startTracking}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-[#00FF66]/30 text-[#00FF66] text-[10px] font-mono tracking-widest uppercase hover:bg-[#00FF66]/10 transition-colors rounded"
                  >
                    <Compass size={14} /> Calibrate Live Sensors
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2 font-mono text-[10px]">
                      <div className="flex justify-between items-center text-[#00FF66]">
                        <span className="flex items-center gap-2"><Compass size={12} className="animate-pulse" /> Sensors Active</span>
                        <span>Heading: {heading ? `${heading.toFixed(1)}°` : "Calibrating..."}</span>
                      </div>
                      <div className="text-neutral-500 flex justify-between">
                        <span>LAT: {gpsLocation?.lat?.toFixed(4) || "--"}</span>
                        <span>LNG: {gpsLocation?.lng?.toFixed(4) || "--"}</span>
                      </div>
                    </div>

                    {/* AR NAVIGATION UI BLOCK */}
                    {liveAzRaw !== null && heading !== null && (
                      <div className={`p-4 rounded border flex flex-col items-center justify-center transition-all duration-300 ${
                        arState === "LOCKED" 
                          ? "bg-[#00FF66]/10 border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.15)]" 
                          : "bg-[#050505] border-neutral-800"
                      }`}>
                        {arState === "LOCKED" ? (
                          <motion.div 
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="flex items-center gap-2 text-[#00FF66] font-mono font-bold tracking-widest"
                          >
                            <Crosshair size={16} className="animate-pulse" />
                            TARGET LOCKED
                          </motion.div>
                        ) : arState === "LEFT" ? (
                          <div className="flex w-full items-center justify-between text-[#00FF66] font-mono text-[10px] tracking-widest">
                            <motion.div animate={{ x: [-2, -6, -2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex items-center">
                              <ChevronLeft size={16} /> TURN LEFT
                            </motion.div>
                            <span className="text-neutral-400">OFFSET: {offsetDeg.toFixed(1)}°</span>
                          </div>
                        ) : (
                          <div className="flex w-full items-center justify-between text-[#00FF66] font-mono text-[10px] tracking-widest">
                            <span className="text-neutral-400">OFFSET: {offsetDeg.toFixed(1)}°</span>
                            <motion.div animate={{ x: [2, 6, 2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex items-center">
                              TURN RIGHT <ChevronRight size={16} />
                            </motion.div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {error && <p className="text-red-500 text-[10px] mt-2 font-mono text-center">{error}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-neutral-800 pt-4">
              <div>
                <div className="text-[9px] font-mono text-neutral-500 uppercase mb-1">Altitude (Tilt)</div>
                <div className="text-lg font-mono text-white">{!isTracking ? "---" : liveAlt}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-neutral-500 uppercase mb-1">Azimuth (Heading)</div>
                <div className="text-lg font-mono text-white">{!isTracking ? "---" : liveAz}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-neutral-500 uppercase mb-1">Visual Mag</div>
                <div className="text-lg font-mono text-white">{liveTelemetry.mag}</div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-neutral-500 uppercase mb-1">Distance Ref</div>
                <div className="text-lg font-mono text-white">{liveTelemetry.dist}</div>
              </div>
            </div>

            <p className="text-xs font-sans text-neutral-400 leading-relaxed pt-4 border-t border-neutral-900">
              {liveTelemetry.desc}
            </p>
          </div>

          <div className="bg-[#0A0A0A] border border-neutral-900 rounded-lg p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#00FF66] font-mono tracking-widest text-[10px] uppercase border-b border-neutral-900 pb-3">
              <Database size={12} /> Planetary Analytics
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#050505] border border-neutral-800/50 p-3 rounded-md">
                <div className="text-[8px] font-mono text-neutral-500 uppercase mb-1 tracking-widest">Surface Temp</div>
                <div className="text-sm font-mono text-white">{liveTelemetry.temp}</div>
              </div>
              <div className="bg-[#050505] border border-neutral-800/50 p-3 rounded-md">
                <div className="text-[8px] font-mono text-neutral-500 uppercase mb-1 tracking-widest">Gravity (vs Earth)</div>
                <div className="text-sm font-mono text-white">{liveTelemetry.grav}</div>
              </div>
            </div>

            <div className="bg-[#050505] border border-neutral-800/50 p-3 rounded-md mt-auto">
              <div className="flex items-center gap-2 text-[8px] font-mono text-neutral-500 uppercase mb-2 tracking-widest">
                <Beaker size={10} /> Atmospheric Composition
              </div>
              <div className="text-xs font-mono text-neutral-300">
                {liveTelemetry.atm}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D VIEWPORT */}
        <div className={`transition-all duration-500 ease-in-out ${isFullscreen ? "w-full" : "flex-1"} relative rounded-lg overflow-hidden border border-neutral-800 bg-black`}>
          <CelestialViewport activeTarget={activeTarget} />
          
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
            <div className="bg-black/60 backdrop-blur-md border border-neutral-800/50 px-3 py-2 rounded flex flex-col items-end pointer-events-none">
              <span className="text-[9px] font-mono text-neutral-500 tracking-widest uppercase">Target Locked:</span>
              <span className="text-xs font-bold text-[#00FF66] tracking-widest uppercase">{activeTarget}</span>
            </div>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="bg-black/60 backdrop-blur-md border border-neutral-800/50 p-2.5 rounded text-neutral-400 hover:text-white hover:border-[#00FF66]/50 transition-all group pointer-events-auto">
              {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}