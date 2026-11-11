import HomePage from "@/components/HomePage";
import JsonLd from "@/components/JsonLd";
import { partnerApplicationV2Enabled } from "@/lib/partner-application";

export default function Page() {
  return (
    <>
      <JsonLd />
      <HomePage partnerApplicationV2={partnerApplicationV2Enabled()} />
    </>
  );
}
