export function ProfileAvatar({
  name,
  size = 36,
}: {
  name: string;
  size?: number;
}) {
  const initial = (name || "M").trim().charAt(0).toUpperCase() || "M";
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full bg-gold font-bold text-night"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden
    >
      {initial}
    </span>
  );
}
