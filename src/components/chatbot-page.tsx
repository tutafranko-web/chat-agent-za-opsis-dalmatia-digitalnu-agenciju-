"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { LandingAnimation } from "@/components/landing-animation";

// Split Chatbot into a separate chunk — not needed for first 3 seconds
const Chatbot = dynamic(
  () => import("@/components/chatbot").then((m) => ({ default: m.Chatbot })),
  { ssr: false }
);

export function ChatbotPage() {
  const [phase, setPhase] = useState<"animation" | "chat">("animation");

  const handleAnimationComplete = useCallback(() => {
    setPhase("chat");
  }, []);

  // Preload Chatbot chunk in background during animation so it's ready instantly
  useEffect(() => {
    import("@/components/chatbot");
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {phase === "animation" && (
        <LandingAnimation onComplete={handleAnimationComplete} />
      )}
      {phase === "chat" && (
        <div className="flex items-center justify-center min-h-screen p-4 animate-in fade-in duration-700">
          <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
            <Chatbot />
          </Suspense>
        </div>
      )}
    </main>
  );
}
