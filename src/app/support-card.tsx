import { SUPPORT_CONTACTS } from "@/config/site";

export function SupportCard() {
  return (
    <div className="rounded-3xl bg-white p-6 text-left shadow-card">
      <p className="text-xl font-semibold tracking-tight">Nuk jeni vetëm.</p>
      <p className="mt-2 text-sm leading-relaxed text-ink/70">
        Faleminderit që na e thatë. Nëse keni mendime për t’i bërë keq vetes, ju lutemi flisni me dikë tani. Ndihma
        ekziston.
      </p>
      <ul className="mt-4 space-y-2">
        {SUPPORT_CONTACTS.map((c) => (
          <li key={c.phone}>
            <a
              href={`tel:${c.phone}`}
              className="flex items-center justify-between gap-3 rounded-2xl bg-accent-50 px-4 py-3 transition hover:bg-accent-100"
            >
              <span>
                <span className="block text-sm font-semibold">{c.name}</span>
                <span className="block text-xs text-ink/60">{c.detail}</span>
              </span>
              <span className="text-lg font-semibold tabular-nums text-accent-700">{c.phone}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
