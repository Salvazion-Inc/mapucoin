import {
  activities,
  capsules,
  destinations,
  gastronomy,
  landscapes,
} from "@/lib/catalog";
import { nationalParks } from "@/lib/parks";

export const runtime = "nodejs";

const label = new Map(landscapes.map((item) => [item.id, item.label]));

/**
 * Public catalog counts and capsule tariffs.
 * No partner applications, no account data.
 */
export function GET() {
  return Response.json({
    capsules: capsules.map((item) => ({
      name: item.name,
      place: item.city,
      lands: (item.landscapes || []).map((id) => label.get(id) || id),
      price: item.priceFromCLP,
      guests: item.capacity || 2,
    })),
    destinations: destinations.length,
    parks: nationalParks.length,
    gastronomy: gastronomy.length,
    activities: activities.length,
  });
}
