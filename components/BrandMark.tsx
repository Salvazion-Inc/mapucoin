import Image from "next/image";

export default function BrandMark({
  size = 44,
  priority = false,
  className = "",
}: {
  size?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.28)] ${className}`}
      style={{ width: size, height: size, clipPath: "circle(50%)" }}
    >
      <Image
        src="/logo-mark.png"
        alt="Mapucoin"
        width={size}
        height={size}
        priority={priority}
        className="h-full w-full rounded-full bg-black object-cover"
      />
    </span>
  );
}
