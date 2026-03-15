"use client";

import Image from "next/image";

const LEFT_PHOTOS = [
  { src: "/activities/blue-cave.jpg", alt: "Blue Cave" },
  { src: "/activities/atv-safari.jpg", alt: "ATV safari" },
  { src: "/activities/wakeboarding.jpg", alt: "Wakeboarding" },
];

const RIGHT_PHOTOS = [
  { src: "/activities/island-aerial.jpg", alt: "Island hopping" },
  { src: "/activities/rafting.jpg", alt: "White water rafting" },
  { src: "/activities/zipline.jpg", alt: "Zipline adventure" },
];

function VerticalColumn({
  photos,
  direction,
  side,
}: {
  photos: { src: string; alt: string }[];
  direction: "up" | "down";
  side: "left" | "right";
}) {
  const doubled = [...photos, ...photos];

  return (
    <div
      className={`absolute top-0 bottom-0 overflow-hidden hidden md:block ${
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{ width: "calc((100vw - 42rem) / 2)" }}
    >
      <div
        className="flex flex-col will-change-transform"
        style={{
          animation: `slide-${direction} 30s linear infinite`,
        }}
      >
        {doubled.map((photo, i) => (
          <div key={i} className="relative w-full flex-shrink-0" style={{ height: "50vh" }}>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 768px) 25vw, 0px"
              className="object-cover"
              quality={75}
              priority={i < photos.length}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SlideshowBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <VerticalColumn photos={LEFT_PHOTOS} direction="up" side="left" />
      <VerticalColumn photos={RIGHT_PHOTOS} direction="down" side="right" />
    </div>
  );
}
