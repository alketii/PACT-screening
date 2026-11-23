import { count, desc, sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getDb, schema } from "@/db";
import type { Entry } from "@/db/schema";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { EXPOSURE_OPTIONS, QUESTIONS, SOURCE_OPTIONS } from "@/lib/questions";
import { logout } from "./actions";
import { EntriesTable, type EntryRow } from "./entries-table";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "PACT · Admin", robots: { index: false, follow: false } };

const PAGE_SIZE = 20;

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-ink/60">Duke ngarkuar…</p>}>
      <Admin searchParams={searchParams} />
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
  hour12: false,
});

async function Admin({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  if (!adminConfigured()) {
    return <p className="p-8 text-sm">Vendosni ADMIN_PASSWORD në .env për të aktivizuar panelin.</p>;
  }
  if (!(await isAdmin())) return <LoginForm />;

  const db = getDb();
  const { entries } = schema;

  const [totals] = await db
    .select({
      total: count(),
      fresh: count(sql`case when ${entries.status} = 'new' then 1 end`),
      urgent: count(
        sql`case when ${entries.status} = 'new' and ${entries.flags} @> '[{"level":"urgent"}]'::jsonb then 1 end`,
      ),
    })
    .from(entries);

  const pages = Math.max(1, Math.ceil(totals.total / PAGE_SIZE));
  const requested = Number((await searchParams).page);
  const page = Number.isInteger(requested) ? Math.min(Math.max(requested, 1), pages) : 1;

  const rows = await db
    .select()
    .from(entries)
    .orderBy(desc(entries.createdAt), desc(entries.id))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Regjistrimet</h1>
            <p className="mt-1 text-sm text-ink/60">
              {totals.total} gjithsej · {totals.fresh} të reja
              {totals.urgent > 0 && <span className="font-semibold text-danger"> · {totals.urgent} me përparësi</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Plain link: the route returns a file, not a page. */}
            <a
              href="/admin/export"
              download
              className="rounded-xl bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700"
            >
              Shkarko Excel
            </a>
            <form action={logout}>
              <button type="submit" className="rounded-xl bg-white px-4 py-2 text-sm font-medium shadow-card hover:bg-slate-100">
                Dil
              </button>
            </form>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink/50">
          Shenjat janë vetëm orientuese, të bazuara në përgjigjet e vetë personit. Vendimin e merr ekipi pas bisedës.
        </p>

        {totals.total === 0 ? (
          <p className="mt-12 text-center text-sm text-ink/60">Ende nuk ka regjistrime.</p>
        ) : (
          <div className="mt-5">
            <EntriesTable entries={rows.map(toRow)} />
            {pages > 1 && <Pagination page={page} pages={pages} />}
          </div>
        )}
      </div>
    </div>
  );
}

function Pagination({ page, pages }: { page: number; pages: number }) {
  const link = "rounded-xl bg-white px-4 py-2 text-sm font-medium shadow-card hover:bg-slate-100";
  const disabled = "rounded-xl px-4 py-2 text-sm font-medium text-ink/30";
  return (
    <nav aria-label="Faqet" className="mt-5 flex items-center justify-between">
      {page > 1 ? (
        <Link href={`/admin?page=${page - 1}`} className={link}>
          ← Më të rejat
        </Link>
      ) : (
        <span className={disabled}>← Më të rejat</span>
      )}
      <span className="text-sm tabular-nums text-ink/60">
        Faqja {page} nga {pages}
      </span>
      {page < pages ? (
        <Link href={`/admin?page=${page + 1}`} className={link}>
          Më të vjetrat →
        </Link>
      ) : (
        <span className={disabled}>Më të vjetrat →</span>
      )}
    </nav>
  );
}

function toRow(entry: Entry): EntryRow {
  const a = entry.answers;
  return {
    id: entry.id,
    fullName: entry.fullName,
    age: entry.age,
    phone: entry.phone,
    createdAt: dateFormat.format(entry.createdAt),
    status: entry.status,
    flags: entry.flags,
    answers: QUESTIONS.map((q) => {
      let value: string;
      if (q.id === "exposure") {
        value = a.exposure?.map((v) => EXPOSURE_OPTIONS.find((o) => o.value === v)?.label ?? v).join("; ") || "—";
      } else if (q.id === "source") {
        value = SOURCE_OPTIONS.find((o) => o.value === a.source)?.label ?? "—";
      } else {
        const v = a[q.id];
        value = v === "po" ? "Po" : v === "jo" ? "Jo" : "—";
      }
      return { label: q.short, value };
    }),
  };
}
