// // "use client";

// // import React, { useState, useEffect } from "react";
// // import Link from "next/link";
// // import { usePathname } from "next/navigation";
// // import { 
// //   Compass, 
// //   Calendar, 
// //   Camera, 
// //   BookOpen, 
// //   MapPin, 
// //   Clock, 
// //   HelpCircle,
// //   Eye,
// //   Settings,
// //   Sparkles,
// //   Info
// // } from "lucide-react";

// // // Famous Dark Sky Locations for Quick Select
// // export const LOCATION_PRESETS = [
// //   { name: "Cherry Springs, PA", lat: 41.6631, lng: -77.8225, bortle: 2, desc: "East Coast Dark Sky Preserve" },
// //   { name: "Mauna Kea, HI", lat: 19.8206, lng: -155.4681, bortle: 1, desc: "High Altitude Peak" },
// //   { name: "Atacama Desert, Chile", lat: -23.8634, lng: -69.1352, bortle: 1, desc: "Southern Celestial Masterpiece" },
// //   { name: "London, UK (City Sky)", lat: 51.5074, lng: -0.1278, bortle: 8, desc: "High Light Pollution urban test" },
// //   { name: "Grand Canyon, AZ", lat: 36.0544, lng: -112.1401, bortle: 2, desc: "Stunning Western Horizon" }
// // ];

// // export default function Navigation() {
// //   const pathname = usePathname();
// //   const [selectedLoc, setSelectedLoc] = useState(LOCATION_PRESETS[0]);
// //   const [customLat, setCustomLat] = useState("41.66");
// //   const [customLng, setCustomLng] = useState("-77.82");
// //   const [bortle, setBortle] = useState(2);
// //   const [timeOffset, setTimeOffset] = useState(0); // hours ahead of current time
// //   const [showConfig, setShowConfig] = useState(false);
// //   const [isClient, setIsClient] = useState(false);

// //   // Initialize and load saved parameters from local storage
// //   useEffect(() => {
// //     setIsClient(true);
// //     const savedLoc = localStorage.getItem("astro_location");
// //     const savedLat = localStorage.getItem("astro_lat");
// //     const savedLng = localStorage.getItem("astro_lng");
// //     const savedBortle = localStorage.getItem("astro_bortle");
// //     const savedOffset = localStorage.getItem("astro_offset");

// //     if (savedLoc) {
// //       try {
// //         const parsed = JSON.parse(savedLoc);
// //         setSelectedLoc(parsed);
// //         setCustomLat(parsed.lat.toString());
// //         setCustomLng(parsed.lng.toString());
// //         setBortle(parsed.bortle);
// //       } catch (e) {
// //         // use default
// //       }
// //     }
// //     if (savedLat) setCustomLat(savedLat);
// //     if (savedLng) setCustomLng(savedLng);
// //     if (savedBortle) setBortle(parseInt(savedBortle) || 2);
// //     if (savedOffset) setTimeOffset(parseInt(savedOffset) || 0);
// //   }, []);

// //   // Save changes to localStorage and dispatch custom event to alert active page components
// //   const updateLocation = (preset: typeof LOCATION_PRESETS[0]) => {
// //     setSelectedLoc(preset);
// //     setCustomLat(preset.lat.toString());
// //     setCustomLng(preset.lng.toString());
// //     setBortle(preset.bortle);

// //     localStorage.setItem("astro_location", JSON.stringify(preset));
// //     localStorage.setItem("astro_lat", preset.lat.toString());
// //     localStorage.setItem("astro_lng", preset.lng.toString());
// //     localStorage.setItem("astro_bortle", preset.bortle.toString());
    
// //     // Dispatch event to notify other components
// //     window.dispatchEvent(new Event("astro_settings_changed"));
// //   };

// //   const handleCustomSubmit = (e: React.FormEvent) => {
// //     e.preventDefault();
// //     const lat = parseFloat(customLat) || 0;
// //     const lng = parseFloat(customLng) || 0;
// //     const customPreset = { name: "Custom Target Spot", lat, lng, bortle, desc: "Manual Coordinates" };
// //     setSelectedLoc(customPreset);
// //     localStorage.setItem("astro_location", JSON.stringify(customPreset));
// //     localStorage.setItem("astro_lat", lat.toString());
// //     localStorage.setItem("astro_lng", lng.toString());
// //     localStorage.setItem("astro_bortle", bortle.toString());
// //     window.dispatchEvent(new Event("astro_settings_changed"));
// //     setShowConfig(false);
// //   };

// //   const handleOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const offset = parseInt(e.target.value) || 0;
// //     setTimeOffset(offset);
// //     localStorage.setItem("astro_offset", offset.toString());
// //     window.dispatchEvent(new Event("astro_settings_changed"));
// //   };

// //   const navItems = [
// //     { name: "Live Dashboard", href: "/", icon: Compass, color: "from-cyan-500 to-blue-500" },
// //     { name: "Event Vault", href: "/events", icon: Calendar, color: "from-purple-500 to-indigo-500" },
// //     { name: "AP Copilot", href: "/copilot", icon: Camera, color: "from-pink-500 to-rose-500" },
// //     { name: "Observing Logs", href: "/logs", icon: BookOpen, color: "from-emerald-500 to-teal-500" },
// //   ];

// //   const simulationTime = new Date();
// //   simulationTime.setHours(simulationTime.getHours() + timeOffset);

// //   return (
// //     <div className="w-full">
// //       {/* Top Glassmorphic Navigation Banner */}
// //       <header className="glass-nav sticky top-0 z-50 px-4 py-3 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
// //         <div className="flex items-center justify-between">
// //           <Link href="/" className="flex items-center gap-2.5">
// //             <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-violet-950 border border-violet-500/40 text-cyan-400">
// //               <Sparkles className="w-5 h-5 star-twinkle-fast" />
// //               <div className="absolute inset-0 rounded-xl bg-cyan-500/10 blur-md"></div>
// //             </div>
// //             <div>
// //               <span className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-indigo-200 to-cyan-300">
// //                 NEBULA
// //               </span>
// //               <span className="font-light text-xs tracking-[0.25em] text-cyan-400 block -mt-1">
// //                 TRACKER
// //               </span>
// //             </div>
// //           </Link>

// //           {/* Preset trigger for mobile */}
// //           <button 
// //             onClick={() => setShowConfig(!showConfig)}
// //             className="md:hidden p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-indigo-200 flex items-center gap-1 text-xs"
// //           >
// //             <MapPin className="w-3.5 h-3.5 text-cyan-400" />
// //             Config
// //           </button>
// //         </div>

// //         {/* Global Coordinates Status Display */}
// //         {isClient && (
// //           <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
// //             <div className="flex items-center gap-2 bg-indigo-950/30 px-3 py-1.5 rounded-lg border border-indigo-500/10">
// //               <MapPin className="w-4 h-4 text-cyan-400" />
// //               <span className="font-semibold text-slate-200">{selectedLoc.name}</span>
// //               <span className="text-xs text-indigo-400">
// //                 ({selectedLoc.lat.toFixed(2)}°, {selectedLoc.lng.toFixed(2)}°)
// //               </span>
// //               <button 
// //                 onClick={() => setShowConfig(!showConfig)}
// //                 className="text-xs text-cyan-400 hover:underline ml-2 transition-all"
// //               >
// //                 Change
// //               </button>
// //             </div>

// //             <div className="flex items-center gap-2 bg-indigo-950/30 px-3 py-1.5 rounded-lg border border-indigo-500/10">
// //               <Clock className="w-4 h-4 text-purple-400" />
// //               <span className="text-xs text-slate-400">Simulation Time:</span>
// //               <span className="font-mono text-cyan-300 font-semibold">
// //                 {simulationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// //               </span>
// //               {timeOffset !== 0 && (
// //                 <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20">
// //                   +{timeOffset}h
// //                 </span>
// //               )}
// //             </div>

// //             <div className="flex items-center gap-2 bg-indigo-950/30 px-3 py-1.5 rounded-lg border border-indigo-500/10">
// //               <Eye className="w-4 h-4 text-emerald-400" />
// //               <span className="text-xs text-slate-400">Bortle:</span>
// //               <span className="font-semibold text-emerald-400">Class {bortle}</span>
// //             </div>
// //           </div>
// //         )}

// //         {/* Desktop Navigation Links */}
// //         <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
// //           {navItems.map((item) => {
// //             const isActive = pathname === item.href;
// //             const Icon = item.icon;
// //             return (
// //               <Link
// //                 key={item.name}
// //                 href={item.href}
// //                 className={`relative px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-300 flex items-center gap-2 ${
// //                   isActive
// //                     ? "text-slate-100 bg-gradient-to-r from-violet-950 to-indigo-950 shadow-inner border border-violet-500/30"
// //                     : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
// //                 }`}
// //               >
// //                 <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : ""}`} />
// //                 {item.name}
// //                 {isActive && (
// //                   <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
// //                 )}
// //               </Link>
// //             );
// //           })}
// //         </nav>
// //       </header>

// //       {/* Global Location / Time Settings Modal Overlap */}
// //       {showConfig && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
// //           <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-violet-500/30 relative">
// //             <button 
// //               onClick={() => setShowConfig(false)}
// //               className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl"
// //             >
// //               ✕
// //             </button>
            
// //             <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
// //               <Compass className="text-cyan-400 w-5 h-5" />
// //               Celestial Position Setup
// //             </h3>

// //             <p className="text-xs text-slate-400 mb-4">
// //               Your location coordinates and light pollution levels shape the simulated Altitude, Azimuth, and Viewing conditions.
// //             </p>

// //             {/* Quick Preset Grid */}
// //             <div className="mb-5">
// //               <label className="text-xs font-semibold text-slate-300 block mb-2">Select Dark Sky Preset</label>
// //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
// //                 {LOCATION_PRESETS.map((preset) => {
// //                   const isSelected = selectedLoc.name === preset.name;
// //                   return (
// //                     <button
// //                       key={preset.name}
// //                       onClick={() => updateLocation(preset)}
// //                       className={`text-left p-3 rounded-lg border transition-all text-xs ${
// //                         isSelected 
// //                           ? "bg-violet-950/40 border-cyan-400 text-white" 
// //                           : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-violet-500/20"
// //                       }`}
// //                     >
// //                       <div className="font-semibold">{preset.name}</div>
// //                       <div className="text-[10px] opacity-75">{preset.desc}</div>
// //                       <div className="text-[9px] mt-1 text-cyan-400 font-mono">
// //                         Lat: {preset.lat}° | Bortle: {preset.bortle}
// //                       </div>
// //                     </button>
// //                   );
// //                 })}
// //               </div>
// //             </div>

// //             {/* Manual Coordinate Form */}
// //             <form onSubmit={handleCustomSubmit} className="space-y-4 border-t border-slate-800/80 pt-4">
// //               <label className="text-xs font-semibold text-slate-300 block">Or Input Custom Coordinates</label>
              
// //               <div className="grid grid-cols-2 gap-3">
// //                 <div>
// //                   <span className="text-[10px] text-slate-400">Latitude (-90 to 90)</span>
// //                   <input
// //                     type="number"
// //                     step="0.0001"
// //                     min="-90"
// //                     max="90"
// //                     value={customLat}
// //                     onChange={(e) => setCustomLat(e.target.value)}
// //                     className="w-full mt-1 px-3 py-2 text-xs rounded-lg glass-input font-mono"
// //                   />
// //                 </div>
// //                 <div>
// //                   <span className="text-[10px] text-slate-400">Longitude (-180 to 180)</span>
// //                   <input
// //                     type="number"
// //                     step="0.0001"
// //                     min="-180"
// //                     max="180"
// //                     value={customLng}
// //                     onChange={(e) => setCustomLng(e.target.value)}
// //                     className="w-full mt-1 px-3 py-2 text-xs rounded-lg glass-input font-mono"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="grid grid-cols-2 gap-3 items-center">
// //                 <div>
// //                   <span className="text-[10px] text-slate-400 block">Bortle Scale (1-9)</span>
// //                   <select
// //                     value={bortle}
// //                     onChange={(e) => setBortle(parseInt(e.target.value))}
// //                     className="w-full mt-1 px-3 py-2 text-xs rounded-lg glass-input"
// //                   >
// //                     <option value="1">Class 1: Excellent Dark Sky</option>
// //                     <option value="2">Class 2: Typical Truly Dark Sky</option>
// //                     <option value="3">Class 3: Rural Sky</option>
// //                     <option value="4">Class 4: Rural/Suburban Transition</option>
// //                     <option value="5">Class 5: Suburban Sky</option>
// //                     <option value="6">Class 6: Bright Suburban Sky</option>
// //                     <option value="7">Class 7: Suburban/Urban Transition</option>
// //                     <option value="8">Class 8: City Sky</option>
// //                     <option value="9">Class 9: Inner-City Sky</option>
// //                   </select>
// //                 </div>

// //                 <div className="flex flex-col">
// //                   <span className="text-[10px] text-slate-400">Offset Hours (+24h max)</span>
// //                   <div className="flex items-center gap-2 mt-1">
// //                     <input
// //                       type="range"
// //                       min="0"
// //                       max="24"
// //                       value={timeOffset}
// //                       onChange={handleOffsetChange}
// //                       className="w-full accent-cyan-400"
// //                     />
// //                     <span className="font-mono text-xs text-cyan-300 w-8">{timeOffset}h</span>
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="flex justify-end gap-2 pt-2">
// //                 <button
// //                   type="button"
// //                   onClick={() => setShowConfig(false)}
// //                   className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-900/50"
// //                 >
// //                   Cancel
// //                 </button>
// //                 <button
// //                   type="submit"
// //                   className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-950/50"
// //                 >
// //                   Apply & Recalculate
// //                 </button>
// //               </div>
// //             </form>
// //           </div>
// //         </div>
// //       )}

// //       {/* Persistent Bottom Bar for Small Devices */}
// //       <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1">
// //         <div className="flex justify-around items-center">
// //           {navItems.map((item) => {
// //             const isActive = pathname === item.href;
// //             const Icon = item.icon;
// //             return (
// //               <Link
// //                 key={item.name}
// //                 href={item.href}
// //                 className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg text-[10px] font-semibold transition-all ${
// //                   isActive ? "text-cyan-400" : "text-slate-400 hover:text-slate-200"
// //                 }`}
// //               >
// //                 <Icon className="w-4 h-4" />
// //                 <span>{item.name.split(" ")[0]}</span>
// //               </Link>
// //             );
// //           })}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }







// // Location: src/components/ui/Navigation.tsx
// "use client";

// import React from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";

// const NAV_LINKS = [
//   { name: "LIVE VIEWPORT", href: "/" },
//   { name: "EVENT VAULT", href: "/events" },
//   { name: "AP LABORATORY", href: "/laboratory" },
//   { name: "STELLAR LOGBOOK", href: "/logbook" },
// ];

// export default function Navigation() {
//   const pathname = usePathname();

//   return (
//     <header className="w-full border-b border-neutral-900 bg-black/40 backdrop-blur-md px-8 py-4 flex justify-between items-center z-40 relative">
//       <div className="flex items-center space-x-4">
//         <span className="h-2 w-2 rounded-full bg-[#00FF66] animate-pulse" />
//         <span className="text-sm font-bold tracking-[0.25em] text-white uppercase font-sans">
//           AURASPACE <span className="font-light text-neutral-500">// OBSERVATORY</span>
//         </span>
//         <span className="text-[10px] font-mono text-neutral-600 hidden md:inline">
//           REF ID: DEL-NC-28.61°N
//         </span>
//       </div>

//       <nav className="flex space-x-8 font-mono text-[11px] tracking-widest">
//         {NAV_LINKS.map((link) => {
//           const isActive = pathname === link.href;
//           return (
//             <Link
//               key={link.href}
//               href={link.href}
//               className={`transition-colors duration-300 relative py-1 ${
//                 isActive ? "text-white font-medium" : "text-neutral-500 hover:text-neutral-300"
//               }`}
//             >
//               {link.name}
//               {isActive && (
//                 <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white layout-line" />
//               )}
//             </Link>
//           );
//         })}
//       </nav>
//     </header>
//   );
// }



"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs"; // 🔥 Swapped to useAuth hook

const NAV_LINKS = [
  { name: "LIVE VIEWPORT", href: "/" },
  { name: "EVENT VAULT", href: "/events" },
  { name: "AP LABORATORY", href: "/laboratory" },
  { name: "STELLAR LOGBOOK", href: "/logbook" },
];

export default function Navigation() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth(); // 🔥 Checking auth state manually to bypass Turbopack bug

  return (
    <header className="w-full border-b border-neutral-900 bg-black/40 backdrop-blur-md px-8 py-4 flex justify-between items-center z-40 relative shrink-0">
      
      {/* Left: Logo & Status */}
      <div className="flex items-center space-x-4">
        <span className="h-2 w-2 rounded-full bg-[#00FF66] animate-pulse" />
        <span className="text-sm font-bold tracking-[0.25em] text-white uppercase font-sans">
          AURASPACE <span className="font-light text-neutral-500">CAPTURING THE UNIVERSE, ONE FRAME AT A TIME</span>
        </span>
        <span className="text-[10px] font-mono text-neutral-600 hidden md:inline">
          REF ID: DEL-NC-28.61°N
        </span>
      </div>

      {/* Right: Links & Auth Gateway */}
      <div className="flex items-center space-x-8">
        <nav className="flex space-x-8 font-mono text-[11px] tracking-widest">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors duration-300 relative py-1 ${
                  isActive ? "text-white font-medium" : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white layout-line" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Authentication Hub */}
        <div className="font-mono text-[11px]">
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="px-4 py-1.5 border border-[#00FF66] text-[#00FF66] bg-[#00FF66]/5 hover:bg-[#00FF66]/20 transition duration-300 rounded-sm uppercase tracking-widest cursor-pointer">
                Access Gateway
              </button>
            </SignInButton>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-[9px] text-neutral-500 tracking-widest uppercase animate-pulse hidden sm:inline">
                Core Linked
              </span>
            <UserButton
  appearance={{
    elements: {
      avatarBox: "h-8 w-8 border border-[#00FF66]/50 shadow-[0_0_10px_rgba(0,255,102,0.2)]"
    }
  }}
/>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}