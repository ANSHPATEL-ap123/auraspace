"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Star, Download, Camera, Settings, MapPin, Calendar as CalIcon, ChevronLeft, SlidersHorizontal, Moon, Loader2, Target, Sparkles, Zap } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { analyzeCapture } from "@/actions/analyze";
import { saveObservationLog } from "@/actions/logbook";

export default function StellarLogbook() {
  const posterRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState<"FORM" | "GENERATING" | "POSTER">("FORM");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  
  const [score, setScore] = useState<number>(0);
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const [formData, setFormData] = useState({
    title: "Orion Nebula (M42)",
    camera: "Canon EOS R6",
    lens: "Sky-Watcher 72ED (430mm)",
    iso: "1600",
    shutter: "180s",
    aperture: "f/6.0",
    wb: "3800K",
    focal: "430mm",
    focus: "MANUAL",
    imageType: "RAW",
    stacked: "60",
    calibration: "YES",
    processing: "SIRIL, PIXINSIGHT, PHOTOSHOP",
    location: "Bortle Class 3, Nainital, India",
    coords: "29.380° N, 79.462° E",
    date: "2026-05-12"
  });

  const getFormattedDate = (dateString: string) => {
    if (!dateString) return "";
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setImageMime(file.type);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setBase64Image(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'date' ? e.target.value : e.target.value.toUpperCase();
    setFormData({ ...formData, [e.target.name]: value });
  };

 const generatePoster = async () => {
    if (!imagePreview || !base64Image) return alert("Please upload a celestial capture first.");
    setStep("GENERATING");
    
    try {
      // 1. Force extraction into a completely flat, plain JavaScript object
      const telemetryPayload = {
        title: String(formData.title),
        camera: String(formData.camera),
        lens: String(formData.lens),
        iso: String(formData.iso),
        shutter: String(formData.shutter),
        aperture: String(formData.aperture),
        stacked: String(formData.stacked),
        processing: String(formData.processing),
        location: String(formData.location)
      };

      // 2. Perform the action with flattened arguments
      // We pass image data and the telemetry object separately
      const aiAnalysis = await analyzeCapture(base64Image, imageMime, telemetryPayload);
      
      setScore(aiAnalysis.score);
      setAiSuggestion(aiAnalysis.suggestion);
      setStep("POSTER");

    } catch (error) {
      console.error("Critical Backend Error:", error);
      setScore(7.5);
      setAiSuggestion("Systems offline. Please verify the AI Vision connection.");
      setStep("POSTER");
    }
  };

  const downloadPDF = async () => {
    if (!posterRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(posterRef.current, { 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#0B0D14",
        logging: false
      });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdfWidth = canvas.width / 2;
      const pdfHeight = canvas.height / 2;
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [pdfWidth, pdfHeight] });
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AuraSpace_${formData.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed:", error);
      alert("Export failed. Ensure your image is fully loaded and try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="w-full h-[calc(100vh-73px)] bg-[#020202] text-white flex flex-col font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          
          {step === "FORM" && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto p-8 py-12">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-light tracking-[0.2em] uppercase mb-2">Astro-Rating Engine</h1>
                <p className="text-xs font-mono text-neutral-500 tracking-widest uppercase">Input your telemetry matrix to generate a shareable mission poster.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Upload Area */}
                <div className="bg-[#050505] border border-neutral-800 rounded-xl p-2 h-[550px] flex flex-col relative group">
                  {imagePreview ? (
                    <div className="relative w-full h-full rounded-lg overflow-hidden border border-neutral-800">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <label className="absolute bottom-4 right-4 bg-black/70 backdrop-blur px-4 py-2 rounded text-xs font-mono cursor-pointer hover:bg-[#00FF66] hover:text-black transition-colors shadow-xl border border-neutral-700">
                        CHANGE IMAGE <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 rounded-lg cursor-pointer hover:border-[#00FF66]/50 hover:bg-[#00FF66]/5 transition-all">
                      <Upload size={32} className="text-neutral-600 mb-4 group-hover:text-[#00FF66] transition-colors" />
                      <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">Select Deep Space Image</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Telemetry Inputs */}
                <div className="bg-[#050505] border border-neutral-800 rounded-xl p-8 flex flex-col gap-6 overflow-y-auto h-[550px] custom-scrollbar shadow-xl">
                  
                  <div className="border-b border-neutral-900 pb-4">
                    <label className="text-[10px] font-mono text-[#00FF66] uppercase tracking-widest flex items-center gap-2 mb-2">
                       <Target size={14} /> Mission Designation
                    </label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., ORION NEBULA" className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg p-4 text-2xl font-light tracking-wide text-white outline-none focus:border-[#00FF66]/50 transition-colors placeholder-neutral-700" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1 block">Camera Body</label>
                      <input type="text" name="camera" value={formData.camera} onChange={handleInputChange} className="w-full bg-[#0A0A0A] border border-neutral-800 rounded p-3 text-xs font-mono outline-none focus:border-[#00FF66]/50 transition-colors" />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1 block">Optical Lens / Scope</label>
                      <input type="text" name="lens" value={formData.lens} onChange={handleInputChange} className="w-full bg-[#0A0A0A] border border-neutral-800 rounded p-3 text-xs font-mono outline-none focus:border-[#00FF66]/50 transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-neutral-900 pt-4">
                    <div>
                      <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1 block">ISO</label>
                      <input type="text" name="iso" value={formData.iso} onChange={handleInputChange} className="w-full bg-[#0A0A0A] border border-neutral-800 rounded p-2.5 text-xs font-mono outline-none focus:border-[#00FF66]/50 transition-colors" />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1 block">Shutter</label>
                      <input type="text" name="shutter" value={formData.shutter} onChange={handleInputChange} className="w-full bg-[#0A0A0A] border border-neutral-800 rounded p-2.5 text-xs font-mono outline-none focus:border-[#00FF66]/50 transition-colors" />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1 block">Aperture</label>
                      <input type="text" name="aperture" value={formData.aperture} onChange={handleInputChange} className="w-full bg-[#0A0A0A] border border-neutral-800 rounded p-2.5 text-xs font-mono outline-none focus:border-[#00FF66]/50 transition-colors" />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1 block">Stacked Frames</label>
                      <input type="text" name="stacked" value={formData.stacked} onChange={handleInputChange} className="w-full bg-[#0A0A0A] border border-neutral-800 rounded p-2.5 text-xs font-mono outline-none focus:border-[#00FF66]/50 transition-colors" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1 block">Post-Processing Stack</label>
                      <input type="text" name="processing" value={formData.processing} onChange={handleInputChange} className="w-full bg-[#0A0A0A] border border-neutral-800 rounded p-2.5 text-xs font-mono outline-none focus:border-[#00FF66]/50 transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5 pt-4 border-t border-neutral-900">
                    <div>
                      <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1 block">Location / Bortle Class</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-[#0A0A0A] border border-neutral-800 rounded p-3 text-xs font-mono outline-none focus:border-[#00FF66]/50 transition-colors" />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1 block">Capture Date</label>
                      <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full bg-[#0A0A0A] border border-neutral-800 rounded p-3 text-xs font-mono outline-none focus:border-[#00FF66]/50 transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                    </div>
                  </div>

                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button onClick={generatePoster} className="bg-[#00FF66] text-black font-bold text-xs font-mono py-4 px-12 rounded-xl uppercase tracking-[0.2em] hover:bg-[#00cc55] transition-all shadow-[0_0_20px_rgba(0,255,102,0.2)] hover:scale-105 active:scale-95">
                  Analyze & Generate Poster
                </button>
              </div>
            </motion.div>
          )}

          {step === "GENERATING" && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-neutral-800 border-t-[#D4AF37] rounded-full animate-spin mb-4" />
              <div className="text-[#D4AF37] font-mono text-xs tracking-widest uppercase animate-pulse">Vision Evaluating Telemetry Matrix...</div>
            </motion.div>
          )}

          {step === "POSTER" && (
            <motion.div key="poster" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-24 pt-8">
              <div className="max-w-[800px] mx-auto mb-6 flex justify-between items-center px-4">
                <button onClick={() => setStep("FORM")} className="flex items-center gap-2 text-neutral-400 hover:text-white font-mono text-[10px] tracking-widest uppercase transition-colors">
                  <ChevronLeft size={14} /> Back to Editor
                </button>
                <div className="flex gap-4 items-center">
                  <div className="bg-[#050505] border border-neutral-800 px-4 py-2 rounded text-xs font-mono flex items-center gap-2 shadow-lg">
                    <Star size={14} className="text-[#D4AF37]" /> AURA SCORE: <span className="text-[#00FF66] font-bold">{score}/10</span>
                  </div>
                  
                  <button 
                    onClick={downloadPDF} 
                    disabled={isExporting}
                    className={`bg-[#D4AF37] text-black font-bold text-[10px] font-mono py-2.5 px-6 rounded hover:bg-white transition-all flex items-center gap-2 uppercase tracking-widest shadow-[0_0_15px_rgba(212,175,55,0.3)] ${isExporting ? "opacity-75 cursor-not-allowed" : ""}`}
                  >
                    {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    {isExporting ? "ENCODING PDF..." : "Export HD PDF"}
                  </button>
                </div>
              </div>

              {/* DOM Canvas - PURE EXPORTABLE POSTER (No AI Feedback inside) */}
              <div className="max-w-[800px] mx-auto overflow-hidden rounded-sm" style={{ border: '1px solid #1a1a1a', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <div ref={posterRef} className="w-[800px] h-[1000px] flex flex-col items-center relative overflow-hidden" style={{ backgroundColor: '#0B0D14', color: '#D4AF37', fontFamily: 'sans-serif' }}>
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(212,175,55,0.02) 0%, transparent 40%)' }} />

                  <div className="text-center mt-12 mb-8 w-full z-10">
                    <h1 className="text-6xl tracking-widest uppercase mb-2" style={{ color: '#FFFFFF', fontFamily: 'Georgia, serif' }}>
                      ASTRO <span style={{ color: '#D4AF37' }}>CAPTURE</span>
                    </h1>
                    <div className="flex items-center justify-center gap-4">
                      <div className="h-[1px] w-12" style={{ backgroundColor: 'rgba(212,175,55,0.5)' }} />
                      <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: '#A0AABF' }}>CAPTURING THE UNIVERSE, ONE FRAME AT A TIME</p>
                      <div className="h-[1px] w-12" style={{ backgroundColor: 'rgba(212,175,55,0.5)' }} />
                    </div>
                  </div>

                  <div className="w-full px-12 flex gap-10 z-10">
                    <div className="w-[450px] h-[650px] rounded-xl overflow-hidden p-1 relative shrink-0" style={{ border: '1px solid #D4AF37', boxShadow: '0 0 30px rgba(212,175,55,0.1)' }}>
                      <div className="w-full h-full rounded-lg overflow-hidden relative flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
                        {imagePreview ? (
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Capture" crossOrigin="anonymous" />
                        ) : (
                          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#262626' }}>NO IMAGE DATA</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-5 pt-2">
                      <div className="pb-3" style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                        <div className="flex items-center gap-3 mb-1" style={{ color: '#D4AF37' }}>
                          <Camera size={14} color="#D4AF37" /> <span className="text-[10px] tracking-widest uppercase">Camera</span>
                        </div>
                        <div className="pl-7 text-xs" style={{ color: '#FFFFFF' }}>{formData.camera}</div>
                      </div>

                      <div className="pb-3" style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                        <div className="flex items-center gap-3 mb-1" style={{ color: '#D4AF37' }}>
                          <Settings size={14} color="#D4AF37" /> <span className="text-[10px] tracking-widest uppercase">Lens / Telescope</span>
                        </div>
                        <div className="pl-7 text-xs" style={{ color: '#FFFFFF' }}>{formData.lens}</div>
                      </div>

                      <div className="pb-3" style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                        <div className="flex items-center gap-3 mb-3" style={{ color: '#D4AF37' }}>
                          <SlidersHorizontal size={14} color="#D4AF37" /> <span className="text-[10px] tracking-widest uppercase">Settings</span>
                        </div>
                        <div className="pl-7 grid grid-cols-2 gap-y-2.5 text-[11px]">
                          <span style={{ color: '#A0AABF' }}>ISO</span> <span className="text-right" style={{ color: '#FFFFFF' }}>{formData.iso}</span>
                          <span style={{ color: '#A0AABF' }}>SHUTTER SPEED</span> <span className="text-right" style={{ color: '#FFFFFF' }}>{formData.shutter}</span>
                          <span style={{ color: '#A0AABF' }}>APERTURE</span> <span className="text-right" style={{ color: '#FFFFFF' }}>{formData.aperture}</span>
                          <span style={{ color: '#A0AABF' }}>WHITE BALANCE</span> <span className="text-right" style={{ color: '#FFFFFF' }}>{formData.wb}</span>
                          <span style={{ color: '#A0AABF' }}>FOCAL LENGTH</span> <span className="text-right" style={{ color: '#FFFFFF' }}>{formData.focal}</span>
                          <span style={{ color: '#A0AABF' }}>FOCUS MODE</span> <span className="text-right" style={{ color: '#FFFFFF' }}>{formData.focus}</span>
                          <span style={{ color: '#A0AABF' }}>IMAGE TYPE</span> <span className="text-right" style={{ color: '#FFFFFF' }}>{formData.imageType}</span>
                          <span style={{ color: '#A0AABF' }}>STACKED FRAMES</span> <span className="text-right" style={{ color: '#FFFFFF' }}>{formData.stacked}</span>
                          <span style={{ color: '#A0AABF' }}>CALIBRATION</span> <span className="text-right" style={{ color: '#FFFFFF' }}>{formData.calibration}</span>
                          <span style={{ color: '#A0AABF' }}>PROCESSING</span> <span className="text-right truncate" title={formData.processing} style={{ color: '#FFFFFF' }}>{formData.processing}</span>
                        </div>
                      </div>

                      <div className="pb-3" style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                        <div className="flex items-center gap-3 mb-1" style={{ color: '#D4AF37' }}>
                          <MapPin size={14} color="#D4AF37" /> <span className="text-[10px] tracking-widest uppercase">Location</span>
                        </div>
                        <div className="pl-7 text-xs leading-relaxed" style={{ color: '#FFFFFF' }}>
                          {formData.location}<br/>
                          <span style={{ color: '#A0AABF', fontSize: '10px' }}>{formData.coords}</span>
                        </div>
                      </div>

                      <div className="pb-3" style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                        <div className="flex items-center gap-3 mb-1" style={{ color: '#D4AF37' }}>
                          <CalIcon size={14} color="#D4AF37" /> <span className="text-[10px] tracking-widest uppercase">Date</span>
                        </div>
                        <div className="pl-7 text-xs" style={{ color: '#FFFFFF' }}>{getFormattedDate(formData.date)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-8 w-full flex flex-col items-center z-10">
                    <div className="flex items-center gap-4 mb-4" style={{ color: '#D4AF37' }}>
                      <div className="h-[1px] w-16" style={{ backgroundColor: 'rgba(212,175,55,0.5)' }} />
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
                      <Moon size={24} color="#D4AF37" />
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
                      <div className="h-[1px] w-16" style={{ backgroundColor: 'rgba(212,175,55,0.5)' }} />
                    </div>
                    <div className="rounded-full px-8 py-2" style={{ border: '1px solid rgba(212,175,55,0.5)' }}>
                      <span className="tracking-[0.5em] text-sm uppercase" style={{ color: '#D4AF37' }}>AURASPACE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ISOLATED PREMIUM AI FEEDBACK FLASHCARD */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="max-w-[800px] mx-auto mt-8 bg-gradient-to-br from-[#0A0A0A] to-[#11131A] border border-[#00FF66]/20 rounded-xl p-6 shadow-[0_10px_30px_rgba(0,255,102,0.05)] cursor-default relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF66]/50 to-transparent opacity-50" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="bg-[#00FF66]/10 p-3 rounded-lg border border-[#00FF66]/20 shrink-0 shadow-inner">
                    <Zap size={24} className="text-[#00FF66]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono tracking-widest uppercase text-[#00FF66] mb-2 font-bold flex items-center gap-2">
                       Vision Analysis <span className="bg-[#00FF66]/20 text-[#00FF66] px-2 py-0.5 rounded text-[9px]">LIVE</span>
                    </h3>
                    <p className="text-sm font-sans text-neutral-300 leading-relaxed">
                      {aiSuggestion}
                    </p>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333333; }
      `}</style>
    </main>
  );
}