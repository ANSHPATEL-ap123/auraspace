"use client";

import { useState } from "react";

export function useSensors() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const startTracking = async () => {
    setError(null);

    // 1. Request GPS Location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => setError(`Location access denied: ${err.message}`)
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }

    // 2. Request Compass Heading (Device Orientation)
    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      // iOS 13+ requires explicit permission for device orientation
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
            setIsTracking(true);
          } else {
            setError("Compass permission denied.");
          }
        } catch (err) {
          setError("Error requesting compass permission.");
        }
      } else {
        // Non-iOS devices
        window.addEventListener("deviceorientation", handleOrientation);
        setIsTracking(true);
      }
    } else {
      setError("Device orientation not supported on this device.");
    }
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    // webkitCompassHeading is for iOS, alpha is for Android
    let compassHeading = (event as any).webkitCompassHeading || Math.abs(event.alpha! - 360);
    setHeading(compassHeading);
  };

  const stopTracking = () => {
    window.removeEventListener("deviceorientation", handleOrientation);
    setIsTracking(false);
  };

  return { location, heading, error, isTracking, startTracking, stopTracking };
}