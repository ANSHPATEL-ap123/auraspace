// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import * as THREE from "three";
// import gsap from "gsap";
// import { CelestialNode, CELESTIAL_CATALOG, celestialToCartesian } from "@/utils/celestialDb";
// import { Compass, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

// interface WebGLViewportProps {
//   activeNode: CelestialNode;
//   onSelectNode: (node: CelestialNode) => void;
//   timeOffset: number; // 0 to 24 hours
// }

// export default function WebGLViewport({ activeNode, onSelectNode, timeOffset }: WebGLViewportProps) {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
  
//   // Three.js internal refs
//   const sceneRef = useRef<THREE.Scene | null>(null);
//   const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
//   const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
//   const starsRef = useRef<THREE.Points | null>(null);
//   const gridGroupRef = useRef<THREE.Group | null>(null);
//   const nodesGroupRef = useRef<THREE.Group | null>(null);
  
//   // Custom camera controls state
//   const cameraRotation = useRef({ x: 0.4, y: 0.5 });
//   const cameraZoom = useRef(24);
//   const isDragging = useRef(false);
//   const previousMousePosition = useRef({ x: 0, y: 0 });

//   // Floating label display states
//   const [hoveredNode, setHoveredTarget] = useState<CelestialNode | null>(null);
//   const [mousePos2D, setMousePos2D] = useState({ x: 0, y: 0 });

//   // Handle window resizing
//   useEffect(() => {
//     const handleResize = () => {
//       if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
//       const width = containerRef.current.clientWidth;
//       const height = containerRef.current.clientHeight;

//       cameraRef.current.aspect = width / height;
//       cameraRef.current.updateProjectionMatrix();
//       rendererRef.current.setSize(width, height);
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // Sync timeline offset rotation
//   useEffect(() => {
//     if (gridGroupRef.current && nodesGroupRef.current) {
//       // Rotating the celestial sphere around Earth's axis (Y) based on hours of the night
//       const rotY = (timeOffset * 15 * Math.PI) / 180;
//       gsap.to([gridGroupRef.current.rotation, nodesGroupRef.current.rotation], {
//         y: rotY,
//         duration: 0.5,
//         ease: "power2.out"
//       });
//     }
//   }, [timeOffset]);

//   // Cinematic Camera Fly-to when active node changes
//   useEffect(() => {
//     if (!activeNode || !cameraRef.current) return;
    
//     // Calculate 3D target coordinates of active node
//     const pos = celestialToCartesian(activeNode.ra, activeNode.dec, 15);
    
//     // Calculate polar angles to target
//     // We want the camera to align directly facing this 3D node
//     const targetYAngle = Math.atan2(pos.x, pos.z);
//     const targetXAngle = Math.asin(pos.y / 15);

//     // Smoothly animate camera rotation values using GSAP
//     gsap.to(cameraRotation.current, {
//       x: -targetXAngle,
//       y: targetYAngle + Math.PI, // look towards center from outside
//       duration: 1.8,
//       ease: "power3.inOut"
//     });

//     // Zoom slightly in on deep space targets
//     const desiredZoom = activeNode.category === "Deep Space" ? 16 : 24;
//     gsap.to(cameraZoom, {
//       current: desiredZoom,
//       duration: 1.5,
//       ease: "power3.inOut"
//     });

//   }, [activeNode]);

//   // Main Three.js Scene Setup
//   useEffect(() => {
//     if (!canvasRef.current || !containerRef.current) return;

//     const width = containerRef.current.clientWidth;
//     const height = containerRef.current.clientHeight;

//     // 1. Scene & Render
//     const scene = new THREE.Scene();
//     sceneRef.current = scene;
//     scene.fog = new THREE.FogExp2(0x000000, 0.015);

//     // 2. Camera
//     const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
//     cameraRef.current = camera;

//     // 3. WebGL Renderer
//     const renderer = new THREE.WebGLRenderer({
//       canvas: canvasRef.current,
//       antialias: true,
//       alpha: true,
//     });
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     renderer.setSize(width, height);
//     rendererRef.current = renderer;

//     // 4. Background Starfield Point-Cloud
//     const starCount = 3500;
//     const starGeometry = new THREE.BufferGeometry();
//     const starPositions = new Float32Array(starCount * 3);
//     const starColors = new Float32Array(starCount * 3);

//     for (let i = 0; i < starCount * 3; i += 3) {
//       // Random coordinates distributed on a large sphere boundary
//       const u = Math.random();
//       const v = Math.random();
//       const theta = u * 2.0 * Math.PI;
//       const phi = Math.acos(2.0 * v - 1.0);
//       const r = 80 + Math.random() * 40; // distant star boundary

//       starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
//       starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
//       starPositions[i + 2] = r * Math.cos(phi);

//       // Diverse star spectral temperatures: pure white, light blue, soft orange
//       const randColor = Math.random();
//       if (randColor > 0.85) {
//         // Star blue
//         starColors[i] = 0.7; starColors[i + 1] = 0.85; starColors[i + 2] = 1.0;
//       } else if (randColor > 0.7) {
//         // Star warm orange
//         starColors[i] = 1.0; starColors[i + 1] = 0.8; starColors[i + 2] = 0.6;
//       } else {
//         // Pure white
//         starColors[i] = 0.95; starColors[i + 1] = 0.95; starColors[i + 2] = 1.0;
//       }
//     }

//     starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
//     starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

//     // Star Shader Material
//     const starMaterial = new THREE.PointsMaterial({
//       size: 1.0,
//       vertexColors: true,
//       transparent: true,
//       opacity: 0.85,
//       sizeAttenuation: true,
//     });

//     const stars = new THREE.Points(starGeometry, starMaterial);
//     scene.add(stars);
//     starsRef.current = stars;

//     // 5. Celestial Coordinate Lat/Long grid
//     const gridGroup = new THREE.Group();
//     scene.add(gridGroup);
//     gridGroupRef.current = gridGroup;

//     // Drawing Equator and Orbit meridian lines
//     const createRing = (radius: number, color: number, opacity: number, segments = 64) => {
//       const ringGeom = new THREE.BufferGeometry();
//       const points = [];
//       for (let i = 0; i <= segments; i++) {
//         const theta = (i / segments) * Math.PI * 2;
//         points.push(new THREE.Vector3(radius * Math.cos(theta), 0, radius * Math.sin(theta)));
//       }
//       ringGeom.setFromPoints(points);
//       const ringMat = new THREE.LineBasicMaterial({
//         color,
//         transparent: true,
//         opacity,
//         linewidth: 1,
//       });
//       return new THREE.Line(ringGeom, ringMat);
//     };

//     // Parallel rings representing sky declinations (-60, -30, 0, 30, 60 degrees)
//     const decs = [-60, -30, 0, 30, 60];
//     decs.forEach((dec) => {
//       const decRad = (dec * Math.PI) / 180;
//       const ringRadius = 20 * Math.cos(decRad);
//       const ringY = 20 * Math.sin(decRad);
//       const ring = createRing(ringRadius, dec === 0 ? 0xffffff : 0x444444, dec === 0 ? 0.15 : 0.05);
//       ring.position.y = ringY;
//       gridGroup.add(ring);
//     });

//     // Meridian lines connecting north and south poles
//     const meridians = 12;
//     for (let i = 0; i < meridians; i++) {
//       const ra = (i / meridians) * Math.PI * 2;
//       const points = [];
//       const steps = 32;
//       for (let j = 0; j <= steps; j++) {
//         const dec = -90 + (j / steps) * 180;
//         const pos = celestialToCartesian(ra, dec, 20);
//         points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
//       }
//       const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
//       const lineMat = new THREE.LineBasicMaterial({
//         color: 0x444444,
//         transparent: true,
//         opacity: 0.05
//       });
//       gridGroup.add(new THREE.Line(lineGeom, lineMat));
//     }

//     // 6. Horizon line plane
//     const horizonGrid = new THREE.GridHelper(40, 20, 0x059669, 0x111827);
//     const horizonMat = horizonGrid.material as THREE.Material;
//     horizonMat.transparent = true;
//     horizonMat.opacity = 0.06;
//     horizonGrid.position.y = -1; // offset horizon slightly
//     scene.add(horizonGrid);

//     // 7. Interactive Node spheres
//     const nodesGroup = new THREE.Group();
//     scene.add(nodesGroup);
//     nodesGroupRef.current = nodesGroup;

//     CELESTIAL_CATALOG.forEach((node) => {
//       const pos = celestialToCartesian(node.ra, node.dec, 15);
      
//       // Node marker point
//       const nodeGeom = new THREE.SphereGeometry(node.id === "moon" ? 0.35 : 0.22, 16, 16);
      
//       // Distinct core materials depending on catalog type
//       let nodeColor = 0x3b82f6; // Stars / normal
//       if (node.category === "Solar System") nodeColor = 0xf59e0b; // Amber
//       if (node.category === "Deep Space") nodeColor = 0xec4899; // Pink
//       if (node.id === "polaris") nodeColor = 0x10b981; // Emerald

//       const nodeMat = new THREE.MeshBasicMaterial({
//         color: nodeColor,
//         transparent: true,
//         opacity: 0.9,
//       });

//       const mesh = new THREE.Mesh(nodeGeom, nodeMat);
//       mesh.position.set(pos.x, pos.y, pos.z);
//       mesh.userData = { node }; // Bind reference metadata
//       nodesGroup.add(mesh);

//       // Trajectory paths for Solar System targets
//       if (node.category === "Solar System") {
//         const pathRadius = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
//         const pathLine = createRing(pathRadius, nodeColor, 0.04);
//         pathLine.position.y = pos.y;
//         gridGroup.add(pathLine);
//       }
//     });

//     // 8. Animation Loop
//     let animationFrameId: number;
//     const animate = () => {
//       animationFrameId = requestAnimationFrame(animate);

//       // Keep distant stars background drifting extremely slowly
//       if (starsRef.current) {
//         starsRef.current.rotation.y += 0.0003;
//       }

//       // Compute camera position relative to center lookat (0,0,0) based on mouse drag rotation
//       const theta = cameraRotation.current.y;
//       const phi = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, cameraRotation.current.x));
//       const radius = cameraZoom.current;

//       camera.position.x = radius * Math.cos(phi) * Math.sin(theta);
//       camera.position.z = radius * Math.cos(phi) * Math.cos(theta);
//       camera.position.y = radius * Math.sin(phi);

//       camera.lookAt(0, 0, 0);

//       renderer.render(scene, camera);
//     };

//     animate();

//     // Cleanups
//     return () => {
//       cancelAnimationFrame(animationFrameId);
//       starGeometry.dispose();
//       starMaterial.dispose();
//       renderer.dispose();
//     };
//   }, []);

//   // Raycast to support clicking on 3D node indicators directly on canvas
//   const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
//     if (!canvasRef.current || !cameraRef.current || !nodesGroupRef.current) return;

//     // Only click if it wasn't a drag release
//     const rect = canvasRef.current.getBoundingClientRect();
//     const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
//     const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

//     const raycaster = new THREE.Raycaster();
//     raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

//     const intersects = raycaster.intersectObjects(nodesGroupRef.current.children);

//     if (intersects.length > 0) {
//       const first = intersects[0].object;
//       const node = first.userData?.node as CelestialNode;
//       if (node) {
//         onSelectNode(node);
//       }
//     }
//   };

//   // Mouse drag camera tracking controls
//   const handleMouseDown = (e: React.MouseEvent) => {
//     isDragging.current = true;
//     previousMousePosition.current = {
//       x: e.clientX,
//       y: e.clientY,
//     };
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!canvasRef.current) return;

//     const rect = canvasRef.current.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
    
//     // Check mouse hover for labels
//     if (cameraRef.current && nodesGroupRef.current) {
//       const mouseX = (x / rect.width) * 2 - 1;
//       const mouseY = -(y / rect.height) * 2 + 1;

//       const raycaster = new THREE.Raycaster();
//       raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
//       const intersects = raycaster.intersectObjects(nodesGroupRef.current.children);

//       if (intersects.length > 0) {
//         const first = intersects[0].object;
//         const targetNode = first.userData?.node as CelestialNode;
//         setHoveredTarget(targetNode);
//         setMousePos2D({ x: e.clientX - rect.left, y: e.clientY - rect.top });
//       } else {
//         setHoveredTarget(null);
//       }
//     }

//     if (!isDragging.current) return;

//     const deltaX = e.clientX - previousMousePosition.current.x;
//     const deltaY = e.clientY - previousMousePosition.current.y;

//     cameraRotation.current.y -= deltaX * 0.005;
//     cameraRotation.current.x -= deltaY * 0.005;

//     previousMousePosition.current = {
//       x: e.clientX,
//       y: e.clientY,
//     };
//   };

//   const handleMouseUp = () => {
//     isDragging.current = false;
//   };

//   const handleZoom = (direction: "in" | "out") => {
//     const delta = direction === "in" ? -4 : 4;
//     gsap.to(cameraZoom, {
//       current: Math.max(8, Math.min(45, cameraZoom.current + delta)),
//       duration: 0.6,
//       ease: "power2.out"
//     });
//   };

//   return (
//     <div 
//       ref={containerRef} 
//       className="relative w-full h-[320px] md:h-full bg-black select-none border border-neutral-900 overflow-hidden"
//     >
//       <canvas
//         ref={canvasRef}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onMouseLeave={handleMouseUp}
//         onClick={handleCanvasClick}
//         className="w-full h-full block cursor-grab active:cursor-grabbing"
//       />

//       {/* Viewport UI Overlays */}
//       <div className="absolute top-4 left-4 pointer-events-none font-mono text-[9px] text-neutral-500 uppercase tracking-widest leading-none space-y-1">
//         <div className="flex items-center gap-1.5 text-neutral-400">
//           <Compass className="w-3.5 h-3.5 text-emerald-500 animate-spin-slow" />
//           <span>CELESTIAL VIEWPORT (GL)</span>
//         </div>
//         <div>RENDER STAGE: IMMERSIVE 3D</div>
//         <div>FIELD ANGLE: 45° • ZOOM: {Math.round(40 / cameraZoom.current * 100)}%</div>
//       </div>

//       {/* Navigation calibration controllers */}
//       <div className="absolute bottom-4 right-4 flex items-center gap-1">
//         <button
//           onClick={() => handleZoom("in")}
//           className="w-7 h-7 bg-black/90 border border-neutral-800 hover:border-neutral-500 text-neutral-400 hover:text-white rounded flex items-center justify-center transition-all"
//           title="Zoom In"
//         >
//           <ZoomIn className="w-3.5 h-3.5" />
//         </button>
//         <button
//           onClick={() => handleZoom("out")}
//           className="w-7 h-7 bg-black/90 border border-neutral-800 hover:border-neutral-500 text-neutral-400 hover:text-white rounded flex items-center justify-center transition-all"
//           title="Zoom Out"
//         >
//           <ZoomOut className="w-3.5 h-3.5" />
//         </button>
//         <button
//           onClick={() => {
//             gsap.to(cameraRotation.current, { x: 0.4, y: 0.5, duration: 1 });
//             gsap.to(cameraZoom, { current: 24, duration: 1 });
//           }}
//           className="w-7 h-7 bg-black/90 border border-neutral-800 hover:border-neutral-500 text-neutral-400 hover:text-white rounded flex items-center justify-center transition-all"
//           title="Reset Camera Orientation"
//         >
//           <RotateCcw className="w-3.5 h-3.5" />
//         </button>
//       </div>

//       {/* Floating 2D Coordinate Label on node hover */}
//       {hoveredNode && (
//         <div 
//           className="absolute bg-neutral-950/90 border border-neutral-800 px-3 py-2 rounded pointer-events-none z-30 font-mono text-[10px] space-y-0.5"
//           style={{
//             left: `${mousePos2D.x + 15}px`,
//             top: `${mousePos2D.y - 15}px`,
//           }}
//         >
//           <div className="font-bold text-neutral-100">{hoveredNode.name}</div>
//           <div className="text-neutral-400">{hoveredNode.scientificName || hoveredNode.type}</div>
//           <div className="text-[9px] text-emerald-500 mt-1">
//             RA: {hoveredNode.ra.toFixed(2)}h | Dec: {hoveredNode.dec.toFixed(1)}°
//           </div>
//           <div className="text-[9px] text-neutral-500">
//             Click target to calibrate and zoom.
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }









"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Line, Text, Ring } from "@react-three/drei";
import * as THREE from "three";

// Authentic Solar System Data with Moons and Rings
export const CELESTIAL_BODIES = {
  Sun: { id: "Sun", radius: 2.0, distance: 0, speed: 0, color: "#FDB813", moons: [] },
  Mercury: { id: "Mercury", radius: 0.2, distance: 5, speed: 0.08, color: "#8C8C94", moons: [] },
  Venus: { id: "Venus", radius: 0.4, distance: 8, speed: 0.05, color: "#E3BB76", moons: [] },
  Earth: { 
    id: "Earth", radius: 0.45, distance: 11, speed: 0.03, color: "#2B82C9", 
    moons: [{ id: "Luna", radius: 0.1, distance: 1.2, speed: 0.8, color: "#CCCCCC" }] 
  },
  Mars: { 
    id: "Mars", radius: 0.3, distance: 15, speed: 0.02, color: "#C1440E",
    moons: [
      { id: "Phobos", radius: 0.05, distance: 0.6, speed: 1.2, color: "#888888" },
      { id: "Deimos", radius: 0.04, distance: 0.9, speed: 0.9, color: "#999999" }
    ]
  },
  Jupiter: { 
    id: "Jupiter", radius: 1.2, distance: 22, speed: 0.008, color: "#C88B3A",
    moons: [
      { id: "Io", radius: 0.15, distance: 1.8, speed: 0.6, color: "#F4C430" },
      { id: "Europa", radius: 0.12, distance: 2.3, speed: 0.4, color: "#DDDDDD" },
      { id: "Ganymede", radius: 0.18, distance: 2.9, speed: 0.3, color: "#999999" },
      { id: "Callisto", radius: 0.16, distance: 3.5, speed: 0.2, color: "#777777" }
    ]
  },
  Saturn: { 
    id: "Saturn", radius: 1.0, distance: 30, speed: 0.005, color: "#EADD9D", hasRings: true,
    moons: [{ id: "Titan", radius: 0.18, distance: 3.2, speed: 0.3, color: "#D49D42" }]
  },
  Uranus: { id: "Uranus", radius: 0.7, distance: 38, speed: 0.003, color: "#D1E7E7", moons: [] },
  Neptune: { id: "Neptune", radius: 0.68, distance: 45, speed: 0.002, color: "#3E54E8", moons: [] },
};

interface OrbitalNodeProps {
  body: any;
  activeTarget: string | null;
}

function OrbitalNode({ body, activeTarget }: OrbitalNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  
  const isTargeted = activeTarget === body.id || body.moons.some((m: any) => m.id === activeTarget);
  const exactTarget = activeTarget === body.id;

  useFrame((state) => {
    if (groupRef.current && body.distance > 0) {
      const t = state.clock.getElapsedTime() * body.speed;
      groupRef.current.position.x = Math.cos(t) * body.distance;
      groupRef.current.position.z = Math.sin(t) * body.distance;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.002;
    }
  });

  const orbitPoints = [];
  if (body.distance > 0) {
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      orbitPoints.push(new THREE.Vector3(Math.cos(angle) * body.distance, 0, Math.sin(angle) * body.distance));
    }
  }

  return (
    <>
      {body.distance > 0 && <Line points={orbitPoints} color="#333333" lineWidth={1} transparent opacity={0.3} />}
      
      <group ref={groupRef}>
        <mesh ref={planetRef}>
          <sphereGeometry args={[body.radius, 32, 32]} />
          {body.id === "Sun" ? (
            <meshBasicMaterial color={body.color} />
          ) : (
            <meshStandardMaterial color={body.color} roughness={0.8} metalness={0.1} />
          )}
        </mesh>

        {/* Saturn's Rings */}
        {body.hasRings && (
          <mesh rotation={[Math.PI / 1.8, 0, 0]}>
            <ringGeometry args={[body.radius * 1.4, body.radius * 2.2, 64]} />
            <meshStandardMaterial color="#A89F82" side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>
        )}

        <Text
          position={[body.radius + 0.5, 0, 0]}
          fontSize={0.3}
          color={exactTarget ? "#FFFFFF" : "#666666"}
          anchorX="left"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
        >
          {body.id}
        </Text>

        {exactTarget && (
          <mesh>
            <sphereGeometry args={[body.radius * 1.3, 32, 32]} />
            <meshBasicMaterial color="#00FF66" wireframe transparent opacity={0.1} />
          </mesh>
        )}

        {/* Nested Moons Orbiting the Planet */}
        {body.moons.map((moon: any) => (
          <MoonNode key={moon.id} moon={moon} activeTarget={activeTarget} />
        ))}
      </group>
    </>
  );
}

// Sub-component for Moons
function MoonNode({ moon, activeTarget }: { moon: any, activeTarget: string | null }) {
  const moonGroupRef = useRef<THREE.Group>(null);
  const isTargeted = activeTarget === moon.id;

  useFrame((state) => {
    if (moonGroupRef.current) {
      const t = state.clock.getElapsedTime() * moon.speed;
      moonGroupRef.current.position.x = Math.cos(t) * moon.distance;
      moonGroupRef.current.position.z = Math.sin(t) * moon.distance;
    }
  });

  const orbitPoints = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    orbitPoints.push(new THREE.Vector3(Math.cos(angle) * moon.distance, 0, Math.sin(angle) * moon.distance));
  }

  return (
    <group>
      <Line points={orbitPoints} color="#222222" lineWidth={1} transparent opacity={0.3} />
      <group ref={moonGroupRef}>
        <mesh>
          <sphereGeometry args={[moon.radius, 16, 16]} />
          <meshStandardMaterial color={moon.color} roughness={0.9} />
        </mesh>
        <Text
          position={[moon.radius + 0.2, 0, 0]}
          fontSize={0.15}
          color={isTargeted ? "#FFFFFF" : "#555555"}
          anchorX="left"
          anchorY="middle"
        >
          {moon.id}
        </Text>
        {isTargeted && (
          <mesh>
            <sphereGeometry args={[moon.radius * 1.5, 16, 16]} />
            <meshBasicMaterial color="#00FF66" wireframe transparent opacity={0.2} />
          </mesh>
        )}
      </group>
    </group>
  );
}

// Smooth Fly-To Camera Controller
function CameraController({ activeTarget }: { activeTarget: string | null }) {
  const controlsRef = useRef<any>(null);
  const [targetVector] = useState(() => new THREE.Vector3());

  useFrame((state) => {
    if (!controlsRef.current || !activeTarget) return;

    // Search through planets and their moons to find the exact global position
    let foundPosition = new THREE.Vector3(0, 0, 0);
    let targetRadius = 5;

    for (const body of Object.values(CELESTIAL_BODIES)) {
      const bt = state.clock.getElapsedTime() * body.speed;
      const bx = body.distance === 0 ? 0 : Math.cos(bt) * body.distance;
      const bz = body.distance === 0 ? 0 : Math.sin(bt) * body.distance;
      
      if (body.id === activeTarget) {
        foundPosition.set(bx, 0, bz);
        targetRadius = body.radius;
        break;
      }
      
      // Check moons
      const activeMoon = body.moons.find(m => m.id === activeTarget);
      if (activeMoon) {
        const mt = state.clock.getElapsedTime() * activeMoon.speed;
        const mx = Math.cos(mt) * activeMoon.distance;
        const mz = Math.sin(mt) * activeMoon.distance;
        foundPosition.set(bx + mx, 0, bz + mz);
        targetRadius = activeMoon.radius;
        break;
      }
    }

    // Smoothly shift the pivot point of the OrbitControls to the target
    targetVector.lerp(foundPosition, 0.05);
    controlsRef.current.target.copy(targetVector);

    // If the camera is too far out when switching targets, smoothly pull it in
    const dist = state.camera.position.distanceTo(foundPosition);
    if (dist > targetRadius * 15) {
      const idealPos = foundPosition.clone().add(new THREE.Vector3(0, targetRadius * 4, targetRadius * 10));
      state.camera.position.lerp(idealPos, 0.02);
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef} 
      makeDefault 
      enablePan={true} 
      maxPolarAngle={Math.PI / 1.2} 
      minDistance={0.5} 
      maxDistance={150} 
    />
  );
}

export default function CelestialViewport({ activeTarget }: { activeTarget: string | null }) {
  return (
    <div className="w-full h-full absolute inset-0 bg-[#030303]">
      <Canvas camera={{ position: [0, 15, 35], fov: 45 }}>
        <color attach="background" args={["#010101"]} />
        <pointLight position={[0, 0, 0]} intensity={1000} distance={200} decay={2} />
        <ambientLight intensity={0.05} />
        <Stars radius={150} depth={50} count={6000} factor={4} saturation={0} fade speed={0.2} />

        {Object.values(CELESTIAL_BODIES).map((body) => (
          <OrbitalNode key={body.id} body={body} activeTarget={activeTarget} />
        ))}

        <CameraController activeTarget={activeTarget} />
      </Canvas>
    </div>
  );
}