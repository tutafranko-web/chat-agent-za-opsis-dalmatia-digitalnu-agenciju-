import { Suspense } from "react";
import { ChatbotPage } from "@/components/chatbot-page";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background">
          <div className="relative w-full h-screen" style={{ background: "#000" }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <h1 className="text-center text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tighter text-white">
                The future of tourism
                <br />
                is here
              </h1>
            </div>
          </div>
        </main>
      }
    >
      <ChatbotPage />
    </Suspense>
  );
}
