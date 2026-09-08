import { privacy } from "@/lib/legal";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidad" };

export default function PrivacidadPage() {
  return (
    <main className="page-pad mx-auto max-w-3xl px-5 pb-24">
      <h1 className="font-display text-4xl font-bold text-sand">
        {privacy.title}
      </h1>
      <p className="mt-6 text-sand/80">{privacy.intro}</p>
      {privacy.sections.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="text-xl font-bold text-gold">{s.heading}</h2>
          <p className="mt-3 leading-relaxed text-sand/80">{s.body}</p>
        </section>
      ))}
    </main>
  );
}
