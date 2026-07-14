"use client";

import React, { useState, useEffect } from "react";
import { calculateViewingQuality, getMoonDetails, WeatherMetric } from "@/utils/astroCalc";
import { CloudRain, Wind, Droplets, Moon, RefreshCw, Star, Sliders, CheckCircle } from "lucide-react";

export default function ClearOutsideWidget() {
  const [bortle, setBortle] = useState(2);
  const [moonIllumination, setMoonIllumination] = useState(15);
  
  // Simulated initial metrics
  const [metrics, setMetrics] = useState<WeatherMetric>({
    clouds: 10,
    humidity: 45,
    windSpeed: 8,
    temperature: 12,
    transparency: 92
  });

  const [simulationTime, setSimulationTime] = useState<string>("");

  // Sync with global settings
  const syncSettings = () => {
    const savedBortle = localStorage.getItem("astro_bortle");
    const savedOffset = localStorage.getItem("astro_offset");
    
    const b = savedBortle ? parseInt(savedBortle) : 2;
    setBortle(b);

    // Get current simulation date based on offset
    const date = new Date();
    const offset = savedOffset ? parseInt(savedOffset) : 0;
    date.setHours(date.getHours() + offset);
    
    // Format simple time string
    setSimulationTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    // Get moon illumination
    const moon = getMoonDetails(date);
    setMoonIllumination(moon.illumination);
  };

  useEffect(() => {
    syncSettings();
    window.addEventListener("astro_settings_changed", syncSettings);
    return () => {
      window.removeEventListener("astro_settings_changed", syncSettings);
    };
  }, []);

  const quality = calculateViewingQuality(metrics, bortle, moonIllumination);

  const randomizeWeather = () => {
    // Generate superb, average, or terrible conditions
    const rand = Math.random();
    if (rand > 0.6) {
      // Superb conditions
      setMetrics({
        clouds: Math.floor(Math.random() * 8),
        humidity: Math.floor(Math.random() * 25) + 30,
        windSpeed: Math.floor(Math.random() * 10) + 2,
        temperature: Math.floor(Math.random() * 15) - 2,
        transparency: Math.floor(Math.random() * 10) + 90
      });
    } else if (rand > 0.25) {
      // Moderate conditions
      setMetrics({
        clouds: Math.floor(Math.random() * 30) + 15,
        humidity: Math.floor(Math.random() * 40) + 50,
        windSpeed: Math.floor(Math.random() * 18) + 8,
        temperature: Math.floor(Math.random() * 18) + 5,
        transparency: Math.floor(Math.random() * 20) + 70
      });
    } else {
      // Poor conditions
      setMetrics({
        clouds: Math.floor(Math.random() * 60) + 40,
        humidity: Math.floor(Math.random() * 20) + 75,
        windSpeed: Math.floor(Math.random() * 25) + 18,
        temperature: Math.floor(Math.random() * 22) + 10,
        transparency: Math.floor(Math.random() * 30) + 40
      });
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-violet-500/15 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400 star-twinkle-slow" />
              Viewing Quality Score
            </h2>
            <p className="text-xs text-slate-400">
              Astronomical seeing & atmosphere transparency index.
            </p>
          </div>
          <button
            onClick={randomizeWeather}
            title="Randomize atmospheric noise"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all flex items-center gap-1 text-[10px]"
          >
            <RefreshCw className="w-3 h-3" />
            Randomize
          </button>
        </div>

        {/* Big Circular Dial & Main Metrics Split */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-2">
          {/* Circular Score Badge */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center">
            <div 
              className="relative w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500"
              style={{
                boxShadow: `0 0 30px ${quality.glowColor}`,
                border: `3px solid transparent`,
                backgroundImage: `linear-gradient(#050514, #050514), linear-gradient(135deg, #8b5cf6, #06b6d4)`,
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
              }}
            >
              <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-indigo-200 tracking-tighter">
                {quality.score}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                / 100 Index
              </span>
              <span className={`text-xs font-bold mt-1 ${quality.textColor}`}>
                {quality.rating}
              </span>
            </div>
            
            <div className="mt-3 text-center">
              <span className="text-[10px] font-mono text-slate-400 block">
                Bortle Class {bortle} • Moon {moonIllumination}%
              </span>
            </div>
          </div>

          {/* Quick Sliders to Tune Conditions */}
          <div className="sm:col-span-7 bg-slate-950/60 p-4 rounded-xl border border-slate-900 space-y-3.5">
            <div className="flex items-center gap-2 text-xs text-indigo-300 font-semibold mb-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>Fine-Tune Atmosphere Simulator</span>
            </div>

            {/* Cloud Cover Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Cloud Cover:</span>
                <span className={metrics.clouds > 35 ? "text-rose-400" : "text-emerald-400"}>
                  {metrics.clouds}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={metrics.clouds}
                onChange={(e) => setMetrics({ ...metrics, clouds: parseInt(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-1"
              />
            </div>

            {/* Humidity Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Relative Humidity:</span>
                <span className={metrics.humidity > 70 ? "text-amber-400" : "text-cyan-400"}>
                  {metrics.humidity}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={metrics.humidity}
                onChange={(e) => setMetrics({ ...metrics, humidity: parseInt(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400 mt-1"
              />
            </div>

            {/* Wind Speed Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Wind Velocity:</span>
                <span className={metrics.windSpeed > 20 ? "text-rose-400" : "text-emerald-400"}>
                  {metrics.windSpeed} km/h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={metrics.windSpeed}
                onChange={(e) => setMetrics({ ...metrics, windSpeed: parseInt(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Recommendation Panel */}
      <div className="mt-4 pt-4 border-t border-slate-900 space-y-2">
        <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-semibold block">
          Target recommendations for {simulationTime || "tonight"}:
        </span>
        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
          {quality.recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/30 p-2 rounded border border-violet-500/5">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
