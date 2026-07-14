"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Camera, Target, MapPin, SlidersHorizontal, Smartphone, AlertTriangle, CheckCircle2, Compass } from "lucide-react";
import { useSensors } from "@/hooks/useSensors";

type Mode = "PRO" | "MOBILE";

// Astronomical Database for Valid Targets
const VALID_TARGETS: Record<string, any> = {
  "orion nebula": { type: "Deep Sky", baseIso: 3200, rule: "500", wb: "3800K", ev: "-1.0" },
  "andromeda galaxy": { type: "Deep Sky", baseIso: 1600, rule: "500", wb: "3800K", ev: "-0.5" },
  "pleiades": { type: "Deep Sky", baseIso: 800, rule: "500", wb: "4000K", ev: "0.0" },
  "moon": { type: "Lunar", baseIso: 100, rule: "Override", shutter: "1/250", f: "f/8", wb: "5200K (Daylight)", ev: "-1.0" },
  "sun": { type: "Planetary", baseIso: 100, rule: "Override", shutter: "1/100", f: "f/11", wb: "5200K", ev: "-4.0" },
  "jupiter": { type: "Planetary", baseIso: 200, rule: "Override", shutter: "1/100", f: "f/8", wb: "5200K", ev: "-0.5" },
  "saturn": { type: "Planetary", baseIso: 400, rule: "Override", shutter: "1/60", f: "f/8", wb: "5200K", ev: "0.0" },
  "milky way core": { type: "Deep Sky", baseIso: 3200, rule: "500", wb: "3800K", ev: "0.0" },
  "perseid meteors": { type: "Meteor", baseIso: 6400, rule: "500", wb: "4000K", ev: "0.0" },
  "iss transit": { type: "Transit", baseIso: 800, rule: "Override", shutter: "1/1000", f: "f/5.6", wb: "Auto", ev: "0.0" }
};

export default function ExposureLaboratory() {
  // Navigation & Search State
  const [activeMode, setActiveMode] = useState<Mode>("PRO");
  const [searchQuery, setSearchQuery] = useState("");
  const [validationState, setValidationState] = useState<"IDLE" | "VALID" | "INVALID">("IDLE");

  // Mission States
  const [activeTarget, setActiveTarget] = useState("Milky Way Core");
  const [targetData, setTargetData] = useState(VALID_TARGETS["milky way core"]);
  const [location, setLocation] = useState("Delhi, India");

  // Environmental States
  const [bortleScale, setBortleScale] = useState(4);
  const [aqi, setAqi] = useState(150);
  const [weather, setWeather] = useState("Clear Skies");

  // Hardware States
  const [focalLength, setFocalLength] = useState(24);
  const [aperture, setAperture] = useState(2.8);
  const [mobileLens, setMobileLens] = useState("1x (26mm eq, f/1.7)");

  // UX States
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // SENSOR HOOK INTEGRATION
  const { location: gpsLocation, heading, error, isTracking, startTracking } = useSensors();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const query = searchQuery.toLowerCase().trim();
      if (VALID_TARGETS[query]) {
        setValidationState("VALID");
        setActiveTarget(query.toUpperCase());
        setTargetData(VALID_TARGETS[query]);
        setShowResults(false);
      } else {
        setValidationState("INVALID");
        setShowResults(false);
      }
    }
  };

  const initiateTelemetry = () => {
    if (validationState === "INVALID") return;
    setIsCalculating(true);
    setShowResults(false);
    setTimeout(() => {
      setIsCalculating(false);
      setShowResults(true);
    }, 3200); 
  };

  // THE MASTER MATH ENGINE
  let finalShutter = "";
  let finalAperture = "";
  let finalIso = "";
  let finalWb = targetData.wb;
  let finalEv = targetData.ev;
  let finalLens = "";

  if (activeMode === "PRO") {
    finalLens = focalLength < 35 ? "Ultra Wide" : focalLength <= 85 ? "Standard" : focalLength < 200 ? "Telephoto" : "Super Tele";
    finalAperture = targetData.rule === "Override" ? targetData.f : `f/${aperture.toFixed(1)}`;
    finalShutter = targetData.rule === "Override" ? targetData.shutter : `${Math.max(1, Math.floor(500 / focalLength))}s`;
    let calculatedIso = targetData.baseIso;
    if (targetData.type === "Deep Sky" || targetData.type === "Meteor") {
      if (bortleScale > 5) calculatedIso = Math.max(800, calculatedIso / 2); 
      else if (bortleScale < 3) calculatedIso = Math.min(6400, calculatedIso * 2);
    }
    finalIso = calculatedIso.toString();
  } else {
    // MOBILE MATH
    let isoMultiplier = 1;
    if (mobileLens.includes("0.5x")) { finalLens = "Computational Ultra Wide"; isoMultiplier = 0.5; }
    else if (mobileLens.includes("3x") || mobileLens.includes("5x")) { finalLens = "Computational Telephoto"; isoMultiplier = 2; }
    else { finalLens = "Computational Main"; }

    if (targetData.rule === "Override") {
      finalShutter = targetData.shutter;
      finalIso = targetData.baseIso.toString();
    } else {
      finalShutter = isoMultiplier > 1 ? "15s" : "30s";
      finalIso = (bortleScale > 6 ? 400 : 800).toString();
    }
  }

  return (
    <div className="w-full h-full min-h-[100dvh] bg-[#020202] text-white flex flex-col font-sans overflow-hidden">
      {/* 1. SEARCH BAR CONTAINER */}
      <div className="w-full border-b border-neutral-900/50 bg-[#0A0A0A] px-8 py-4 flex justify-between items-center shrink-0">
        <div className={`flex items-center bg-[#0A0A0A] border rounded px-3 py-1.5 transition-colors ${
          validationState === "IDLE" ? "border-neutral-800 focus-within:border-neutral-600" :
          validationState === "VALID" ? "border-[#A0FF66]/50 focus-within:border-[#A0FF66]" :
          "border-red-900 focus-within:border-red-500"
        }`}>
          <Search size={14} className={validationState === "INVALID" ? "text-red-500 mr-3" : "text-neutral-500 mr-3"} />
          <input
            type="text"
            placeholder="Search valid cosmic target..."
            className={`bg-transparent outline-none text-xs font-mono uppercase tracking-widest w-[250px] ${
              validationState === "INVALID" ? "text-red-500 placeholder-red-900" : "text-white placeholder-neutral-600"
            }`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setValidationState("IDLE");
            }}
            onKeyDown={handleSearch}
          />
        </div>
        
        {/* Validation Message Dropdown */}
        <div className="relative">
          <AnimatePresence>
            {validationState === "INVALID" && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-full mt-2 right-0 bg-red-950/50 border border-red-500 text-red-400 text-[10px] font-mono px-3 py-2 rounded flex items-center gap-2">
                <AlertTriangle size={12} /> Target unrecognized. Try "Moon", "Mars", or "Orion Nebula".
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* LEFT COLUMN: MISSION INPUTS */}
        <div className="lg:col-span-5 flex flex-col gap-6 p-8 border-r border-neutral-900/50">
          <div className="mb-2">
            <h1 className="text-2xl font-light tracking-[0.2em] uppercase mb-1 flex items-center gap-3">
              Exposure Laboratory
            </h1>
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              Calibrate absolute optical matrices based on local atmospheric telemetry.
            </p>
          </div>

          {/* Location & Atmosphere Panel */}
          <div className="bg-[#0A0A0A] border border-neutral-900 rounded p-6">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#A0FF66] uppercase border-b border-neutral-900 pb-3 mb-5">
              <MapPin size={14} /> Environmental Telemetry
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-2">Observation Coordinates / City:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-neutral-800 rounded p-2.5 text-xs font-mono text-white outline-none focus:border-[#A0FF66]/50"
                />
              </div>

              {/* SENSOR INTEGRATION UI */}
              <div className="mt-2 p-3 border border-neutral-800 rounded bg-[#050505]">
                {!isTracking ? (
                  <button
                    onClick={startTracking}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-[#A0FF66]/30 text-[#A0FF66] text-[10px] font-mono tracking-widest uppercase hover:bg-[#A0FF66]/10 transition-colors rounded"
                  >
                    <Compass size={14} /> Calibrate Live Sensors
                  </button>
                ) : (
                  <div className="space-y-2 font-mono text-[10px]">
                    <div className="flex justify-between items-center text-[#A0FF66]">
                      <span className="flex items-center gap-2"><Compass size={12} className="animate-pulse" /> Sensors Active</span>
                      <span>{heading ? `${heading.toFixed(1)}°` : "Calibrating..."}</span>
                    </div>
                    <div className="text-neutral-500 flex justify-between">
                      <span>LAT: {gpsLocation?.lat?.toFixed(4) || "--"}</span>
                      <span>LNG: {gpsLocation?.lng?.toFixed(4) || "--"}</span>
                    </div>
                  </div>
                )}
                {error && <p className="text-red-500 text-[10px] mt-2 font-mono">{error}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-2">Weather Profile:</label>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-neutral-800 rounded p-2.5 text-xs font-mono text-white outline-none focus:border-[#A0FF66]/50 appearance-none"
                  >
                    <option>Clear Skies</option>
                    <option>High Cirrus Clouds</option>
                    <option>Partial Cloud Cover</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Air Quality (AQI):</label>
                    <span className={`text-[9px] font-mono font-bold ${aqi > 150 ? "text-yellow-500" : "text-white"}`}>{aqi}</span>
                  </div>
                  <input type="range" min="0" max="500" value={aqi} onChange={(e) => setAqi(Number(e.target.value))} className="w-full h-1 bg-neutral-800 rounded-full appearance-none accent-[#A0FF66]" />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Bortle Light Pollution:</label>
                  <span className={`text-[9px] font-mono font-bold ${bortleScale > 6 ? "text-red-400" : "text-white"}`}>Class {bortleScale}</span>
                </div>
                <input type="range" min="1" max="9" value={bortleScale} onChange={(e) => setBortleScale(Number(e.target.value))} className="w-full h-1 bg-neutral-800 rounded-full appearance-none accent-[#A0FF66]" />
                <div className="flex justify-between text-[8px] font-mono text-neutral-600 mt-2 uppercase">
                  <span>Dark Sky</span>
                  <span>Inner City</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hardware Rig Panel */}
          <div className="bg-[#0A0A0A] border border-neutral-900 rounded p-6">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-5">
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#A0FF66] uppercase">
                <Camera size={14} /> Active Hardware Rig
              </div>
              
              <div className="flex bg-[#0A0A0A] border border-neutral-800 rounded p-1 relative">
                <button onClick={() => setActiveMode("PRO")} className={`flex-1 py-1.5 px-3 text-[10px] font-mono tracking-widest z-10 transition-colors ${activeMode === "PRO" ? "text-black font-bold" : "text-neutral-500"}`}>
                  PRO DSLR/M
                </button>
                <button onClick={() => setActiveMode("MOBILE")} className={`flex-1 py-1.5 px-3 text-[10px] font-mono tracking-widest z-10 transition-colors ${activeMode === "MOBILE" ? "text-black font-bold" : "text-neutral-500"}`}>
                  COMPUTATIONAL MOBILE
                </button>
                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#A0FF66] rounded transition-transform duration-300 ease-out ${activeMode === "MOBILE" ? "translate-x-[calc(100%+2px)]" : "translate-x-0"}`} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeMode === "PRO" ? (
                <motion.div key="pro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Focal Length:</label>
                      <span className="text-xs font-mono text-white">{focalLength}mm</span>
                    </div>
                    <input type="range" min="14" max="600" value={focalLength} onChange={(e) => setFocalLength(Number(e.target.value))} className="w-full h-1 bg-neutral-800 rounded-full appearance-none accent-[#A0FF66]" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Maximum Aperture:</label>
                      <span className="text-xs font-mono text-white">f/{aperture.toFixed(1)}</span>
                    </div>
                    <input type="range" min="1.2" max="11" step="0.1" value={aperture} onChange={(e) => setAperture(Number(e.target.value))} className="w-full h-1 bg-neutral-800 rounded-full appearance-none accent-[#A0FF66]" />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="mobile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div>
                    <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-2">Active Sensor:</label>
                    <select value={mobileLens} onChange={(e) => setMobileLens(e.target.value)} className="w-full bg-[#0A0A0A] border border-neutral-800 rounded p-2.5 text-xs font-mono text-white outline-none focus:border-[#A0FF66]/50 appearance-none">
                      <option>0.5x (13mm eq, f/2.4)</option>
                      <option>1x (26mm eq, f/1.7)</option>
                      <option>3x (72mm eq, f/2.8)</option>
                    </select>
                  </div>
                  <div className="p-3 border border-blue-900/50 bg-blue-950/20 rounded flex gap-3 items-start">
                    <Smartphone size={14} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-mono text-blue-200/70 leading-relaxed uppercase tracking-wide">
                      Computational stacking requires extreme stabilization. Secure device to a tripod.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={initiateTelemetry}
            disabled={validationState === "INVALID"}
            className={`w-full font-bold text-xs font-mono py-4 rounded-xl uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(160,255,102,0.15)] ${
              validationState === "INVALID" ? "bg-neutral-800 text-neutral-600 cursor-not-allowed shadow-none" : "bg-[#A0FF66] hover:bg-[#80e555] text-black"
            }`}
          >
            Compute Mission Parameters
          </button>
        </div>

        {/* RIGHT COLUMN: DYNAMIC OUTPUT DASHBOARD */}
        <div className="lg:col-span-7 bg-[#050505] border-l border-neutral-900 overflow-hidden relative min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            {/* STATE 1: IDLE */}
            {!isCalculating && !showResults && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center text-neutral-600">
                <Target size={48} className="mb-4 opacity-20" />
                <span className="font-mono text-xs uppercase tracking-widest text-center leading-relaxed">
                  Awaiting Telemetry Input<br/>
                  <span className="text-[10px]">Use the search gateway to lock a celestial target.</span>
                </span>
              </motion.div>
            )}

            {/* STATE 2: REAL-TIME LUNAR PHASE LOADER */}
            {isCalculating && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-[#020202] z-10">
                <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                  <svg width="120" height="120" viewBox="0 0 100 100" className="drop-shadow-[0_0_10px_rgba(160,255,102,0.2)]">
                    <defs>
                      <clipPath id="moon-clip">
                        <circle cx="50" cy="50" r="48" />
                      </clipPath>
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="#1A1A1A" />
                    <motion.circle
                      cx="50" cy="50" r="48" fill="#A0FF66"
                      clipPath="url(#moon-clip)"
                      initial={{ x: -96 }}
                      animate={{ x: 96 }}
                      transition={{ duration: 3.2, ease: "linear", repeat: Infinity }}
                    />
                    <circle cx="50" cy="50" r="48" fill="none" stroke="#333" strokeWidth="1" />
                  </svg>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono text-[#A0FF66] tracking-widest uppercase animate-pulse">Computing Optical Matrices...</span>
                  <span className="text-neutral-500 font-mono text-[10px] tracking-widest uppercase">Applying Class {bortleScale} Bortle interference filters</span>
                </div>
              </motion.div>
            )}

            {/* STATE 3: PERFECTED PARAMETER DASHBOARD */}
            {showResults && !isCalculating && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 p-8 flex flex-col overflow-y-auto custom-scrollbar">
                
                <div className="flex justify-between items-start border-b border-neutral-900 pb-6 mb-6">
                  <div>
                    <div className="text-[10px] font-mono text-[#A0FF66] tracking-widest uppercase mb-1 flex items-center gap-2">
                      <CheckCircle2 size={12} /> Target Locked
                    </div>
                    <div className="text-3xl font-light tracking-wide text-white">{activeTarget}</div>
                    <div className="text-xs font-mono text-neutral-500 mt-2 flex items-center gap-2">
                      <Target size={12} /> {location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase mb-1">Observation Status</div>
                    <div className={`text-xs font-mono tracking-widest uppercase ${weather.includes("Clear") && aqi < 200 ? "text-[#A0FF66]" : "text-yellow-500"}`}>
                      {weather.includes("Clear") && aqi < 200 ? "GO FOR CAPTURE" : "SUB-OPTIMAL CLARITY"}
                    </div>
                  </div>
                </div>

                <h3 className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase mb-4">Calculated Sensor Telemetry</h3>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-[#0A0A0A] border border-neutral-800 rounded-lg p-5 flex flex-col justify-center">
                    <span className="font-mono text-[9px] tracking-widest text-neutral-500 mb-2">SHUTTER (<span className="text-neutral-300">s</span>)</span>
                    <span className="text-3xl font-light text-white">{finalShutter} <span className="text-lg text-neutral-600">s</span></span>
                  </div>
                  <div className="bg-[#0A0A0A] border border-neutral-800 rounded-lg p-5 flex flex-col justify-center">
                    <span className="font-mono text-[9px] tracking-widest text-neutral-500 mb-2">APERTURE (<span className="text-neutral-300">f</span>)</span>
                    <span className="text-3xl font-light text-white">{finalAperture}</span>
                  </div>
                  <div className="bg-[#0A0A0A] border border-neutral-800 rounded-lg p-5 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[#A0FF66]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="font-mono text-[9px] tracking-widest text-neutral-500 mb-2">TARGET ISO</span>
                    <span className="text-3xl font-light text-[#A0FF66]">{finalIso}</span>
                  </div>
                  <div className="bg-[#0A0A0A] border border-neutral-800 rounded-lg p-5 flex flex-col justify-center">
                    <span className="font-mono text-[9px] tracking-widest text-neutral-500 mb-2">WHITE BALANCE (<span className="text-neutral-300">wb</span>)</span>
                    <span className="text-xl font-light text-white mt-1">{finalWb}</span>
                  </div>
                  <div className="bg-[#0A0A0A] border border-neutral-800 rounded-lg p-5 flex flex-col justify-center">
                    <span className="font-mono text-[9px] tracking-widest text-neutral-500 mb-2">EXPOSURE COMP (<span className="text-neutral-300">ev</span>)</span>
                    <span className="text-xl font-light text-white mt-1">{finalEv}</span>
                  </div>
                  <div className="bg-[#0A0A0A] border border-neutral-800 rounded-lg p-5 flex flex-col justify-center">
                    <span className="font-mono text-[9px] tracking-widest text-neutral-500 mb-2">REQUIRED LENS</span>
                    <span className="text-sm font-light text-[#A0FF66] mt-1 uppercase tracking-wider">{finalLens}</span>
                  </div>
                </div>

                <h3 className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase mb-4">Tactical Capture Sequence</h3>
                <div className="space-y-3">
                  <div className="flex gap-4 bg-[#0A0A0A] border border-neutral-800 rounded-lg p-4">
                    <div className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-[10px] font-mono text-white shrink-0">1</div>
                    <div>
                      <div className="text-xs font-bold text-white mb-1 uppercase tracking-wide">Mount & Stabilization</div>
                      <p className="text-[10px] font-sans text-neutral-400 leading-relaxed">
                        {activeMode === "PRO" 
                          ? "Secure rig to a heavy equatorial mount or rigid tripod. Disable in-lens IS/VR to prevent floating element drift during the exposure."
                          : "Mount device securely. Do not touch the chassis during the exposure accumulation phase to prevent star trailing."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 bg-[#0A0A0A] border border-neutral-800 rounded-lg p-4">
                    <div className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-[10px] font-mono text-white shrink-0">2</div>
                    <div>
                      <div className="text-xs font-bold text-white mb-1 uppercase tracking-wide">Focus & Alignment</div>
                      <p className="text-[10px] font-sans text-neutral-400 leading-relaxed">
                        {activeMode === "PRO" 
                          ? "Switch to manual focus. Use live view digital zoom on a bright reference star (e.g., Sirius), rotating the focus ring until the star becomes a pinpoint."
                          : "Tap and hold on the brightest star on screen to lock AF/AE. Drag the exposure slider to match the calculated EV compensation."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 bg-[#0A0A0A] border border-neutral-800 rounded-lg p-4">
                    <div className="w-6 h-6 rounded-full bg-[#A0FF66]/20 border border-[#A0FF66]/50 flex items-center justify-center text-[10px] font-mono text-[#A0FF66] shrink-0">3</div>
                    <div>
                      <div className="text-xs font-bold text-[#A0FF66] mb-1 uppercase tracking-wide">Execution Parameters</div>
                      <p className="text-[10px] font-sans text-neutral-400 leading-relaxed">
                        Set a 2-second or 5-second capture delay timer to prevent mechanical shutter shake. {bortleScale > 4 && "Due to high Class " + bortleScale + " light pollution, expect a bright washed out raw image. Plan for heavy curve adjustments in post-processing."}
                      </p>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333333; }
      `}</style>
    </div>
  );
}