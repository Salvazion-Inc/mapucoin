export type PartnerDelivery = {
  preview: boolean;
  store: boolean;
  notify: false;
};

/**
 * Partner applications notify people only by landing in the production queue.
 * Preview and any other non-production deployment skip that write. There is
 * no email, Slack, or webhook channel on this path.
 */
export function partnerDelivery(env: NodeJS.ProcessEnv = process.env): PartnerDelivery {
  const production = env["VERCEL_ENV"] === "production";
  return {
    preview: !production,
    store: production,
    notify: false,
  };
}
