export default function PlaceVideo({
  id,
  start,
  title,
}: {
  id: string;
  start?: number;
  title: string;
}) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    iv_load_policy: "3",
  });
  if (start) params.set("start", String(start));

  return (
    <div className="relative aspect-video overflow-hidden rounded-[1.75rem] bg-night shadow-[0_24px_80px_rgba(7,5,4,0.28)]">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
