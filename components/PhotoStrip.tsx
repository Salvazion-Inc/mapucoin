import Image from "next/image";

export default function PhotoStrip({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  if (!images.length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {images.map((src, i) => (
        <div
          key={src}
          className="relative h-40 overflow-hidden rounded-2xl sm:h-48"
        >
          <Image
            src={src}
            alt={`${alt} ${i + 1}`}
            fill
            className="object-cover transition duration-700 hover:scale-105"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        </div>
      ))}
    </div>
  );
}
