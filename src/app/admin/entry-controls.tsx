"use client";

import { useState, useTransition } from "react";
import type { EntryStatus } from "@/db/schema";
import { deleteEntry, setStatus } from "./actions";
import { STATUS_LABELS } from "./status-labels";

export function StatusSelect({ id, status }: { id: string; status: EntryStatus }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      aria-label="Statusi"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value;
        startTransition(() => setStatus(id, value));
      }}
      className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent-600 disabled:opacity-50"
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function DeleteButton({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="text-sm text-ink/50 hover:text-danger">
        Fshi regjistrimin
      </button>
    );
  }
  return (
    <span className="flex items-center gap-4 text-sm">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await deleteEntry(id);
            onDeleted();
          })
        }
        className="font-semibold text-danger disabled:opacity-50"
      >
        {pending ? "Duke fshirë…" : "Po, fshije përgjithmonë"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="text-ink/60">
        Anulo
      </button>
    </span>
  );
}
