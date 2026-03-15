"use client";

const PHOTOS = [
  { src: "/activities/blue-cave.svg", alt: "Blue Cave" },
  { src: "/activities/island-aerial.svg", alt: "Island hopping" },
  { src: "/activities/atv-safari.svg", alt: "ATV safari" },
  { src: "/activities/rafting.svg", alt: "White water rafting" },
  { src: "/activities/wakeboarding.svg", alt: "Wakeboarding" },
  { src: "/activities/zipline.svg", alt: "Zipline adventure" },
];

export function SlideshowBackground() {
  // Duplicate photos for seamless infinite scroll.
  // translateX(-50%) brings us back to the start of the second copy = perfect loop.
  const doubled = [...PHOTOS, ...PHOTOS];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Scrolling photo strip */}
      <div
        className="flex h-full will-change-transform"
        style={{ animation: "slideshow-scroll 60s linear infinite" }}
      >
        {doubled.map((photo, i) => (
          <img
            key={i}
            src={photo.src}
            alt={photo.alt}
            className="h-full flex-shrink-0 object-cover"
            style={{ width: "50vw" }}
            loading={i < PHOTOS.length ? "eager" : "lazy"}
          />
        ))}
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />
    </div>
  );
}
