"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type RigMode = "DSLR" | "MOBILE";
type MobileOS = "APPLE" | "ANDROID";
type MobileLens = "ULTRAWIDE" | "MAIN" | "TELEPHOTO";
type MobileMount = "TRIPOD" | "HANDHELD";

export default function ExposureLaboratory() {
  const [activeMode, setActiveMode] = useState<RigMode>("DSLR");
  
  // Hardware State
  const [focalLength, setFocalLength] = useState(24);
  const [aperture, setAperture] = useState(1.4);
  const [mobileOS, setMobileOS] = useState<MobileOS>("ANDROID");
  const [mobileLens, setMobileLens] = useState<MobileLens>("MAIN");
  const [mobileMount, setMobileMount] = useState<MobileMount>("TRIPOD");

  // Environmental State
  const [bortleScale, setBortleScale] = useState(5);
  const [moonPhase, setMoonPhase] = useState(15);

  // --- THE LOGIC ENGINE --- //

  // 1. Environmental Adjustments
  let envWarning = "";
  let isoModifier = 1;

  if (bortleScale >= 7) {
    envWarning = "Heavy Light Pollution (City). Dropping ISO to prevent clipping. A Light Pollution Filter (LPF) is highly recommended.";
    isoModifier = 0.25; // Drop ISO by 2 stops
  } else if (bortleScale >= 5) {
    envWarning = "Moderate Light Pollution (Suburbs). Watch your histogram to ensure the sky background isn't overexposed.";
    isoModifier = 0.5; // Drop ISO by 1 stop
  } else if (bortleScale <= 2) {
    envWarning = "Pristine Dark Sky. Maximize light gathering; airglow will be your only natural limitation.";
    isoModifier = 2; // Can push ISO higher
  }

  if (moonPhase > 70) {
    envWarning += " Severe Lunar Washout. Shoot away from the moon or focus on planetary targets rather than deep sky.";
  }

  // 2. DSLR Calculation
  const dslrMaxShutter = (500 / focalLength).toFixed(1);
  let baseDslrIso = aperture <= 2.8 ? 1600 : 3200;
  const finalDslrIso = Math.min(Math.max(baseDslrIso * isoModifier, 400), 6400);

  // 3. Mobile Calculation
  let mobileShutter = "30s";
  let mobileISO = (800 * isoModifier).toString();
  let mobileFocus = "INFINITY (∞)";
  let mobileFormat = "RAW";
  let mobileWarning = "";

  if (mobileMount === "HANDHELD") {
    mobileShutter = "3s (Max)";
    mobileISO = "Auto";
    mobileWarning = "Handheld introduces severe motion blur. Brace against a wall and use a 3s timer.";
  } else {
    if (mobileOS === "APPLE") {
      mobileShutter = "30s (Night Mode)";
      mobileFormat = "Apple ProRAW";
      mobileISO = "Auto";
    } else {
      mobileShutter = mobileLens === "ULTRAWIDE" ? "30s" : "15s";
      mobileFormat = "RAW (Pro Mode)";
    }
  }

  if (mobileLens === "TELEPHOTO") {
    mobileWarning = "Telephoto sensors gather less light. Expect high noise. The Main (1x) lens is strongly recommended.";
    if (mobileMount === "TRIPOD") mobileShutter = "8s"; 
  }

  return (
    <div className="w-full min-h-screen bg-[#020202] text-white p-8 md:p-12 font-sans flex flex-col pt-24 overflow-x-hidden">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto w-full mb-10">
        <h1 className="text-3xl font-light tracking-[0.2em] uppercase mb-2">
          Exposure Laboratory
        </h1>
        <p className="text-neutral-500 font-mono text-xs max-w-xl leading-relaxed">
          Calibrate absolute exposures. System accounts for optical hardware matrices combined with active local atmospheric telemetry.
        </p>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Global Hardware Toggle */}
          <div className="flex bg-[#0A0A0A] border border-neutral-800 rounded-md p-1 relative w-full">
            <button
              onClick={() => setActiveMode("DSLR")}
              className={`flex-1 py-3 text-[10px] sm:text-xs font-mono tracking-widest z-10 transition-colors ${
                activeMode === "DSLR" ? "text-black font-bold" : "text-neutral-500 hover:text-white"
              }`}
            >
              PRO-RIG (OPTICAL)
            </button>
            <button
              onClick={() => setActiveMode("MOBILE")}
              className={`flex-1 py-3 text-[10px] sm:text-xs font-mono tracking-widest z-10 transition-colors ${
                activeMode === "MOBILE" ? "text-black font-bold" : "text-neutral-500 hover:text-white"
              }`}
            >
              MOBILE (COMPUTE)
            </button>
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#00FF66] rounded-sm transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                activeMode === "MOBILE" ? "translate-x-full" : "translate-x-0"
              }`}
            />
          </div>

          {/* Hardware Panel */}
          <div className="bg-[#050505] border border-neutral-900 p-6 rounded-lg">
            <AnimatePresence mode="wait">
              {/* DSLR CONTROLS */}
              {activeMode === "DSLR" && (
                <motion.div key="dslr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between font-mono text-xs text-neutral-400">
                      <span>FOCAL LENGTH</span>
                      <span className="text-white">{focalLength}mm</span>
                    </div>
                    <input type="range" min="14" max="600" step="1" value={focalLength} onChange={(e) => setFocalLength(Number(e.target.value))} className="w-full h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-[#00FF66]" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between font-mono text-xs text-neutral-400">
                      <span>APERTURE</span>
                      <span className="text-white">f/{aperture.toFixed(1)}</span>
                    </div>
                    <input type="range" min="1.2" max="11" step="0.1" value={aperture} onChange={(e) => setAperture(Number(e.target.value))} className="w-full h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-[#00FF66]" />
                  </div>
                </motion.div>
              )}

              {/* MOBILE CONTROLS */}
              {activeMode === "MOBILE" && (
                <motion.div key="mobile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div className="space-y-3">
                    <div className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase">Operating System</div>
                    <div className="flex gap-2">
                      {(["APPLE", "ANDROID"] as MobileOS[]).map((os) => (
                        <button key={os} onClick={() => setMobileOS(os)} className={`flex-1 py-2 text-xs font-mono border transition-all ${mobileOS === os ? "border-[#00FF66] text-[#00FF66] bg-[#00FF66]/10" : "border-neutral-800 text-neutral-400 hover:border-neutral-600"}`}>
                          {os === "APPLE" ? "iOS" : "ANDROID"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase">Active Sensor</div>
                    <div className="flex gap-2">
                      {(["ULTRAWIDE", "MAIN", "TELEPHOTO"] as MobileLens[]).map((lens) => (
                        <button key={lens} onClick={() => setMobileLens(lens)} className={`flex-1 py-2 text-[10px] font-mono border transition-all ${mobileLens === lens ? "border-[#00FF66] text-[#00FF66] bg-[#00FF66]/10" : "border-neutral-800 text-neutral-400 hover:border-neutral-600"}`}>
                          {lens === "ULTRAWIDE" ? "0.5x" : lens === "MAIN" ? "1x (PRO)" : "3x+"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase">Stability</div>
                    <div className="flex gap-2">
                      {(["TRIPOD", "HANDHELD"] as MobileMount[]).map((mount) => (
                        <button key={mount} onClick={() => setMobileMount(mount)} className={`flex-1 py-2 text-[10px] font-mono border transition-all ${mobileMount === mount ? "border-[#00FF66] text-[#00FF66] bg-[#00FF66]/10" : "border-neutral-800 text-neutral-400 hover:border-neutral-600"}`}>
                          {mount}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Environmental Panel */}
          <div className="bg-[#050505] border border-neutral-900 p-6 rounded-lg space-y-6">
             <div className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase border-b border-neutral-900 pb-2">
               Atmospheric Telemetry
             </div>
             
             <div className="space-y-4">
                <div className="flex justify-between font-mono text-xs text-neutral-400">
                  <span>BORTLE SCALE (LIGHT POLLUTION)</span>
                  <span className="text-white">Class {bortleScale}</span>
                </div>
                <input type="range" min="1" max="9" step="1" value={bortleScale} onChange={(e) => setBortleScale(Number(e.target.value))} className="w-full h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-blue-500" />
                <div className="flex justify-between text-[9px] font-mono text-neutral-600">
                  <span>Pristine Dark</span>
                  <span>Inner City</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between font-mono text-xs text-neutral-400">
                  <span>LUNAR ILLUMINATION</span>
                  <span className="text-white">{moonPhase}%</span>
                </div>
                <input type="range" min="0" max="100" step="5" value={moonPhase} onChange={(e) => setMoonPhase(Number(e.target.value))} className="w-full h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-purple-500" />
              </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DYNAMIC OUTPUT */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <AnimatePresence mode="wait">
            {activeMode === "DSLR" ? (
              <motion.div key="out-dslr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-4">
                <div className="border border-neutral-900 bg-[#050505] p-6 flex flex-col justify-center min-h-[160px]">
                  <span className="font-mono text-[10px] tracking-widest text-neutral-500 mb-2">MAX SHUTTER (500 RULE)</span>
                  <span className="text-5xl font-light text-white">{dslrMaxShutter}s</span>
                </div>
                <div className="border border-neutral-900 bg-[#050505] p-6 flex flex-col justify-center min-h-[160px]">
                  <span className="font-mono text-[10px] tracking-widest text-neutral-500 mb-2">CALIBRATED ISO</span>
                  <span className="text-5xl font-light text-[#00FF66]">ISO {finalDslrIso}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="out-mobile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-4">
                <div className="border border-neutral-900 bg-[#050505] p-6 flex flex-col justify-center min-h-[140px]">
                  <span className="font-mono text-[10px] tracking-widest text-neutral-500 mb-1">SHUTTER SPEED</span>
                  <span className="text-3xl font-light text-white">{mobileShutter}</span>
                </div>
                <div className="border border-neutral-900 bg-[#050505] p-6 flex flex-col justify-center min-h-[140px]">
                  <span className="font-mono text-[10px] tracking-widest text-neutral-500 mb-1">TARGET ISO</span>
                  <span className="text-3xl font-light text-[#00FF66]">{mobileISO}</span>
                </div>
                <div className="border border-neutral-900 bg-[#050505] p-6 flex flex-col justify-center min-h-[140px]">
                  <span className="font-mono text-[10px] tracking-widest text-neutral-500 mb-1">FOCUS DISTANCE</span>
                  <span className="text-2xl font-light text-white">{mobileFocus}</span>
                </div>
                <div className="border border-neutral-900 bg-[#050505] p-6 flex flex-col justify-center min-h-[140px]">
                  <span className="font-mono text-[10px] tracking-widest text-neutral-500 mb-1">CAPTURE FORMAT</span>
                  <span className="text-2xl font-light text-[#00FF66]">{mobileFormat}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Actionable Field Guide */}
          <div className="mt-4 border border-neutral-800 bg-[#0A0A0A] p-6 rounded-lg flex-grow">
            <h3 className="font-mono text-[11px] tracking-widest text-neutral-400 uppercase mb-4 border-b border-neutral-900 pb-2">
              Field Advisory Report
            </h3>
            <ul className="space-y-3 font-sans text-sm text-neutral-300 leading-relaxed">
              {envWarning ? (
                <li className="flex gap-3">
                  <span className="text-blue-500">◈</span> 
                  {envWarning}
                </li>
              ) : (
                <li className="flex gap-3">
                  <span className="text-blue-500">◈</span> 
                  Atmospheric conditions are stable. Proceed with standard baseline exposures.
                </li>
              )}
              
              {activeMode === "MOBILE" && mobileWarning && (
                <li className="flex gap-3">
                  <span className="text-yellow-500">◈</span> 
                  {mobileWarning}
                </li>
              )}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}