"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Camera, MapPin, Clock, ChevronRight, Sparkles, X, Target, Moon, Star, Sun, Sparkle, Info, Loader2 } from "lucide-react";

// The simulated "Live API Payload" containing actual late-2026 astronomical events
const fetchLiveEvents = async () => {
  // Simulating network latency for the API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    featured: [
      {
        id: "evt-01",
        title: "Total Solar Eclipse",
        type: "SOLAR TRANSIT",
        date: "Aug 12, 2026, 17:00 UTC",
        location: "Greenland, Iceland, Spain",
        description: "A spectacular total solar eclipse. The path of totality sweeps across Greenland, Iceland, and northern Spain, with maximum totality lasting 2 minutes and 18 seconds.",
        image: "https://images.unsplash.com/photo-1537429149819-7435f33f6df3?q=80&w=2000&auto=format&fit=crop", 
        settings: { aperture: "f/8", shutter: "1/500s", iso: "100", lens: "400mm+ (SOLAR FILTER)" },
      },
      {
        id: "evt-02",
        title: "Perseid Meteor Shower Peak",
        type: "METEOR SHOWER",
        date: "Aug 13, 2026, 02:00 Local",
        location: "Constellation Perseus (Zenith)",
        description: "One of the best meteor showers of the year. In 2026, the peak coincides with a New Moon, guaranteeing extremely dark skies and up to 100 visible meteors per hour.",
        image: "https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=2000&auto=format&fit=crop",
        settings: { aperture: "f/1.8", shutter: "15s", iso: "3200", lens: "14mm - 24mm" },
      },
      {
        id: "evt-03",
        title: "Partial Lunar Eclipse",
        type: "LUNAR PHASE",
        date: "Aug 28, 2026, 04:12 UTC",
        location: "Europe, Asia, Africa, Americas",
        description: "The Earth's shadow will partially obscure the moon. At maximum, roughly 90% of the moon will be in Earth's umbra, giving it a dramatic, bitten appearance.",
        image: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=2000&auto=format&fit=crop",
        settings: { aperture: "f/8", shutter: "1/125s", iso: "200", lens: "300mm+" },
      },
      {
        id: "evt-04",
        title: "Geminid Meteor Shower Peak",
        type: "METEOR SHOWER",
        date: "Dec 14, 2026, 01:00 Local",
        location: "Constellation Gemini",
        description: "The king of meteor showers. ZHR reaches up to 120 multicolored meteors per hour. The moon will set before peak visibility, making conditions excellent.",
        image: "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2000&auto=format&fit=crop",
        settings: { aperture: "f/2.0", shutter: "10s", iso: "1600", lens: "16mm - 35mm" },
      }
    ],
    timeline: [
      { date: "AUG 12", title: "Total Solar Eclipse", icon: "sun", details: "Visible in Iceland, Greenland, and Spain. Use approved solar filters. DO NOT look directly at the sun." },
      { date: "AUG 13", title: "Perseids Peak", icon: "meteor", details: "Peak of the Perseid meteor shower. Excellent viewing conditions this year due to the new moon." },
      { date: "AUG 15", title: "Venus Elongation East", icon: "stars", details: "Venus reaches its greatest eastern elongation. Look for it as the brilliant 'Evening Star' in the west after sunset." },
      { date: "AUG 28", title: "Partial Lunar Eclipse", icon: "moon-highlight", details: "The moon passes into the Earth's umbra. At maximum eclipse, 90% of the moon will be covered." },
      { date: "SEP 23", title: "September Equinox", icon: "sun", details: "The sun crosses the celestial equator. Day and night are of approximately equal length everywhere on Earth." },
      { date: "OCT 23", title: "Orionids Peak", icon: "meteor", details: "Debris from Halley's Comet. Expect around 20 meteors per hour radiating from Orion." },
      { date: "NOV 25", title: "Uranus at Opposition", icon: "conjunction", details: "Uranus is at its closest to Earth and fully illuminated by the Sun. Best time to view with a telescope." },
      { date: "DEC 14", title: "Geminids Peak", icon: "meteor", details: "The most spectacular meteor shower of the year, producing up to 120 multi-colored meteors per hour." },
    ]
  };
};

export default function EventVault() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeEventId, setActiveEventId] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for live API data
  const [events, setEvents] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  
  const filters = ["ALL", "LUNAR", "PLANETARY", "DEEP SKY"];

  // Fetch Live Data on Mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const liveData = await fetchLiveEvents();
        setEvents(liveData.featured);
        setTimeline(liveData.timeline);
        setActiveEventId(liveData.featured[0].id);
      } catch (error) {
        console.error("Failed to fetch telemetry data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const featuredEvent = events.find(e => e.id === activeEventId) || events[0];
  const listEvents = events.filter(e => e.id !== activeEventId);

  const renderCalendarIcon = (type: string) => {
    switch (type) {
      case "stars": return <div className="flex gap-1"><Star size={16} fill="#ffffff" /><Star size={10} fill="#ffffff" /></div>;
      case "conjunction": return <div className="flex gap-2 items-center"><Moon size={18} fill="#cccccc" /><Star size={10} fill="#ffffff" /></div>;
      case "moon": return <Moon size={24} fill="#dddddd" className="text-transparent" />;
      case "moon-highlight": return <Moon size={28} fill="#ffddaa" className="text-transparent drop-shadow-[0_0_15px_rgba(255,221,170,0.6)]" />;
      case "sun": return <Sun size={28} fill="#fdb813" className="text-transparent drop-shadow-[0_0_15px_rgba(253,184,19,0.5)]" />;
      case "meteor": return <div className="flex flex-col gap-1"><Sparkle size={14} fill="#ffffff" className="translate-x-2" /><Sparkle size={16} fill="#ffffff" /></div>;
      default: return <Star size={16} fill="#ffffff" />;
    }
  };

  return (
    <main className="w-full h-[calc(100vh-73px)] bg-[#020202] text-white flex flex-col font-sans overflow-hidden">
      
      {/* PAGE HEADER */}
      <div className="px-8 pt-8 pb-4 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-light tracking-[0.1em] uppercase mb-2 flex items-center gap-3">
            Celestial Event Vault <Sparkles size={24} className="text-[#00FF66]" />
          </h1>
          <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
            Upcoming Transits, Alignments, and Photographic Opportunities
          </p>
        </div>

        <button 
          onClick={() => setIsCalendarOpen(true)}
          className="flex items-center gap-2 bg-[#0A0A0A] border border-neutral-800 hover:border-[#00FF66]/50 transition-all px-5 py-2.5 rounded-md text-xs font-mono text-neutral-300 uppercase tracking-widest group shadow-lg"
        >
          <Calendar size={14} className="text-neutral-500 group-hover:text-[#00FF66] transition-colors" />
          Launch Observation Board
        </button>
      </div>

      {/* MAIN GRID CONTENT */}
      <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
        <div className="flex gap-3 mb-8">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-mono tracking-widest uppercase transition-all ${
                activeFilter === filter 
                  ? "bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 shadow-[0_0_15px_rgba(0,255,102,0.1)]" 
                  : "bg-transparent text-neutral-500 border border-neutral-800 hover:text-white hover:border-neutral-600"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[520px] text-neutral-500 font-mono tracking-widest uppercase text-xs">
            <Loader2 size={32} className="animate-spin text-[#00FF66] mb-4" />
            Syncing Global Telemetry...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
            
            {/* FEATURED EVENT */}
            <motion.div 
              layoutId={`card-${featuredEvent?.id}`}
              key={featuredEvent?.id}
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="lg:col-span-7 relative rounded-xl overflow-hidden border border-neutral-800 shadow-2xl h-[520px] group"
            >
              <div className="absolute inset-0 border border-[#00FF66]/20 rounded-xl z-20 pointer-events-none" />
              <div className="absolute inset-0 z-0">
                <img 
  src={featuredEvent?.image || "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2000&auto=format&fit=crop"} 
  alt={featuredEvent?.title} 
  className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
  onError={(e) => {
    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2000&auto=format&fit=crop";
  }}
/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/80 to-transparent" />
              </div>

              <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="flex items-center gap-2 bg-[#00FF66]/10 backdrop-blur-md text-[#00FF66] border border-[#00FF66]/30 px-3 py-1.5 rounded text-[10px] font-mono tracking-widest uppercase">
                    <Target size={12} /> Active Telemetry Lock
                  </span>
                  <span className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded text-[10px] font-mono text-white tracking-widest border border-neutral-700">
                    {featuredEvent?.type}
                  </span>
                </div>

                <div>
                  <h2 className="text-4xl font-semibold mb-4 tracking-wide text-white drop-shadow-lg">{featuredEvent?.title}</h2>
                  <div className="flex flex-wrap gap-5 mb-5 text-xs font-mono text-[#00FF66]">
                    <span className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded border border-neutral-800"><Clock size={12} /> {featuredEvent?.date}</span>
                    <span className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded border border-neutral-800"><MapPin size={12} /> {featuredEvent?.location}</span>
                  </div>
                  <p className="text-sm font-sans text-neutral-300 max-w-xl leading-relaxed mb-8 drop-shadow-md">
                    {featuredEvent?.description}
                  </p>

                  <div className="inline-flex items-center gap-5 bg-black/70 backdrop-blur-xl border border-neutral-700 rounded-lg p-4 shadow-2xl">
                    <div className="flex items-center gap-2 pr-5 border-r border-neutral-700 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                      <Camera size={14} className="text-white" /> Optimal Exposure
                    </div>
                    <div className="flex gap-5 text-xs font-mono text-white">
                      <span><span className="text-neutral-500">AP/</span>{featuredEvent?.settings.aperture}</span>
                      <span><span className="text-neutral-500">SS/</span>{featuredEvent?.settings.shutter}</span>
                      <span><span className="text-neutral-500">ISO/</span>{featuredEvent?.settings.iso}</span>
                      <span className="text-[#00FF66]"><span className="text-neutral-500">LENS/</span>{featuredEvent?.settings.lens}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* SECONDARY EVENTS LIST */}
            <div className="lg:col-span-5 flex flex-col gap-4 h-[520px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {listEvents.map((event) => (
                  <motion.div 
                    layoutId={`card-${event.id}`}
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setActiveEventId(event.id)}
                    className="bg-[#050505] border border-neutral-800 rounded-xl overflow-hidden hover:border-[#00FF66]/50 transition-all cursor-pointer group flex h-[160px] shrink-0 shadow-lg"
                  >
                    <div className="w-2/5 relative overflow-hidden">
                      <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050505]" />
                    </div>

                    <div className="w-3/5 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-mono text-[#00FF66] tracking-widest uppercase">{event.type}</span>
                        </div>
                        <h3 className="text-sm font-semibold truncate mb-3 text-white">{event.title}</h3>
                        <div className="text-[10px] font-mono text-neutral-400 flex flex-col gap-1.5">
                          <span className="flex items-center gap-2"><Clock size={12} /> {event.date}</span>
                          <span className="flex items-center gap-2 truncate"><MapPin size={12} /> {event.location}</span>
                        </div>
                      </div>
                      <div className="pt-3 mt-3 border-t border-neutral-900 flex justify-between items-center text-[10px] font-mono text-neutral-500">
                        <span>LENS: {event.settings.lens}</span>
                        <span className="flex items-center gap-1 text-[#00FF66] group-hover:translate-x-1 transition-transform tracking-widest uppercase">
                          Details <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* THE MONTHLY OBSERVATION BOARD WITH HOVER STATE */}
      <AnimatePresence>
        {isCalendarOpen && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-6xl max-h-[90vh] bg-[#020202] border border-neutral-800 shadow-2xl rounded-xl overflow-hidden relative flex flex-col"
            >
              {/* Board Header */}
              <div className="flex justify-between items-center p-6 border-b border-neutral-900 bg-[#050505] z-30 relative">
                <div>
                  <h2 className="text-2xl font-light tracking-wide text-white">Observation Board: H2 2026</h2>
                  <p className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase mt-1">Live Chronological Event Manifest</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 bg-[#0A0A0A] border border-neutral-800 text-neutral-400 text-xs font-mono rounded hover:text-white transition-colors">PREV</button>
                    <button className="px-4 py-1.5 bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 text-xs font-mono rounded">NEXT</button>
                  </div>
                  <button 
                    onClick={() => setIsCalendarOpen(false)}
                    className="p-2 bg-[#0A0A0A] border border-neutral-800 hover:border-neutral-600 rounded text-neutral-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* The Interactive Card Grid */}
              <div className="p-8 overflow-y-auto custom-scrollbar bg-[#020202]">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {timeline.map((evt, i) => (
                    <div 
                      key={i} 
                      className={`relative flex flex-col items-center justify-between p-4 h-[180px] rounded-lg border transition-all cursor-pointer group overflow-hidden ${
                        evt.icon.includes("highlight") 
                          ? "bg-gradient-to-b from-[#0A0A0A] to-[#2a1a05]/20 border-[#ffddaa]/40 hover:border-[#ffddaa]/80"
                          : "bg-[#0A0A0A] border-neutral-800 hover:border-[#00FF66]/50"
                      }`}
                    >
                      <div className="absolute inset-0 p-4 flex flex-col items-center justify-between group-hover:opacity-20 transition-opacity duration-300">
                        <div className={`px-3 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase z-10 ${
                          evt.icon.includes("highlight") ? "bg-[#ffddaa] text-black font-bold" : "bg-[#00FF66] text-black font-bold"
                        }`}>
                          {evt.date}
                        </div>
                        <div className="flex-1 flex items-center justify-center w-full z-10 group-hover:scale-110 transition-transform duration-500">
                          {renderCalendarIcon(evt.icon)}
                        </div>
                        <div className={`w-full text-center text-xs font-sans z-10 ${
                          evt.icon.includes("highlight") ? "text-[#ffddaa]" : "text-white"
                        }`}>
                          {evt.title}
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-sm p-4 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-y-4 group-hover:translate-y-0">
                        <Info size={16} className={`${evt.icon.includes("highlight") ? "text-[#ffddaa]" : "text-[#00FF66]"} mb-2`} />
                        <div className={`text-[9px] font-mono mb-2 uppercase tracking-widest border-b pb-1 text-center w-full ${evt.icon.includes("highlight") ? "text-[#ffddaa] border-[#ffddaa]/30" : "text-[#00FF66] border-[#00FF66]/30"}`}>
                          Observation Notes
                        </div>
                        <p className="text-[10px] font-sans text-neutral-300 leading-relaxed text-center overflow-y-auto custom-scrollbar pr-1">
                          {evt.details}
                        </p>
                      </div>
                      
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333333; }
      `}</style>
    </main>
  );
}