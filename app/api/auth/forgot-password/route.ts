import { requestPasswordReset } from "@/lib/password-recovery";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return requestPasswordReset(req);
}
