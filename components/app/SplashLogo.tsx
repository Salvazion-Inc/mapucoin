export function SplashLogo() {
  return (
    <div className="app-splash-logo">
      <span className="app-splash-logo-stage">
        <span className="app-splash-logo-halo" aria-hidden />
        <span className="app-splash-logo-mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="" draggable={false} />
        </span>
      </span>
      <p>MAPUCOIN</p>
    </div>
  );
}
