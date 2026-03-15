"use client"

export function ShaderAnimation() {
  return (
    <div className="w-full h-full absolute inset-0 bg-black overflow-hidden">
      {/* Layer 1: Red/orange diagonal lines moving left */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 3px,
            rgba(255, 60, 40, 0.15) 3px,
            rgba(255, 60, 40, 0.15) 4px
          )`,
          backgroundSize: "200% 200%",
          animation: "shader-move-1 8s linear infinite",
        }}
      />
      {/* Layer 2: Cyan horizontal lines moving up */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 5px,
            rgba(0, 200, 220, 0.12) 5px,
            rgba(0, 200, 220, 0.12) 6px
          )`,
          backgroundSize: "100% 200%",
          animation: "shader-move-2 6s linear infinite",
        }}
      />
      {/* Layer 3: Purple diagonal lines moving right */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            rgba(160, 60, 255, 0.13) 4px,
            rgba(160, 60, 255, 0.13) 5px
          )`,
          backgroundSize: "200% 200%",
          animation: "shader-move-3 10s linear infinite",
        }}
      />
      {/* Layer 4: Warm glow center */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,140,0,0.08) 0%, transparent 70%)",
          animation: "shader-pulse 4s ease-in-out infinite alternate",
        }}
      />
      {/* Layer 5: Vertical thin lines drifting */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 8px,
            rgba(0, 200, 80, 0.08) 8px,
            rgba(0, 200, 80, 0.08) 9px
          )`,
          backgroundSize: "200% 100%",
          animation: "shader-move-1 12s linear infinite reverse",
        }}
      />
    </div>
  )
}
