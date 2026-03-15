"use client";

const PHOTOS = [
  { src: "/activities/blue-cave.jpg", alt: "Blue Cave" },
  { src: "/activities/island-aerial.jpg", alt: "Island hopping" },
  { src: "/activities/atv-safari.jpg", alt: "ATV safari" },
  { src: "/activities/rafting.jpg", alt: "White water rafting" },
  { src: "/activities/wakeboarding.jpg", alt: "Wakeboarding" },
  { src: "/activities/zipline.jpg", alt: "Zipline adventure" },
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
