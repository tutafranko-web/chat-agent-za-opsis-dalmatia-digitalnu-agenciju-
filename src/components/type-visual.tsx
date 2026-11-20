import Image from "next/image";
import {
  Anchor, ArrowDown, Beer, Bike, Bus, Cable, Camera, Car, ChefHat, Crown, Dice5, Film, Fish, Gem, House, Landmark,
  Leaf, Martini, Mountain, Music, Plane, Sailboat, Ship, Sparkles, Sunset, Target, TreePalm, Trees, Truck, Waves, Wind,
  Wine, Zap, type LucideIcon,
} from "lucide-react";
import { getType, GROUPS, type CategoryKey } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  waves: Waves, mountain: Mountain, landmark: Landmark, music: Music, car: Car, ship: Ship, gem: Gem, sailboat: Sailboat,
  anchor: Anchor, fish: Fish, wind: Wind, zap: Zap, sunset: Sunset, cable: Cable, plane: Plane, "arrow-down": ArrowDown,
  truck: Truck, target: Target, wine: Wine, trees: Trees, leaf: Leaf, "chef-hat": ChefHat, crown: Crown, camera: Camera,
  home: House, sparkles: Sparkles, beer: Beer, martini: Martini, dice: Dice5, palmtree: TreePalm, film: Film, bus: Bus, bike: Bike,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = ICONS[name] ?? Sparkles;
  return <C aria-hidden className={className} />;
}

const GRADIENTS: Record<CategoryKey, string> = {
  nautical: "from-[#0b6e6d] via-[#12505f] to-[#0e1a22]",
  adrenaline: "from-[#c46a2b] via-[#7a3f22] to-[#0e1a22]",
  land: "from-[#8a6d3b] via-[#4e4630] to-[#0e1a22]",
  nightlife: "from-[#5b3a8c] via-[#2d2350] to-[#0e1a22]",
  transport: "from-[#2f5d7a] via-[#1f3b4d] to-[#0e1a22]",
};

/** Focal points so the interesting part of each photo stays in frame. */
const FOCUS: Record<string, string> = {
  "/activities/blue-cave.jpg": "50% 80%",
  "/activities/island-aerial.jpg": "50% 60%",
};

/** Photo if we have one, otherwise a branded poster (gradient + icon). */
export function OfferVisual({
  typeKey, image, className, sizes = "(max-width: 640px) 90vw, 320px", priority = false,
}: { typeKey: string; image: string | null; className?: string; sizes?: string; priority?: boolean }) {
  const t = getType(typeKey);
  const src = image ?? t?.image ?? (t?.group ? GROUPS[t.group]?.image : undefined) ?? null;
  if (src) {
    const external = /^https:\/\//.test(src);
    return (
      <div className={cn("relative overflow-hidden bg-ink-3", className)}>
        <Image src={src} alt="" fill sizes={sizes} priority={priority} unoptimized={external} className="object-cover" style={{ objectPosition: FOCUS[src] ?? "50% 50%" }} />
      </div>
    );
  }
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden bg-gradient-to-br", GRADIENTS[t?.category ?? "nautical"], className)}>
      <Icon name={t?.icon ?? "sparkles"} className="size-12 text-stone/85" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />
    </div>
  );
}
