"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Sparkles, Compass, Shield } from "lucide-react";

interface IntroCinematicProps {
  onComplete: () => void;
}

export default function IntroCinematic({ onComplete }: IntroCinematicProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textCountRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // 1. Progress Counter Animation
    const counterObj = { value: 0 };
    const timeline = gsap.timeline({
      onComplete: () => {
        // Play the fracture/scatter transition
        playFractureSequence();
      }
    });

    timeline.to(counterObj, {
      value: 100,
      duration: 3.2,
      ease: "power2.out",
      onUpdate: () => {
        setPercent(Math.floor(counterObj.value));
        if (textCountRef.current) {
          textCountRef.current.innerText = counterObj.value.toFixed(4);
        }
      }
    });

    // 2. Beautiful galaxy 2D canvas point cloud rotation
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        let width = (canvas.width = 400);
        let height = (canvas.height = 400);
        
        // Generate golden spiral arm points
        const pointsCount = 600;
        const points: { r: number; theta: number; size: number; alpha: number; speed: number }[] = [];

        for (let i = 0; i < pointsCount; i++) {
          const arm = i % 3; // 3 arms
          const ratio = i / pointsCount;
          const r = ratio * 180 + Math.random() * 15;
          const theta = (arm * Math.PI * 2) / 3 + ratio * 8 + (Math.random() - 0.5) * 0.3;
          points.push({
            r,
            theta,
            size: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.5 + 0.3,
            speed: 0.005 + (1 - ratio) * 0.015 // spiral core spins faster
          });
        }

        let animationId: number;
        let scaleFactor = 1.0;
        let globalAlpha = 1.0;
        let scatterSpeed = 0.0;

        const renderGalaxy = () => {
          ctx.clearRect(0, 0, width, height);
          ctx.save();
          ctx.translate(width / 2, height / 2);
          
          points.forEach((p) => {
            // Apply coordinates rotation
            p.theta += p.speed * (1 + scatterSpeed * 5);
            
            // Scatter outward when fracturing
            if (scatterSpeed > 0) {
              p.r += (p.r * 0.05 + 2) * scatterSpeed;
              p.alpha = Math.max(0, p.alpha - 0.01);
            }

            const x = p.r * Math.cos(p.theta) * scaleFactor;
            const y = p.r * Math.sin(p.theta) * scaleFactor;

            ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * globalAlpha})`;
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Add center glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = "rgba(255,255,255,0.4)";
          });

          ctx.restore();
          animationId = requestAnimationFrame(renderGalaxy);
        };

        renderGalaxy();

        // Save reference to scatter properties to manipulate inside GSAP callback
        (canvas as any).scatterAnim = (val: number) => {
          scatterSpeed = val;
        };
        (canvas as any).scaleAnim = (val: number) => {
          scaleFactor = val;
        };
        (canvas as any).alphaAnim = (val: number) => {
          globalAlpha = val;
        };

        // Cleanup
        return () => {
          cancelAnimationFrame(animationId);
        };
      }
    }
  }, []);

  const playFractureSequence = () => {
    const canvasObj = canvasRef.current;
    const overlay = overlayRef.current;
    const statusBox = statusRef.current;

    const transitionTimeline = gsap.timeline({
      onComplete: () => {
        onComplete();
      }
    });

    // Update loading text label to INITIALIZED
    if (statusBox) {
      statusBox.innerText = "COORDINATE BASE CONVERGED. INITIALIZING STAGE...";
    }

    // GSAP coordinates fracture
    transitionTimeline.to(statusBox, {
      opacity: 0,
      y: -10,
      duration: 0.6,
      ease: "power2.inOut"
    });

    if (canvasObj && (canvasObj as any).scatterAnim) {
      transitionTimeline.to({ scatter: 0, scale: 1.0, alpha: 1.0 }, {
        scatter: 1.0,
        scale: 0.7,
        alpha: 0.0,
        duration: 1.4,
        ease: "power3.inOut",
        onUpdate: function() {
          const targets = this.targets()[0];
          (canvasObj as any).scatterAnim(targets.scatter);
          (canvasObj as any).scaleAnim(targets.scale);
          (canvasObj as any).alphaAnim(targets.alpha);
        }
      }, "-=0.4");
    }

    transitionTimeline.to(overlay, {
      opacity: 0,
      duration: 0.8,
      ease: "power3.inOut"
    }, "-=0.6");
  };

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center pointer-events-auto"
    >
      {/* Swiss grid alignment template */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none border border-white/[0.02]">
        <div className="border-r border-b border-white/[0.02]"></div>
        <div className="border-r border-b border-white/[0.02]"></div>
        <div className="border-r border-b border-white/[0.02]"></div>
        <div className="border-b border-white/[0.02]"></div>
      </div>

      <div className="relative flex flex-col items-center justify-center text-center space-y-6 max-w-lg px-6 z-10">
        
        {/* Slow spinning point cloud canvas representing a galaxy */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full block filter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <Compass className="w-5 h-5 text-neutral-500 animate-spin-slow mx-auto mb-1" />
            <span className="font-mono text-[8px] text-neutral-600 uppercase tracking-widest block">
              COORDINATE SYSTEM
            </span>
          </div>
        </div>

        {/* Cinematic micro-typography Coordinate Counter */}
        <div className="space-y-1 text-center font-mono">
          <div className="text-[10px] text-neutral-500 uppercase tracking-[0.25em]">
            CALIBRATING CELESTIAL ALIGNMENTS
          </div>
          <div className="text-2xl font-bold tracking-wider text-neutral-100 subpixel-glow">
            <span ref={textCountRef}>00.0000</span>
            <span className="text-xs text-neutral-500 ml-1">%</span>
          </div>
        </div>

        {/* Micro Telemetry Details */}
        <div 
          ref={statusRef}
          className="font-mono text-[8px] text-neutral-500 uppercase tracking-widest border border-neutral-900 bg-neutral-950 px-3 py-1.5 rounded"
        >
          CONNECTING GEOLOCATION METADATA... {percent}%
        </div>
      </div>

      {/* Floating telemetry metrics in bottom corners */}
      <div className="absolute bottom-6 left-6 font-mono text-[8px] text-neutral-600 uppercase tracking-widest hidden md:block">
        <div>ORBITAL SPHERE ENGINE V3.0</div>
        <div>STABLE REF: J2000.0 MERIDIAN</div>
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[8px] text-neutral-600 uppercase tracking-widest hidden md:block">
        <div>LATITUDE REF: MULTI_POINT</div>
        <div>TRUE BLACK HIGH-END SYSTEM</div>
      </div>
    </div>
  );
}
