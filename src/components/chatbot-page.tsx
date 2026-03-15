"use client";

import { useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { LandingAnimation } from "@/components/landing-animation";
import { SlideshowBackground } from "@/components/slideshow-background";

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
        <>
        <SlideshowBackground />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 animate-in fade-in duration-700">
          <Suspense fallback={
            <div className="w-full max-w-2xl mx-auto h-[calc(100vh-2rem)] md:h-[600px] rounded-xl border border-border bg-background/80 backdrop-blur-sm overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-border bg-card">
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                <div className="h-3 w-32 bg-muted rounded animate-pulse mt-1" />
              </div>
              <div className="flex-1 p-4">
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%]">
                  <div className="space-y-2">
                    <div className="h-3 w-56 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          }>
            <Chatbot />
          </Suspense>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="font-medium">Opsis Dalmatia</span>
            <span className="hidden sm:inline">AI &middot; Web &middot; Marketing &middot; Tourism</span>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/opsisdalmatia/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://www.facebook.com/opsisdalmatia" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/opsisdalmatia" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>
        </div>
        </>
      )}
    </main>
  );
}
