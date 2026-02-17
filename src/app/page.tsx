"use client";

import { useState, useCallback, Suspense } from "react";
import { LandingAnimation } from "@/components/landing-animation";
import { Chatbot } from "@/components/chatbot";

function ChatbotPage() {
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

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ChatbotPage />
    </Suspense>
  );
}
