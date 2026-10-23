import { establishRecoverySession } from "@/lib/password-recovery";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return establishRecoverySession(req);
}
