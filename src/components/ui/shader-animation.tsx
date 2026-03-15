"use client"

function LineLayer({
  angle,
  color,
  gap,
  speed,
  direction,
}: {
  angle: string;
  color: string;
  gap: number;
  speed: number;
  direction: "up" | "down" | "left" | "right";
}) {
  const translate = {
    up: `translateY(-50%)`,
    down: `translateY(50%)`,
    left: `translateX(-50%)`,
    right: `translateX(50%)`,
  }[direction];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute will-change-transform"
        style={{
          inset: "-100%",
          background: `repeating-linear-gradient(${angle}, transparent, transparent ${gap}px, ${color} ${gap}px, ${color} ${gap + 1.5}px)`,
          animation: `shader-drift ${speed}s linear infinite`,
          ["--shader-translate" as string]: translate,
        }}
      />
    </div>
  );
}

export function ShaderAnimation() {
  return (
    <div className="w-full h-full absolute inset-0 bg-black overflow-hidden">
      <LineLayer angle="-45deg" color="rgba(255, 50, 30, 0.35)" gap={6} speed={8} direction="left" />
      <LineLayer angle="0deg" color="rgba(0, 180, 220, 0.3)" gap={8} speed={6} direction="up" />
      <LineLayer angle="45deg" color="rgba(160, 50, 255, 0.3)" gap={7} speed={10} direction="right" />
      <LineLayer angle="90deg" color="rgba(0, 200, 80, 0.2)" gap={10} speed={12} direction="down" />
      {/* Center glow */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,140,0,0.15) 0%, transparent 60%)",
          animation: "shader-pulse 3s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}
