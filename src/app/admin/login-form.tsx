"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <div className="min-h-dvh bg-slate-50 px-4 pt-24">
      <form action={action} className="mx-auto max-w-xs space-y-4 rounded-3xl bg-white p-7 shadow-card">
        <h1 className="text-2xl font-bold tracking-tight">PACT · Admin</h1>
        <label className="block text-sm font-medium">
          Fjalëkalimi
          <input
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            className="mt-2 block w-full rounded-xl bg-slate-100 px-3.5 py-2.5 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-600"
          />
        </label>
        {state.error && (
          <p role="alert" className="text-sm text-danger">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-accent-600 px-4 py-2.5 font-semibold text-white transition hover:bg-accent-700 disabled:opacity-50"
        >
          {pending ? "Duke hyrë…" : "Hyr"}
        </button>
      </form>
    </div>
  );
}
