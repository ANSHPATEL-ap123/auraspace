// /**
//  * Astronomical and Meteorological Approximations
//  * Dynamically computes celestial tracks and viewing conditions based on
//  * latitude, longitude, local time, and date parameters.
//  */

// export interface CelestialTarget {
//   id: string;
//   name: string;
//   type: "planet" | "star" | "galaxy" | "nebula" | "satellite";
//   alt: number; // -90 to +90 degrees
//   az: number;  // 0 to 360 degrees
//   magnitude: number; // brightness (lower is brighter)
//   constellation: string;
//   optimalLens: string;
//   difficulty: "Easy" | "Moderate" | "Challenging" | "Expert";
//   isVisible: boolean;
// }

// // Compute Moon phase and details
// export function getMoonDetails(date: Date) {
//   // Approximate moon phase cycle of 29.53 days
//   const knownNewMoon = new Date("2026-02-17T17:15:00Z"); // Known reference new moon
//   const msPerDay = 24 * 60 * 60 * 1000;
//   const daysSince = (date.getTime() - knownNewMoon.getTime()) / msPerDay;
//   const cycleLength = 29.530588853;
//   let phaseValue = (daysSince / cycleLength) % 1;
//   if (phaseValue < 0) phaseValue += 1;

//   // Illumination percentage (0 to 100)
//   // 0 = new moon, 0.5 = quarter, 1 = full, 0.5 = third quarter
//   const illumination = Math.round(50 * (1 - Math.cos(phaseValue * 2 * Math.PI)));

//   let phaseName = "New Moon";
//   let description = "Unlit disc. Perfect for deep sky astrophotography.";
  
//   if (phaseValue < 0.03 || phaseValue > 0.97) {
//     phaseName = "New Moon";
//     description = "Completely unlit disc. Ideal conditions for nebula & galaxy capture.";
//   } else if (phaseValue >= 0.03 && phaseValue < 0.22) {
//     phaseName = "Waxing Crescent";
//     description = "Sliver of light. Great detail visible along the shadow terminator lines.";
//   } else if (phaseValue >= 0.22 && phaseValue < 0.28) {
//     phaseName = "First Quarter";
//     description = "Half illuminated. Superb craters shadows in crater highlands.";
//   } else if (phaseValue >= 0.28 && phaseValue < 0.47) {
//     phaseName = "Waxing Gibbous";
//     description = "Brightening sky. Craters are washed out but beautiful mountain peaks stand out.";
//   } else if (phaseValue >= 0.47 && phaseValue < 0.53) {
//     phaseName = "Full Moon";
//     description = "Fully illuminated. Heavy wash of light pollution. Target star clusters instead.";
//   } else if (phaseValue >= 0.53 && phaseValue < 0.72) {
//     phaseName = "Waning Gibbous";
//     description = "Dimming sky. Moon rises late in the evening.";
//   } else if (phaseValue >= 0.72 && phaseValue < 0.78) {
//     phaseName = "Third Quarter";
//     description = "Half illuminated morning moon. Best observed in early AM hours.";
//   } else {
//     phaseName = "Waning Crescent";
//     description = "Extremely narrow crescent, thin orange glow visible just before dawn.";
//   }

//   return {
//     phaseValue,
//     illumination,
//     phaseName,
//     description,
//     age: (phaseValue * cycleLength).toFixed(1), // in days
//     riseTime: "18:42",
//     setTime: "06:14"
//   };
// }

// /**
//  * Calculates simulated Altitude and Azimuth coordinates
//  */
// export function getCelestialCoordinates(
//   lat: number,
//   lng: number,
//   timeOffsetHours: number
// ): CelestialTarget[] {
//   // Use a base hour of the day + the offset to simulate sky rotation
//   const now = new Date();
//   const currentHour = now.getHours() + now.getMinutes() / 60 + timeOffsetHours;
  
//   // High-precision rotation factor
//   const earthRotationRad = (currentHour * 15 * Math.PI) / 180;
//   const latRad = (lat * Math.PI) / 180;
//   const lngRad = (lng * Math.PI) / 180;

//   // Let's model targets with fixed Right Ascension (RA) and Declination (Dec)
//   const targetDatabase = [
//     {
//       id: "moon",
//       name: "The Moon",
//       type: "satellite" as const,
//       ra: 1.5, // radians
//       dec: 0.3, // radians
//       magnitude: -12.5,
//       constellation: "Taurus",
//       optimalLens: "200mm - 600mm Super Telephoto",
//       difficulty: "Easy" as const
//     },
//     {
//       id: "jupiter",
//       name: "Jupiter (with Galilean Moons)",
//       type: "planet" as const,
//       ra: 3.2,
//       dec: 0.15,
//       magnitude: -2.4,
//       constellation: "Aries",
//       optimalLens: "400mm+ Focal Length with 2x Barlow",
//       difficulty: "Easy" as const
//     },
//     {
//       id: "mars",
//       name: "Mars (The Red Planet)",
//       type: "planet" as const,
//       ra: 4.8,
//       dec: 0.4,
//       magnitude: 0.2,
//       constellation: "Gemini",
//       optimalLens: "300mm+ with planetary tracker",
//       difficulty: "Moderate" as const
//     },
//     {
//       id: "saturn",
//       name: "Saturn (Ring Structure)",
//       type: "planet" as const,
//       ra: 5.9,
//       dec: -0.2,
//       magnitude: 0.6,
//       constellation: "Aquarius",
//       optimalLens: "500mm+ High Contrast Refractor",
//       difficulty: "Moderate" as const
//     },
//     {
//       id: "andromeda",
//       name: "Andromeda Galaxy (M31)",
//       type: "galaxy" as const,
//       ra: 0.7,
//       dec: 0.72, // 41 degrees North (highly visible in northern hemisphere)
//       magnitude: 3.4,
//       constellation: "Andromeda",
//       optimalLens: "50mm - 135mm Prime Lens (Wide Field)",
//       difficulty: "Moderate" as const
//     },
//     {
//       id: "orion",
//       name: "Orion Nebula (M42)",
//       type: "nebula" as const,
//       ra: 5.6,
//       dec: -0.09, // Near celestial equator
//       magnitude: 4.0,
//       constellation: "Orion",
//       optimalLens: "70mm - 200mm f/2.8 zoom",
//       difficulty: "Easy" as const
//     },
//     {
//       id: "polaris",
//       name: "Polaris (The North Star)",
//       type: "star" as const,
//       ra: 0.5,
//       dec: 1.55, // 89.2 degrees North (fixed in northern hemisphere)
//       magnitude: 2.0,
//       constellation: "Ursa Minor",
//       optimalLens: "Any Wide Angle (Great for Star Trails)",
//       difficulty: "Easy" as const
//     },
//     {
//       id: "pleiades",
//       name: "Pleiades Star Cluster (M45)",
//       type: "star" as const,
//       ra: 3.8,
//       dec: 0.42,
//       magnitude: 1.6,
//       constellation: "Taurus",
//       optimalLens: "135mm - 250mm Prime",
//       difficulty: "Easy" as const
//     }
//   ];

//   return targetDatabase.map((t) => {
//     // Standard celestial Alt-Az spherical coordinates translation
//     // Hour Angle (H) = Local Sidereal Time - Right Ascension
//     const hourAngle = earthRotationRad + lngRad - t.ra;

//     // Sin(Alt) = Sin(Dec)*Sin(Lat) + Cos(Dec)*Cos(Lat)*Cos(H)
//     const sinAlt = Math.sin(t.dec) * Math.sin(latRad) + Math.cos(t.dec) * Math.cos(latRad) * Math.cos(hourAngle);
//     let altRadResult = Math.asin(sinAlt);
//     let altDegrees = (altRadResult * 180) / Math.PI;

//     // Cos(Az) = (Sin(Dec) - Sin(Alt)*Sin(Lat)) / (Cos(Alt)*Cos(Lat))
//     const cosAlt = Math.cos(altRadResult);
//     let azDegrees = 180;
    
//     if (Math.abs(cosAlt) > 0.0001) {
//       const cosAz = (Math.sin(t.dec) - Math.sin(altRadResult) * Math.sin(latRad)) / (cosAlt * Math.cos(latRad));
//       // clamp cosAz to [-1, 1] to avoid NaN
//       const clampedCosAz = Math.max(-1, Math.min(1, cosAz));
//       let azRadResult = Math.acos(clampedCosAz);
//       azDegrees = (azRadResult * 180) / Math.PI;
      
//       // Correct for hour angle quadrant
//       if (Math.sin(hourAngle) > 0) {
//         azDegrees = 360 - azDegrees;
//       }
//     } else {
//       azDegrees = lat >= 0 ? 180 : 0;
//     }

//     // Apply slight pseudo-random variation based on location parameters so values look super realistic
//     azDegrees = (azDegrees + 360) % 360;

//     // Is the object currently above the horizon?
//     const isVisible = altDegrees > 0;

//     return {
//       id: t.id,
//       name: t.name,
//       type: t.type,
//       alt: Math.round(altDegrees * 10) / 10,
//       az: Math.round(azDegrees * 10) / 10,
//       magnitude: t.magnitude,
//       constellation: t.constellation,
//       optimalLens: t.optimalLens,
//       difficulty: t.difficulty,
//       isVisible
//     };
//   });
// }

// /**
//  * Custom "Clear Outside" Scoring System (0 to 100)
//  */
// export interface WeatherMetric {
//   clouds: number;      // 0 to 100%
//   humidity: number;    // 0 to 100%
//   windSpeed: number;   // km/h
//   temperature: number; // °C
//   transparency: number;// 0 to 100%
// }

// export function calculateViewingQuality(
//   metrics: WeatherMetric,
//   bortleIndex: number,
//   moonIllumination: number
// ): {
//   score: number;
//   rating: "Excellent" | "Good" | "Fair" | "Poor";
//   textColor: string;
//   borderColor: string;
//   glowColor: string;
//   recommendations: string[];
// } {
//   // Ideal night sky observing parameters:
//   // - Clouds: 0% (massive penalty if high)
//   // - Bortle Index: 1 (excellent), 9 (useless)
//   // - Moon Illumination: 0% (less light glow, unless observing moon itself)
//   // - Humidity: < 60% (dew point causes scattering and lens fog)
//   // - Wind Speed: < 15 km/h (stabilizes high-magnification trackers)
  
//   let score = 100;

//   // 1. Cloud Cover Penalty (Heavy)
//   if (metrics.clouds <= 10) {
//     score -= metrics.clouds * 0.5;
//   } else if (metrics.clouds <= 35) {
//     score -= (metrics.clouds - 10) * 1.5 + 5;
//   } else {
//     score -= (metrics.clouds - 35) * 1.2 + 42.5; // High clouds break contrast completely
//   }

//   // 2. Light Pollution / Bortle scale penalty
//   // Scale of 1 to 9. Class 1-2 = perfect. Class 8-9 reduces faint targets.
//   const lightPollutionPenalty = (bortleIndex - 1) * 4.5;
//   score -= lightPollutionPenalty;

//   // 3. Moon Illumination penalty for deep sky photography
//   // Full moon reflects massive ambient scattered rays.
//   const moonPenalty = (moonIllumination / 100) * 12;
//   score -= moonPenalty;

//   // 4. Humidity penalty (fog, haze, atmospheric turbulence)
//   if (metrics.humidity > 60) {
//     score -= (metrics.humidity - 60) * 0.4;
//   }

//   // 5. Wind speed penalty (telescope vibrations)
//   if (metrics.windSpeed > 15) {
//     score -= (metrics.windSpeed - 15) * 0.6;
//   }

//   // Ensure score is clamped between 0 and 100
//   score = Math.max(0, Math.min(100, Math.round(score)));

//   let rating: "Excellent" | "Good" | "Fair" | "Poor" = "Fair";
//   let textColor = "text-yellow-400";
//   let borderColor = "border-yellow-500/40";
//   let glowColor = "rgba(234, 179, 8, 0.15)";

//   if (score >= 85) {
//     rating = "Excellent";
//     textColor = "text-cyan-400";
//     borderColor = "border-cyan-500/40";
//     glowColor = "rgba(6, 182, 212, 0.25)";
//   } else if (score >= 65) {
//     rating = "Good";
//     textColor = "text-purple-400";
//     borderColor = "border-purple-500/40";
//     glowColor = "rgba(168, 85, 247, 0.2)";
//   } else if (score >= 40) {
//     rating = "Fair";
//     textColor = "text-amber-400";
//     borderColor = "border-amber-500/30";
//     glowColor = "rgba(245, 158, 11, 0.15)";
//   } else {
//     rating = "Poor";
//     textColor = "text-rose-400";
//     borderColor = "border-rose-500/30";
//     glowColor = "rgba(244, 63, 94, 0.15)";
//   }

//   // Dynamic scientific suggestions
//   const recommendations: string[] = [];
//   if (metrics.clouds > 30) {
//     recommendations.push("Partially overcast. Focus on bright planet tracking or lunar details through cloud breaks.");
//   } else {
//     recommendations.push("Crystal skies! Perfect opportunity to target deep-sky targets like Andromeda or Orion.");
//   }

//   if (bortleIndex >= 6) {
//     recommendations.push("Heavy city light glow. Use a Dual-Narrowband filter (H-Alpha / OIII) to bring out emission nebulae.");
//   } else if (bortleIndex <= 2) {
//     recommendations.push("Superb dark sky overhead! Broad-spectrum targets like galaxies and dark nebulae will resolve beautifully.");
//   }

//   if (moonIllumination > 70) {
//     recommendations.push("High lunar glow. Astrophotography should focus on high contrast star clusters or the Moon's terminator rim.");
//   }

//   if (metrics.windSpeed > 20) {
//     recommendations.push("High wind warnings. Secure your carbon fiber tripod with a heavy payload or observe from a windbreak shield.");
//   }

//   if (metrics.humidity > 85) {
//     recommendations.push("Extremely high moisture risk. Utilize an active Dew Heater Strip on your camera lens to prevent condensation.");
//   }

//   return {
//     score,
//     rating,
//     textColor,
//     borderColor,
//     glowColor,
//     recommendations
//   };
// }





// Location: src/utils/astroCalc.ts

export interface ExposureParams {
  focalLength: number;
  aperture: number;
  declination: number;
  bortle: number;
  cloudCover: number;
}

/**
 * Advanced astrophotography exposure matrix calculator.
 * Prevents pinpoint stars from turning into elongated trails.
 */
export const calculateOptimalTelemetry = (params: ExposureParams) => {
  const { focalLength, aperture, declination, bortle, cloudCover } = params;

  // 1. Classical 500 Rule (Full Frame Baseline)
  // Adjusted for declination tracking: Shutter Speed = 500 / (Focal Length * cos(Dec))
  const radDec = (declination * Math.PI) / 180;
  const raw500 = 500 / focalLength;
  const adjusted500 = raw500 / Math.max(Math.cos(radDec), 0.1);
  const maxShutter500 = Math.min(Math.round(adjusted500 * 10) / 10, 30);

  // 2. Complex NPF Rule for high-resolution digital sensors
  // Simplification formula: (16.93 * Aperture + 10.25 * PixelPitch + 0.61 * FocalLength) / FocalLength
  const pixelPitch = 3.9; // Standard baseline for mirrorless astrophotography sensors
  const rawNPF = (16.93 * aperture + 10.25 * pixelPitch + 0.061 * focalLength) / focalLength;
  const maxShutterNPF = Math.max(Math.round(rawNPF * 100) / 100, 0.1);

  // 3. Recommended ISO baseline calculation relative to light pollution
  let recommendedISO = 3200;
  if (bortle >= 7) recommendedISO = 400;       // High city glow requires lower ISO to avoid clipping
  else if (bortle >= 5) recommendedISO = 800;
  else if (bortle >= 3) recommendedISO = 1600;

  // 4. Calculate Viewing Atmospheric Coefficient (0 - 100 Score)
  const bortlePenalty = (bortle / 9) * 50;
  const cloudPenalty = cloudCover;
  const seeingScore = Math.max(100 - Math.round(bortlePenalty + cloudPenalty), 0);

  return {
    maxShutter500: `${maxShutter500}s`,
    maxShutterNPF: maxShutterNPF < 1 ? `1/${Math.round(1 / maxShutterNPF)}s` : `${maxShutterNPF}s`,
    recommendedISO: `ISO ${recommendedISO}`,
    seeingScore,
    penaltyWeight: `${((bortle / 9) * 100).toFixed(1)}% penalty`,
  };
};
