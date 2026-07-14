
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
