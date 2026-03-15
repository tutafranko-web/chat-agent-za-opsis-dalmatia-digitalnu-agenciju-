"use client";

import { useSearchParams } from "next/navigation";

export function useLocation(): string | null {
  const searchParams = useSearchParams();
  return searchParams.get("location");
}
