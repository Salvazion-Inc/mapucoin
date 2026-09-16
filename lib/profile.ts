import { readSignedValue, signValue, type SessionUser } from "./session";

export const PROFILE_COOKIE = "mapucoin_profiles";
const DAY = 60 * 60 * 24;

export const PROFILE_ROLES = ["traveler", "partner"] as const;
export type ProfileRole = (typeof PROFILE_ROLES)[number];

export type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  role: ProfileRole;
  instagram: string;
  city: string;
  cityLat: number | null;
  cityLng: number | null;
};

export function emptyProfile(user: SessionUser): UserProfile {
  return {
    fullName: user.name || "",
    email: user.email || "",
    phone: "",
    role: "traveler",
    instagram: "",
    city: "",
    cityLat: null,
    cityLng: null,
  };
}

export function parseRole(value: unknown): ProfileRole {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "partner" || raw === "owner" || raw === "captain") return "partner";
  return "traveler";
}

export function dbRole(role: ProfileRole) {
  return role === "partner" ? "owner" : "client";
}

export function parseInstagram(value: string): string | "invalid" {
  const raw = value.trim();
  if (!raw) return "";
  const fromUrl = raw.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
  let handle = (fromUrl?.[1] || raw).replace(/^@+/, "");
  handle = handle.replace(/[/?#].*$/, "");
  if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) return "invalid";
  return handle;
}

export function instagramUrl(handle: string) {
  return `https://www.instagram.com/${handle}/`;
}

export function hasContact(profile: UserProfile | null | undefined) {
  return Boolean(profile?.fullName?.trim() && profile?.email?.includes("@"));
}

export function sanitizeProfile(
  input: Partial<UserProfile> | null | undefined,
  fallback: UserProfile,
): UserProfile {
  const email = String(input?.email ?? fallback.email)
    .trim()
    .toLowerCase();
  const lat = input?.cityLat ?? fallback.cityLat;
  const lng = input?.cityLng ?? fallback.cityLng;
  const instagram = parseInstagram(
    String(input?.instagram ?? fallback.instagram),
  );
  return {
    fullName: String(input?.fullName ?? fallback.fullName).trim(),
    email,
    phone: String(input?.phone ?? fallback.phone).trim(),
    role: parseRole(input?.role ?? fallback.role),
    instagram: instagram === "invalid" ? fallback.instagram : instagram,
    city: String(input?.city ?? fallback.city).trim(),
    cityLat: typeof lat === "number" && Number.isFinite(lat) ? lat : null,
    cityLng: typeof lng === "number" && Number.isFinite(lng) ? lng : null,
  };
}

export async function readProfileMap(
  token: string | undefined | null,
): Promise<Record<string, UserProfile>> {
  const raw = await readSignedValue(token);
  if (!raw) return {};
  try {
    const data = JSON.parse(raw) as { profiles?: Record<string, UserProfile> };
    if (!data?.profiles || typeof data.profiles !== "object") return {};
    return data.profiles;
  } catch {
    return {};
  }
}

export async function signProfileMap(profiles: Record<string, UserProfile>) {
  return signValue(JSON.stringify({ profiles }));
}

export function profileCookie(token: string) {
  return `${PROFILE_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${400 * DAY}`;
}

export function publicProfile(profile: UserProfile): UserProfile {
  return { ...profile };
}
