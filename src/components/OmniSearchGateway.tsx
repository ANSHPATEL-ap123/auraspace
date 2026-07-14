// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { Search, Compass, Star, Database, Sliders, Command } from "lucide-react";
// import { CelestialNode, CELESTIAL_CATALOG } from "@/utils/celestialDb";

// interface OmniSearchGatewayProps {
//   onSelectNode: (node: CelestialNode) => void;
//   activeNode: CelestialNode;
// }

// export default function OmniSearchGateway({ onSelectNode, activeNode }: OmniSearchGatewayProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [query, setQuery] = useState("");
//   const [activeCategory, setActiveCategory] = useState<string>("All");
//   const inputRef = useRef<HTMLInputElement>(null);

//   // Keyboard shortcut binding
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if ((e.metaKey || e.ctrlKey) && e.key === "k") {
//         e.preventDefault();
//         setIsOpen((prev) => !prev);
//       }
//       if (e.key === "Escape") {
//         setIsOpen(false);
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   useEffect(() => {
//     if (isOpen) {
//       setTimeout(() => inputRef.current?.focus(), 50);
//     }
//   }, [isOpen]);

//   // Filter list based on queries and tabs
//   const filteredNodes = CELESTIAL_CATALOG.filter((node) => {
//     const matchesQuery = 
//       node.name.toLowerCase().includes(query.toLowerCase()) ||
//       (node.scientificName && node.scientificName.toLowerCase().includes(query.toLowerCase())) ||
//       node.constellation.toLowerCase().includes(query.toLowerCase());
    
//     if (activeCategory === "All") return matchesQuery;
//     return matchesQuery && node.category === activeCategory;
//   });

//   const categories = ["All", "Solar System", "Deep Space", "Stars", "Constellations", "Dynamic Bodies"];

//   return (
//     <>
//       {/* Sleek Minimal Trigger Button */}
//       <button
//         onClick={() => setIsOpen(true)}
//         className="w-full flex items-center justify-between px-4 py-2.5 bg-[#000000] border border-neutral-900 rounded-lg hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-all font-mono text-xs"
//       >
//         <div className="flex items-center gap-2">
//           <Search className="w-3.5 h-3.5 text-neutral-500" />
//           <span>Universal Sky Catalog Lookup...</span>
//         </div>
//         <div className="flex items-center gap-1 text-[10px] bg-neutral-900 px-2 py-0.5 rounded text-neutral-500 border border-neutral-800">
//           <Command className="w-2.5 h-2.5" />
//           <span>K</span>
//         </div>
//       </button>

//       {/* Full-Screen Command Palette Overlay */}
//       {isOpen && (
//         <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-start justify-center pt-20 px-4">
//           <div 
//             className="w-full max-w-xl bg-[#080808] border border-neutral-800 rounded-lg shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Search Input Bar */}
//             <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-900">
//               <Search className="w-4 h-4 text-neutral-500 shrink-0" />
//               <input
//                 ref={inputRef}
//                 type="text"
//                 placeholder="Search targets, Messier catalog ID, stars, constellations..."
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 className="w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none font-mono"
//               />
//               <button 
//                 onClick={() => setIsOpen(false)}
//                 className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 hover:text-neutral-300"
//               >
//                 ESC
//               </button>
//             </div>

//             {/* Category Filter Pills */}
//             <div className="flex items-center gap-1.5 px-4 py-2 bg-[#050505] border-b border-neutral-900 overflow-x-auto">
//               {categories.map((cat) => (
//                 <button
//                   key={cat}
//                   onClick={() => setActiveCategory(cat)}
//                   className={`text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded transition-all shrink-0 ${
//                     activeCategory === cat
//                       ? "bg-neutral-100 text-black font-bold"
//                       : "text-neutral-400 hover:text-neutral-200"
//                   }`}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>

//             {/* Target Results Box */}
//             <div className="max-h-[350px] overflow-y-auto p-2 space-y-0.5">
//               {filteredNodes.length > 0 ? (
//                 filteredNodes.map((node) => {
//                   const isActive = activeNode.id === node.id;
//                   return (
//                     <button
//                       key={node.id}
//                       onClick={() => {
//                         onSelectNode(node);
//                         setIsOpen(false);
//                       }}
//                       className={`w-full text-left px-3 py-2.5 rounded transition-all flex items-center justify-between group ${
//                         isActive
//                           ? "bg-neutral-900 border border-neutral-800 text-white"
//                           : "hover:bg-neutral-900/40 text-neutral-400 hover:text-neutral-200"
//                       }`}
//                     >
//                       <div className="space-y-1">
//                         <div className="flex items-center gap-2">
//                           <span className="font-mono text-xs font-semibold text-neutral-100 group-hover:text-white">
//                             {node.name}
//                           </span>
//                           {node.scientificName && (
//                             <span className="text-[10px] text-neutral-500 font-mono italic">
//                               ({node.scientificName})
//                             </span>
//                           )}
//                         </div>
//                         <div className="text-[10px] text-neutral-500 font-mono">
//                           {node.category} • Constellation: {node.constellation}
//                         </div>
//                       </div>

//                       <div className="text-right font-mono text-[10px] space-y-0.5">
//                         <div className="text-emerald-500">
//                           Dec: {node.dec >= 0 ? "+" : ""}{node.dec.toFixed(1)}°
//                         </div>
//                         <div className="text-neutral-500">
//                           Mag: {node.magnitude}
//                         </div>
//                       </div>
//                     </button>
//                   );
//                 })
//               ) : (
//                 <div className="py-12 text-center text-xs text-neutral-600 font-mono">
//                   No matching astronomical coordinates detected.
//                 </div>
//               )}
//             </div>

//             {/* Footer help readouts */}
//             <div className="px-4 py-2 border-t border-neutral-900 bg-[#030303] text-[9px] text-neutral-500 font-mono flex items-center justify-between">
//               <span>Fuzzy search active on {CELESTIAL_CATALOG.length} core database records</span>
//               <span className="flex items-center gap-1">
//                 <span>Select target to execute cinematic camera fly-to</span>
//               </span>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }





// Location: src/components/ui/OmniSearchGateway.tsx
"use client";

import React, { useState, useEffect } from "react";

export interface CelestialObject {
  id: string;
  name: string;
  system: "SOLAR SYSTEM" | "DEEP SPACE" | "STELLAR CATALOG";
  altitude: string;
  azimuth: string;
  magnitude: string;
  distance: string;
  constellation: string;
  description: string;
}

const CELESTIAL_CATALOG: CelestialObject[] = [
  {
    id: "moon",
    name: "The Moon",
    system: "SOLAR SYSTEM",
    altitude: "8.3°",
    azimuth: "71.6°",
    magnitude: "-12.7",
    distance: "384,400 km",
    constellation: "Taurus",
    description: "Earth's sole natural satellite. Surface presents prominent craters, lava plains (maria), and high-contrast reliefs.",
  },
  {
    id: "andromeda",
    name: "Andromeda Galaxy (M31)",
    system: "DEEP SPACE",
    altitude: "41.2°",
    azimuth: "124.8°",
    magnitude: "+3.44",
    distance: "2.537 M ly",
    constellation: "Andromeda",
    description: "Nearest major galactic neighbor to the Milky Way, manifesting a massive spiral structure visible to naked dark-skies.",
  },
  {
    id: "orion-nebula",
    name: "Orion Nebula (M42)",
    system: "DEEP SPACE",
    altitude: "15.7°",
    azimuth: "198.3°",
    magnitude: "+4.0",
    distance: "1,344 ly",
    constellation: "Orion",
    description: "A diffuse star-forming nebula situated south of Orion's Belt. One of the most intensely tracked stellar nurseries.",
  },
  {
    id: "sirius",
    name: "Sirius (Alpha Canis Majoris)",
    system: "STELLAR CATALOG",
    altitude: "22.1°",
    azimuth: "145.2°",
    magnitude: "-1.46",
    distance: "8.6 ly",
    constellation: "Canis Major",
    description: "The brightest stellar target observable in the night sky. A binary system consisting of a main-sequence star and a white dwarf.",
  }
];

interface OmniSearchGatewayProps {
  onSelectObject: (obj: CelestialObject) => void;
}

export default function OmniSearchGateway({ onSelectObject }: OmniSearchGatewayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredResults = CELESTIAL_CATALOG.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.constellation.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-start justify-center pt-[15vh]">
      <div className="w-full max-w-2xl border border-neutral-950 bg-[#050505] overflow-hidden rounded-lg shadow-2xl">
        <div className="p-4 border-b border-neutral-900 flex items-center">
          <input
            type="text"
            className="w-full bg-transparent border-0 outline-none text-white font-mono text-sm placeholder-neutral-600 uppercase tracking-widest"
            placeholder="UNIVERSAL LOOKUP (STAR, PLANET, NEBULA)..."
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="text-[10px] font-mono text-neutral-600 px-2 py-1 border border-neutral-900 rounded">
            ESC
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto p-2">
          {filteredResults.length > 0 ? (
            filteredResults.map((obj) => (
              <button
                key={obj.id}
                onClick={() => {
                  onSelectObject(obj);
                  setIsOpen(false);
                  setQuery("");
                }}
                className="w-full text-left p-3 hover:bg-neutral-900/50 rounded flex justify-between items-center group transition-all font-mono"
              >
                <div>
                  <div className="text-xs text-white group-hover:text-[#00FF66] transition-colors">
                    {obj.name}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">{obj.constellation} Sector</div>
                </div>
                <span className="text-[10px] text-neutral-600 tracking-wider font-mono uppercase bg-black px-2 py-0.5 border border-neutral-900">
                  {obj.system}
                </span>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-xs font-mono text-neutral-600 tracking-widest">
              NO MATCHING COORDINATES RECORDED
            </div>
          )}
        </div>
      </div>
    </div>
  );
}