import { getPartnerById, syncStripeAccount } from "@/lib/partner-store";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase";
import ReturnView from "./return-view";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ id?: string }> };

async function syncFromStripe(id: string) {
  if (!stripeConfigured()) return;
  const db = getSupabase();
  if (!db) return;
  const partner = await getPartnerById(db, id);
  if (!partner?.stripe_account_id) return;
  const account = await getStripe().accounts.retrieve(partner.stripe_account_id);
  await syncStripeAccount(account);
}

export default async function PartnerOnboardReturnPage({ searchParams }: Props) {
  const { id } = await searchParams;
  if (id) {
    try {
      await syncFromStripe(id);
    } catch {
      /* webhook still catches account.updated */
    }
  }
  return <ReturnView />;
}
