import { AppSplash } from "@/components/app/AppSplash";
import { LocationProvider } from "@/lib/location";
import { ProfileProvider } from "@/lib/profile-store";
import { TripProvider } from "@/lib/trip-store";

export const metadata = {
  title: "Mapucoin App",
  alternates: {
    canonical: "https://mapucoin.com/app",
    languages: {
      es: "https://mapucoin.com/app",
      en: "https://mapucoin.com/app",
      pt: "https://mapucoin.com/app",
      fr: "https://mapucoin.com/app",
      it: "https://mapucoin.com/app",
      "x-default": "https://mapucoin.com/app",
    },
  },
  appleWebApp: {
    capable: true,
    title: "Mapucoin",
    statusBarStyle: "black-translucent" as const,
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TripProvider>
      <ProfileProvider>
        <LocationProvider>
          <AppSplash>{children}</AppSplash>
        </LocationProvider>
      </ProfileProvider>
    </TripProvider>
  );
}
