"use client";

import React, { useState, useEffect, useRef } from "react";
import { getCelestialCoordinates, CelestialTarget } from "@/utils/astroCalc";
import { Camera, RefreshCw, Volume2, VolumeX, ShieldAlert, Sparkles, Navigation } from "lucide-react";

export default function SpatialTargetLocator() {
  const [coords, setCoords] = useState({ lat: 41.6631, lng: -77.8225, offset: 0 });
  const [targets, setTargets] = useState<CelestialTarget[]>([]);
  const [selectedId, setSelectedTargetId] = useState<string>("moon");
  
  // Simulated AR device heading/pitch
  const [deviceHeading, setDeviceHeading] = useState(120); // 0 to 360 Azimuth
  const [devicePitch, setDevicePitch] = useState(30);     // 0 to 90 Altitude
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [locked, setLocked] = useState(false);

  // Audio Context ref to synthesize sci-fi alignment beeps
  const audioCtxRef = useRef<AudioContext | null>(null);

  const syncSettings = () => {
    const savedLat = localStorage.getItem("astro_lat");
    const savedLng = localStorage.getItem("astro_lng");
    const savedOffset = localStorage.getItem("astro_offset");

    const lat = savedLat ? parseFloat(savedLat) : 41.6631;
    const lng = savedLng ? parseFloat(savedLng) : -77.8225;
    const offset = savedOffset ? parseInt(savedOffset) : 0;

    setCoords({ lat, lng, offset });
    const computedTargets = getCelestialCoordinates(lat, lng, offset);
    setTargets(computedTargets);
  };

  useEffect(() => {
    syncSettings();
    window.addEventListener("astro_settings_changed", syncSettings);
    return () => {
      window.removeEventListener("astro_settings_changed", syncSettings);
    };
  }, []);

  const activeTarget = targets.find((t) => t.id === selectedId) || targets[0];

  // Calculate alignment differences
  const headingDiff = activeTarget ? ((activeTarget.az - deviceHeading + 540) % 360) - 180 : 0; // -180 to 180
  const pitchDiff = activeTarget ? activeTarget.alt - devicePitch : 0;

  const isAligned = Math.abs(headingDiff) <= 3.5 && Math.abs(pitchDiff) <= 3.5;

  // Sound generator
  useEffect(() => {
    if (isAligned && !locked) {
      setLocked(true);
      if (soundEnabled) {
        triggerBeep(880, 0.15); // high pitch target lock sound
        setTimeout(() => triggerBeep(1100, 0.25), 150);
      }
    } else if (!isAligned && locked) {
      setLocked(false);
    }
  }, [isAligned, locked, soundEnabled]);

  // Synthesize Web Audio beep
  const triggerBeep = (frequency: number, duration: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }
  };

  // Helper to calibrate mock sensors automatically to target
  const autoCalibrate = () => {
    if (activeTarget) {
      setDeviceHeading(Math.round(activeTarget.az));
      setDevicePitch(Math.round(activeTarget.alt));
      if (soundEnabled) {
        triggerBeep(600, 0.2);
      }
    }
  };

  // Convert angular difference into viewfinder pixel coordinate offsets
  // Maximum scope of view is ±20 degrees
  const getViewfinderOffsets = () => {
    const scale = 5.5; // pixels per degree
    const x = -headingDiff * scale; 
    const y = pitchDiff * scale; // invert since altitude higher is up
    return { x, y };
  };

  const offset = getViewfinderOffsets();

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-violet-500/15 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400 star-twinkle-fast" />
              AR-Ready Target Locator
            </h2>
            <p className="text-xs text-slate-400">
              Align your lens. Simulate live pointing by matching heading (Az) and camera tilt (Alt).
            </p>
          </div>
          
          {/* Sound Controls */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) triggerBeep(520, 0.1);
            }}
            className={`p-2 rounded-lg border transition-all text-xs flex items-center gap-1.5 ${
              soundEnabled
                ? "bg-cyan-950/40 border-cyan-400 text-cyan-300"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{soundEnabled ? "Audio On" : "Audio Muted"}</span>
          </button>
        </div>

        {/* Target Select Dropdown */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block mb-1">CHOOSE TARGET</span>
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedTargetId(e.target.value);
                setLocked(false);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg glass-input"
            >
              {targets.map((t) => (
                <option key={t.id} value={t.id} disabled={!t.isVisible}>
                  {t.name} {t.isVisible ? `(Alt: ${Math.round(t.alt)}°)` : "(Below Horizon)"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-mono block mb-1">CALIBRATION SENSORS</span>
            <button
              onClick={autoCalibrate}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/20 flex items-center justify-center gap-1 transition-all h-[34px]"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin-slow" />
              Auto Align Lens
            </button>
          </div>
        </div>

        {/* The Live Viewfinder Grid */}
        <div className="relative w-full aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden border border-slate-900 flex items-center justify-center">
          
          {/* Simulated starry night canvas */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
          
          {/* Constellation line backdrop vector */}
          <svg className="absolute inset-0 w-full h-full text-indigo-500/10 pointer-events-none">
            <line x1="10%" y1="20%" x2="25%" y2="45%" stroke="currentColor" strokeWidth="0.5" />
            <line x1="25%" y1="45%" x2="55%" y2="35%" stroke="currentColor" strokeWidth="0.5" />
            <line x1="55%" y1="35%" x2="80%" y2="80%" stroke="currentColor" strokeWidth="0.5" />
            <line x1="25%" y1="45%" x2="35%" y2="85%" stroke="currentColor" strokeWidth="0.5" />
          </svg>

          {/* Locked Overlay Alert */}
          <div className="absolute top-2 left-3 z-20 flex items-center gap-1.5 font-mono text-[9px]">
            <span className={`w-2 h-2 rounded-full ${isAligned ? "bg-emerald-400 animate-ping" : "bg-rose-500 animate-pulse"}`}></span>
            <span className={isAligned ? "text-emerald-400 font-bold" : "text-rose-400"}>
              {isAligned ? "LOCKED & AR TRACKING" : "LENS MISALIGNED"}
            </span>
          </div>

          <div className="absolute top-2 right-3 z-20 font-mono text-[9px] text-slate-500">
            FOV: 15° • AZ/ALT METERS
          </div>

          {/* Fixed center target reticle (Where the camera points) */}
          <div className={`relative z-10 w-16 h-16 rounded-full border-2 transition-all duration-300 flex items-center justify-center pointer-events-none ${
            isAligned 
              ? "border-emerald-400 bg-emerald-500/5 shadow-[0_0_15px_rgba(52,211,153,0.3)]" 
              : "border-slate-600/40"
          }`}>
            {/* Center crosshair */}
            <div className={`w-1.5 h-1.5 rounded-full ${isAligned ? "bg-emerald-400" : "bg-slate-600"}`}></div>
            
            {/* Compass degree readouts */}
            <div className="absolute -bottom-5 text-[8px] font-mono font-bold bg-slate-950/80 px-1.5 py-0.5 rounded text-slate-300">
              {deviceHeading}° H | {devicePitch}° P
            </div>
          </div>

          {/* Dynamic celestial target tag (Moving according to sensor controls) */}
          <div 
            className="absolute transition-all duration-100 pointer-events-none flex flex-col items-center justify-center z-10"
            style={{
              transform: `translate(${offset.x}px, ${-offset.y}px)`, // subtract y because we want positive offsets up
            }}
          >
            {/* Outer rings of target */}
            <div className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${
              isAligned 
                ? "border-emerald-400 scale-95" 
                : "border-cyan-400/60 animate-pulse"
            }`}>
              <div className="w-4 h-4 rounded-full bg-cyan-400/20 border border-cyan-400"></div>
            </div>

            {/* Target name tag */}
            <div className="mt-1 bg-slate-950/90 text-[8px] font-mono px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold uppercase whitespace-nowrap">
              {activeTarget ? activeTarget.name : "Target"}
            </div>
            <div className="text-[7px] text-slate-400 font-mono">
              Az:{activeTarget?.az}° | Alt:{activeTarget?.alt}°
            </div>
          </div>

          {/* Aligned flashing graphics */}
          {isAligned && (
            <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none border-2 border-emerald-500 animate-pulse z-20 flex items-center justify-center">
              <div className="bg-slate-950/90 border border-emerald-400 rounded-lg px-4 py-2 text-center shadow-lg">
                <span className="text-xs text-emerald-400 font-extrabold tracking-widest block font-mono">
                  ★ ALIGNED & ACQUIRED ★
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Point Camera/Lens {activeTarget.name} Is Centered
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Sensor controls */}
      <div className="mt-4 pt-4 border-t border-slate-900 space-y-3">
        <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-semibold block">
          Manual Calibration Controls (Simulate Sensors)
        </span>

        {/* Heading Slider */}
        <div className="grid grid-cols-12 gap-2 items-center">
          <span className="col-span-3 text-[10px] font-mono text-slate-400">Heading (Az):</span>
          <div className="col-span-7">
            <input
              type="range"
              min="0"
              max="360"
              value={deviceHeading}
              onChange={(e) => {
                setDeviceHeading(parseInt(e.target.value));
              }}
              className="w-full accent-cyan-400"
            />
          </div>
          <span className="col-span-2 text-[10px] font-mono text-cyan-300 font-bold text-right">
            {deviceHeading}°
          </span>
        </div>

        {/* Pitch Slider */}
        <div className="grid grid-cols-12 gap-2 items-center">
          <span className="col-span-3 text-[10px] font-mono text-slate-400">Pitch (Alt):</span>
          <div className="col-span-7">
            <input
              type="range"
              min="0"
              max="90"
              value={devicePitch}
              onChange={(e) => {
                setDevicePitch(parseInt(e.target.value));
              }}
              className="w-full accent-purple-400"
            />
          </div>
          <span className="col-span-2 text-[10px] font-mono text-purple-300 font-bold text-right">
            {devicePitch}°
          </span>
        </div>

        {/* Navigation Guidance Helper */}
        <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1 font-mono">
            <Navigation className="w-3 h-3 text-indigo-400 rotate-45 shrink-0" />
            Guidance:
          </span>
          <span className="font-mono text-slate-300 text-right">
            {Math.abs(headingDiff) <= 3.5 ? "Heading aligned." : headingDiff > 0 ? "Turn RIGHT ➔" : "Turn LEFT ↵"}
            {" • "}
            {Math.abs(pitchDiff) <= 3.5 ? "Tilt aligned." : pitchDiff > 0 ? "Tilt UP ▲" : "Tilt DOWN ▼"}
          </span>
        </div>
      </div>
    </div>
  );
}
