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

    const fadeTimer = setTimeout(() => setFadeOut(true), 500);
    const completeTimer = setTimeout(() => onComplete(), 1500);
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
      onClick={onComplete}
    >
      <ShaderAnimation stopped={fadeOut} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h1
          className="text-center text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tighter text-white"
          style={{ animation: "text-appear 1000ms 100ms ease both" }}
        >
          The future of tourism
          <br />
          is here
        </h1>
      </div>
      <button
        onClick={onComplete}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/60 text-sm hover:text-white transition-colors animate-pulse"
        aria-label="Skip animation"
      >
        Click anywhere to continue
      </button>
    </div>
  );
}
