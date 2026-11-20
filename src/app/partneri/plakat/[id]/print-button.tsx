"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-dark min-h-11 px-4 text-[14px]">
      <Printer className="size-4" aria-hidden /> Ispis · Print
    </button>
  );
}
