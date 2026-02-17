"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ShaderAnimation = dynamic(
  () =>
    import("@/components/ui/shader-animation").then((mod) => ({
      default: mod.ShaderAnimation,
    })),
  { ssr: false }
);

interface LandingAnimationProps {
  onComplete: () => void;
}

export function LandingAnimation({ onComplete }: LandingAnimationProps) {
  const [showText, setShowText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), 500);
    const fadeTimer = setTimeout(() => setFadeOut(true), 4500);
    const completeTimer = setTimeout(() => onComplete(), 5500);

    return () => {
      clearTimeout(textTimer);
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
      <ShaderAnimation />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h1
          className={`text-center text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tighter text-white transition-all duration-1000 ${
            showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          The future of tourism
          <br />
          is here
        </h1>
      </div>
      <button
        onClick={onComplete}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/60 text-sm hover:text-white transition-colors animate-pulse"
      >
        Click anywhere to continue
      </button>
    </div>
  );
}
