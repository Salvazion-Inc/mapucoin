import { inspectRecoveryRequest, updateRecoveredPassword } from "@/lib/password-recovery";

export const runtime = "nodejs";

export async function GET(req: Request) {
  return inspectRecoveryRequest(req);
}

export async function POST(req: Request) {
  return updateRecoveredPassword(req);
}
