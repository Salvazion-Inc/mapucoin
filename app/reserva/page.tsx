import { cookies } from "next/headers";
import { ReservaClient } from "./reserva-client";
import { readSession, SESSION_COOKIE } from "@/lib/session";

export default async function ReservaPage() {
  const jar = await cookies();
  const session = await readSession(jar.get(SESSION_COOKIE)?.value);
  return (
    <ReservaClient
      initialName={session?.name ?? ""}
      initialEmail={session?.email ?? ""}
    />
  );
}
