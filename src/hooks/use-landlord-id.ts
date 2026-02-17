"use client";

import { useSearchParams } from "next/navigation";

export function useLandlordId(): string | null {
  const searchParams = useSearchParams();
  return searchParams.get("landlord");
}
