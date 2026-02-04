import Image from "next/image";
import { cn } from "./cn";

export default function BrandMark({
  size = 132,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const radius = Math.round(size * 0.35);

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {/* brass aura */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          borderRadius: radius,
          background: "rgba(185,167,122,0.32)",
          filter: "blur(24px)",
        }}
      />
      {/* frame */}
      <div
        className="h-full w-full border bg-[rgba(255,255,255,0.92)] shadow-[0_26px_80px_rgba(0,0,0,0.18)]"
        style={{
          borderRadius: radius,
          borderColor: "rgba(185,167,122,0.55)",
          padding: 10,
        }}
      >
        <Image
          src="/brand/vv-mark.png"
          alt="VV"
          width={Math.round(size * 0.85)}
          height={Math.round(size * 0.85)}
          priority
          className="h-full w-full object-contain opacity-95"
        />
      </div>
    </div>
  );
}
