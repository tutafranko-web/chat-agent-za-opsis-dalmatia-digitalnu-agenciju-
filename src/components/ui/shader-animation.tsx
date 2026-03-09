"use client"

interface ShaderAnimationProps {
  stopped?: boolean
}

const rings = [
  { color: "rgba(255,60,60,0.7)", delay: "0s" },
  { color: "rgba(0,220,220,0.7)", delay: "0.5s" },
  { color: "rgba(160,60,255,0.7)", delay: "1.0s" },
  { color: "rgba(255,140,0,0.7)", delay: "1.5s" },
  { color: "rgba(0,200,80,0.7)", delay: "2.0s" },
  { color: "rgba(220,220,0,0.7)", delay: "2.5s" },
]

export function ShaderAnimation({ stopped }: ShaderAnimationProps) {
  return (
    <div
      className="w-full h-screen"
      style={{ background: "#000", overflow: "hidden", position: "relative" }}
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ring-expand {
          0%   { transform: scale(0.2); opacity: 0; }
          15%  { opacity: 1; }
          80%  { opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
      {rings.map((ring, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            margin: "auto",
            width: "60vmin",
            height: "60vmin",
            borderRadius: "50%",
            background: `radial-gradient(circle, transparent 35%, ${ring.color} 50%, transparent 65%)`,
            animation: "ring-expand 3s ease-out infinite",
            animationDelay: ring.delay,
            animationPlayState: stopped ? "paused" : "running",
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  )
}
