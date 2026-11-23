import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getDb, schema } from "@/db";
import type { Entry } from "@/db/schema";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { EXPOSURE_OPTIONS, QUESTIONS, SOURCE_OPTIONS, type Flag } from "@/lib/questions";
import { logout } from "./actions";
import { DeleteButton, StatusSelect } from "./entry-controls";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "PACT · Admin", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-ink/60">Duke ngarkuar…</p>}>
      <Admin />
    </Suspense>
  );
}

const dateFormat = new Intl.DateTimeFormat("sq-AL", {
  timeZone: "Europe/Belgrade",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const FLAG_STYLE: Record<Flag["level"], string> = {
  urgent: "bg-coral text-white",
  exclusion: "bg-coral/15 text-ink",
  check: "bg-sand text-ink",
};

async function Admin() {
  if (!adminConfigured()) {
    return <p className="p-8 text-sm">Vendosni ADMIN_PASSWORD në .env për të aktivizuar panelin.</p>;
  }
  if (!(await isAdmin())) return <LoginForm />;

  const entries = await getDb().select().from(schema.entries).orderBy(desc(schema.entries.createdAt));
  const urgent = entries.filter((e) => e.status === "new" && e.flags.some((f) => f.level === "urgent")).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-teal-900">Regjistrimet</h1>
          <p className="mt-1 text-sm text-ink/70">
            {entries.length} gjithsej · {entries.filter((e) => e.status === "new").length} të reja
            {urgent > 0 && <span className="font-semibold text-coral"> · {urgent} me përparësi</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Plain link: the route returns a file, not a page. */}
          <a
            href="/admin/export"
            download
            className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
          >
            Shkarko Excel
          </a>
          <form action={logout}>
            <button type="submit" className="rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm hover:bg-sand">
              Dil
            </button>
          </form>
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-sand px-4 py-3 text-xs leading-relaxed text-ink/70">
        Shenjat janë vetëm orientuese, të bazuara në përgjigjet e vetë personit. Vendimin e merr ekipi pas bisedës.
      </p>

      {entries.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink/60">Ende nuk ka regjistrime.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {entries.map((e) => (
            <EntryCard key={e.id} entry={e} />
          ))}
        </ul>
      )}
    </div>
  );
}

function EntryCard({ entry }: { entry: Entry }) {
  return (
    <li className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">
            {entry.fullName} <span className="font-normal text-ink/60">· {entry.age} vjeç</span>
          </p>
          <a href={`tel:${entry.phone.replace(/[^\d+]/g, "")}`} className="font-medium tabular-nums text-teal-700 hover:underline">
            {entry.phone}
          </a>
          <p className="mt-0.5 text-xs text-ink/50">{dateFormat.format(entry.createdAt)}</p>
        </div>
        <StatusSelect id={entry.id} status={entry.status} />
      </div>

      {entry.flags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {entry.flags.map((f) => (
            <li key={f.text} className={`rounded-full px-2.5 py-1 text-xs font-medium ${FLAG_STYLE[f.level]}`}>
              {f.text}
            </li>
          ))}
        </ul>
      )}

      <details className="mt-3">
        <summary className="cursor-pointer text-sm text-teal-700">Përgjigjet</summary>
        <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="flex justify-between gap-3 border-b border-ink/5 py-1">
              <dt className="text-ink/70">{q.short}</dt>
              <dd className="text-right font-medium">{formatAnswer(entry, q.id)}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex justify-end">
          <DeleteButton id={entry.id} />
        </div>
      </details>
    </li>
  );
}

function formatAnswer(entry: Entry, id: (typeof QUESTIONS)[number]["id"]): string {
  const a = entry.answers;
  if (id === "exposure") {
    return a.exposure?.map((v) => EXPOSURE_OPTIONS.find((o) => o.value === v)?.label ?? v).join("; ") || "—";
  }
  if (id === "source") return SOURCE_OPTIONS.find((o) => o.value === a.source)?.label ?? "—";
  const v = a[id];
  return v === "po" ? "Po" : v === "jo" ? "Jo" : "—";
}
