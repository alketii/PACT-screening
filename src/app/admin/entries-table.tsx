"use client";

import { useEffect, useRef, useState } from "react";
import type { EntryStatus } from "@/db/schema";
import type { Flag } from "@/lib/questions";
import { DeleteButton, StatusSelect } from "./entry-controls";
import { STATUS_LABELS } from "./status-labels";

export interface EntryRow {
  id: string;
  fullName: string;
  age: number;
  phone: string;
  createdAt: string;
  status: EntryStatus;
  flags: Flag[];
  answers: { label: string; value: string }[];
}

const STATUS_STYLE: Record<EntryStatus, string> = {
  new: "bg-accent-50 text-accent-700",
  contacted: "bg-amber-50 text-amber-800",
  scheduled: "bg-emerald-50 text-emerald-800",
  declined: "bg-slate-100 text-slate-600",
  unsuitable: "bg-slate-100 text-slate-600",
};

const FLAG_STYLE: Record<Flag["level"], string> = {
  urgent: "bg-danger text-white",
  exclusion: "bg-red-50 text-red-800",
  check: "bg-slate-100 text-slate-700",
};

export function EntriesTable({ entries }: { entries: EntryRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Looked up from the latest props, so the dialog reflects status changes.
  const open = entries.find((e) => e.id === openId) ?? null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-5 py-3">Emri</th>
              <th className="hidden px-3 py-3 sm:table-cell">Mosha</th>
              <th className="hidden px-3 py-3 md:table-cell">Telefoni</th>
              <th className="hidden px-3 py-3 lg:table-cell">Data</th>
              <th className="px-3 py-3">Shenjat</th>
              <th className="px-5 py-3 text-right">Statusi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map((e) => {
              const urgent = e.flags.some((f) => f.level === "urgent");
              const others = e.flags.filter((f) => f.level !== "urgent").length;
              return (
                <tr key={e.id} onClick={() => setOpenId(e.id)} className="cursor-pointer transition hover:bg-accent-50/60">
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      className="text-left font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
                    >
                      {e.fullName}
                    </button>
                  </td>
                  <td className="hidden px-3 py-3.5 tabular-nums text-ink/70 sm:table-cell">{e.age}</td>
                  <td className="hidden px-3 py-3.5 tabular-nums text-ink/70 md:table-cell">{e.phone}</td>
                  <td className="hidden whitespace-nowrap px-3 py-3.5 text-ink/50 lg:table-cell">{e.createdAt}</td>
                  <td className="px-3 py-3.5">
                    <span className="flex flex-wrap gap-1.5">
                      {urgent && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${FLAG_STYLE.urgent}`}>
                          Përparësi
                        </span>
                      )}
                      {others > 0 && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${FLAG_STYLE.check}`}>
                          {others} {others === 1 ? "shenjë" : "shenja"}
                        </span>
                      )}
                      {e.flags.length === 0 && <span className="text-ink/30">—</span>}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[e.status]}`}
                    >
                      {STATUS_LABELS[e.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpenId(null)}
        onClick={(e) => {
          // A click on the backdrop lands on the dialog element itself.
          if (e.target === e.currentTarget) setOpenId(null);
        }}
        aria-labelledby="entry-title"
        className="m-auto w-[min(40rem,calc(100vw-2rem))] rounded-3xl border-0 bg-white p-0 text-ink shadow-2xl"
      >
        {open && (
          <div className="max-h-[85dvh] overflow-y-auto p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="entry-title" className="text-2xl font-bold tracking-tight">
                  {open.fullName}
                </h2>
                <p className="mt-0.5 text-sm text-ink/60">
                  {open.age} vjeç · {open.createdAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                aria-label="Mbyll"
                className="-mr-2 -mt-1 rounded-full p-2 text-ink/50 hover:bg-slate-100"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="m4 4 10 10M14 4 4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
              <a
                href={`tel:${open.phone.replace(/[^\d+]/g, "")}`}
                className="text-lg font-semibold tabular-nums text-accent-700 hover:underline"
              >
                {open.phone}
              </a>
              <StatusSelect key={open.id} id={open.id} status={open.status} />
            </div>

            {open.flags.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {open.flags.map((f) => (
                  <li key={f.text} className={`rounded-full px-2.5 py-1 text-xs font-medium ${FLAG_STYLE[f.level]}`}>
                    {f.text}
                  </li>
                ))}
              </ul>
            )}

            <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink/50">Përgjigjet</h3>
            <dl className="mt-2 text-sm">
              {open.answers.map((a) => (
                <div key={a.label} className="flex justify-between gap-4 border-b border-slate-100 py-2">
                  <dt className="text-ink/65">{a.label}</dt>
                  <dd className="text-right font-semibold">{a.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex justify-end">
              <DeleteButton key={open.id} id={open.id} onDeleted={() => setOpenId(null)} />
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
