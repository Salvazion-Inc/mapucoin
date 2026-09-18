import { SplashLogo } from "@/components/app/SplashLogo";

export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[100] isolate flex items-center justify-center bg-night"
      role="status"
      aria-label="Mapucoin"
    >
      <SplashLogo />
    </div>
  );
}
