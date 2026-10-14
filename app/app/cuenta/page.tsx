import { MapucoinApp } from "@/components/app/MapucoinApp";
import { readPremiumKeyEnabled } from "@/lib/salvazion-premium";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <MapucoinApp tab="cuenta" premiumKeyEnabled={readPremiumKeyEnabled()} />
  );
}
