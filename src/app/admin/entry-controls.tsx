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
      className="rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-sm disabled:opacity-50"
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function DeleteButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="text-sm text-ink/50 hover:text-coral">
        Fshi
      </button>
    );
  }
  return (
    <span className="flex items-center gap-3 text-sm">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => deleteEntry(id))}
        className="font-semibold text-coral disabled:opacity-50"
      >
        {pending ? "Duke fshirë…" : "Po, fshije përgjithmonë"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="text-ink/60">
        Anulo
      </button>
    </span>
  );
}
