import type { Metadata } from "next";
import { Quiz } from "@/components/quiz";

export const metadata: Metadata = {
  title: "Activity quiz",
  description: "Nine quick questions and we pick five experiences in Split & Dalmatia that suit you.",
};

export default function QuizPage() {
  return <Quiz />;
}
