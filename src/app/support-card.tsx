import { SUPPORT_CONTACTS } from "@/config/site";

export function SupportCard() {
  return (
    <div className="rounded-2xl border border-teal-600/20 bg-white p-5 text-left">
      <p className="font-display text-xl text-teal-900">Nuk jeni vetëm.</p>
      <p className="mt-2 text-sm leading-relaxed text-ink/80">
        Faleminderit që na e thatë. Nëse keni mendime për t’i bërë keq vetes, ju lutemi flisni me dikë tani. Ndihma
        ekziston.
      </p>
      <ul className="mt-4 space-y-2">
        {SUPPORT_CONTACTS.map((c) => (
          <li key={c.phone}>
            <a
              href={`tel:${c.phone}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-sand px-4 py-3 hover:bg-sand/70"
            >
              <span>
                <span className="block text-sm font-semibold">{c.name}</span>
                <span className="block text-xs text-ink/70">{c.detail}</span>
              </span>
              <span className="text-lg font-semibold tabular-nums text-teal-700">{c.phone}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
