"use client";

import { useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { LandingAnimation } from "@/components/landing-animation";

const Chatbot = dynamic(
  () => import("@/components/chatbot").then((m) => ({ default: m.Chatbot })),
  { ssr: false }
);

export function ChatbotPage() {
  const [phase, setPhase] = useState<"animation" | "chat">("animation");

  const handleAnimationComplete = useCallback(() => {
    setPhase("chat");
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
