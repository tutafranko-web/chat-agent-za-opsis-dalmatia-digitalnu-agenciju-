/** Types shared between server and browser (no server-only imports here). */
import type { CategoryKey } from "./taxonomy";

export type Lang = "en" | "hr";

export interface PublicOffer {
  id: string;
  type_key: string;
  category: CategoryKey;
  title: string;
  description: string;
  duration: string;
  meeting_point: string;
  city: string;
  operator_name: string;
  price_adult: number;
  price_child: number | null;
  child_policy: "adults_only" | "free" | "price" | "half";
  image: string | null;
  gallery_url: string | null;
  demo: boolean;
  featured: boolean;
}

export interface DraftView {
  token: string;
  offer: Pick<PublicOffer, "id" | "title" | "operator_name" | "city" | "meeting_point" | "duration" | "demo" | "image" | "type_key" | "child_policy">;
  date: string;
  adults: number;
  children: number;
  price_adult: number;
  price_child: number;
  total: number;
  expires_at: number;
}

export type QuoteError =
  | { code: "not_found" }
  | { code: "invalid_date" | "too_soon" | "too_far"; earliest: string; latest: string }
  | { code: "adults_min" | "too_many" | "adults_only" }
  | { code: "blackout" | "full"; alternatives: string[]; spotsLeft?: number };

export type UIBlock =
  | { type: "text"; text: string }
  | { type: "cards"; offers: PublicOffer[] }
  | { type: "booking"; draft: DraftView }
  | { type: "notice"; text: string; tone?: "info" | "warn" };

export interface ChatResponse {
  ok: boolean;
  blocks: UIBlock[];
  state: string | null;
  remaining: number;
  reset?: boolean;
  code?: string;
}
