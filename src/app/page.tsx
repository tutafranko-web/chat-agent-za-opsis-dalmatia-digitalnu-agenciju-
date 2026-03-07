import { Suspense } from "react";
import { ChatbotPage } from "@/components/chatbot-page";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ChatbotPage />
    </Suspense>
  );
}
