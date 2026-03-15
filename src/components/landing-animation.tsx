"use client";

import { useEffect, useState } from "react";
import { ShaderAnimation } from "@/components/ui/shader-animation";

interface LandingAnimationProps {
  onComplete: () => void;
}

export function LandingAnimation({ onComplete }: LandingAnimationProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Skip animation on repeat visits
    if (sessionStorage.getItem("opsis-animation-seen")) {
      onComplete();
      return;
    }
    sessionStorage.setItem("opsis-animation-seen", "1");

    // Play for 4 seconds, then fade out over 1 second
    const fadeTimer = setTimeout(() => setFadeOut(true), 4000);
    const completeTimer = setTimeout(() => onComplete(), 5000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`relative w-full h-screen transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <ShaderAnimation />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h1
          className="text-center text-3xl sm:text-5xl md:text-7xl font-semibold tracking-tighter text-white"
          style={{ animation: "text-appear 1000ms 300ms ease both" }}
        >
          Welcome to Opsis Dalmatia
          <br />
          tourist agency
        </h1>
      </div>
    </div>
  );
}
