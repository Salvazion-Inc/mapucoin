import { cookies } from "next/headers";
import { AppSplash } from "@/components/app/AppSplash";
import { AppSessionProvider } from "@/lib/app-session";
import { LocationProvider } from "@/lib/location";
import { ProfileProvider } from "@/lib/profile-store";
import { pageTitle } from "@/lib/seo";
import { readSession, SESSION_COOKIE } from "@/lib/session";
import { TripProvider } from "@/lib/trip-store";

export const metadata = {
  title: pageTitle("Mapucoin App"),
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

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const session = await readSession(jar.get(SESSION_COOKIE)?.value);
  return (
    <TripProvider>
      <ProfileProvider>
        <LocationProvider>
          <AppSessionProvider user={session}>
            <AppSplash>{children}</AppSplash>
          </AppSessionProvider>
        </LocationProvider>
      </ProfileProvider>
    </TripProvider>
  );
}
