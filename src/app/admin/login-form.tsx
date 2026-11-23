"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="mx-auto mt-24 max-w-xs space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="font-display text-2xl text-teal-900">PACT · Admin</h1>
      <label className="block text-sm font-medium">
        Fjalëkalimi
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-lg border border-ink/15 px-3 py-2 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-coral">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {pending ? "Duke hyrë…" : "Hyr"}
      </button>
    </form>
  );
}
