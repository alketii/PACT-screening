"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { MAX_AGE, MIN_AGE, ORGANISATIONS } from "@/config/site";
import { isAnswered, pruneAnswers, visibleQuestions, type Answers, type Question } from "@/lib/questions";
import { submitEntry } from "./actions";
import { SupportCard } from "./support-card";

type Stage = "intro" | "contact" | "questions" | "support" | "done";

interface Contact {
  fullName: string;
  age: string;
  phone: string;
  consent: boolean;
  website: string;
}

export function Wizard() {
  const [stage, setStage] = useState<Stage>("intro");
  const [contact, setContact] = useState<Contact>({ fullName: "", age: "", phone: "", consent: true, website: "" });
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const topRef = useRef<HTMLDivElement>(null);

  const questions = visibleQuestions(answers);
  const question = questions[Math.min(index, questions.length - 1)];

  // Each step starts at the top, and screen readers land on the new content.
  useEffect(() => {
    if (stage !== "intro") topRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [stage, index]);

  function submit(finalAnswers: Answers) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await submitEntry({
          fullName: contact.fullName,
          age: Number(contact.age),
          phone: contact.phone,
          consent: contact.consent,
          website: contact.website,
          answers: pruneAnswers(finalAnswers),
        });
        if (res.ok) setStage("done");
        else setError("Diçka nuk shkoi mirë. Kontrolloni të dhënat dhe provoni përsëri.");
      } catch {
        setError("Nuk u dërgua. Kontrolloni internetin dhe provoni përsëri.");
      }
    });
  }

  function advance(next: Answers) {
    const list = visibleQuestions(next);
    const at = list.findIndex((q) => q.id === question.id);
    // Someone who reports suicidal thoughts sees support contacts right away.
    if (question.id === "suicidality" && next.suicidality === "po") {
      setIndex(at + 1);
      setStage("support");
    } else if (at + 1 < list.length) {
      setIndex(at + 1);
    } else {
      submit(next);
    }
  }

  function answer(patch: Partial<Answers>, thenAdvance: boolean) {
    const next = { ...answers, ...patch };
    setAnswers(next);
    if (thenAdvance) advance(next);
  }

  function back() {
    setError(null);
    if (stage === "contact") setStage("intro");
    else if (stage === "support") {
      setIndex(index - 1);
      setStage("questions");
    } else if (index === 0) setStage("contact");
    else setIndex(index - 1);
  }

  if (stage === "intro") return <Intro onStart={() => setStage("contact")} />;

  // Contact is step 1; each question is one further step.
  const total = questions.length + 1;
  const current = stage === "contact" ? 1 : stage === "done" ? total : index + 2;

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-10 pt-5">
      <header className="flex items-center gap-4">
        {stage !== "done" && (
          <button
            type="button"
            onClick={back}
            disabled={pending}
            className="-ml-2 rounded-full p-2 text-ink/60 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-accent-600"
            aria-label="Kthehu prapa"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={current}
          aria-label="Përparimi"
        >
          <div
            className="h-full rounded-full bg-accent-600 transition-[width] duration-300"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium tabular-nums text-ink/50">
          {current}/{total}
        </span>
      </header>

      <div ref={topRef} tabIndex={-1} key={`${stage}-${index}`} className="step-in mt-10 flex-1 outline-none">
        {stage === "contact" && (
          <ContactStep
            contact={contact}
            onChange={setContact}
            onNext={() => {
              setIndex(0);
              setStage("questions");
            }}
          />
        )}

        {stage === "questions" && (
          <QuestionStep
            question={question}
            answers={answers}
            pending={pending}
            isLast={index >= questions.length - 1}
            onAnswer={answer}
            onNext={() => advance(answers)}
          />
        )}

        {stage === "support" && (
          <div className="space-y-6">
            <SupportCard />
            <PrimaryButton onClick={() => setStage("questions")}>Vazhdo me pyetjet</PrimaryButton>
          </div>
        )}

        {stage === "done" && (
          <div className="pt-6 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent-600 text-white shadow-lg shadow-accent-600/30">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <path d="m8 15.5 5 5 9.5-11" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">
              Faleminderit, {contact.fullName.trim().split(/\s+/)[0]}!
            </h1>
            <p className="mx-auto mt-3 max-w-sm leading-relaxed text-ink/70">
              Përgjigjet tuaja u dërguan. Ekipi i studimit PACT do t’ju telefonojë së shpejti për hapat e ardhshëm.
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/60">
              Në fund të studimit do t’ju dërgojmë një përmbledhje të gjetjeve.
            </p>
            {answers.suicidality === "po" && (
              <div className="mt-8">
                <SupportCard />
              </div>
            )}
          </div>
        )}

        {error && (
          <p role="alert" className="mt-6 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger text-ink">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-accent-50 via-white to-white">
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 pt-7">
        <p className="inline-flex items-center gap-2 self-start rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold tracking-wide text-accent-700 shadow-card">
          <span className="size-2 rounded-full bg-accent-600" />
          Studimi PACT
        </p>

        <h1 className="mt-6 text-[2.25rem] font-bold leading-[1.08] tracking-tight sm:text-5xl">
          Përvojat e vështira lënë gjurmë.
          <span className="block text-accent-600">Na ndihmoni t’i kuptojmë.</span>
        </h1>

        <p className="mt-4 text-base leading-relaxed text-ink/70">
          Studimi PACT hulumton se si përvojat traumatike ndikojnë në jetën e përditshme. Kërkojmë pjesëmarrës të
          moshës {MIN_AGE}–{MAX_AGE} vjeç.
        </p>

        <ol className="mt-6 space-y-2.5">
          <IntroPoint n="1" title="2–3 minuta">
            Përgjigjuni disa pyetjeve të shkurtra me po ose jo.
          </IntroPoint>
          <IntroPoint n="2" title="Ju telefonojmë ne">
            Ekipi i studimit ju kontakton për një bisedë dhe ju shpjegon hapat e ardhshëm.
          </IntroPoint>
          <IntroPoint n="3" title="Merrni gjetjet e studimit">
            Në fund të studimit ju dërgojmë një përmbledhje të asaj që kemi mësuar.
          </IntroPoint>
        </ol>

        <div className="sticky bottom-0 -mx-6 mt-auto bg-gradient-to-t from-white from-80% to-white/0 px-6 pb-5 pt-8">
          <button
            type="button"
            onClick={onStart}
            className="w-full rounded-2xl bg-accent-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-accent-600/30 transition hover:bg-accent-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-600 active:scale-[0.99]"
          >
            Fillo
          </button>
          <p className="mt-3 flex items-center justify-center gap-2 text-center text-sm text-ink/60">
            <LockIcon />
            Përgjigjet tuaja janë konfidenciale.
          </p>
          <p className="mt-1.5 text-center text-xs text-ink/45">{ORGANISATIONS.join(" · ")}</p>
        </div>
      </div>
    </div>
  );
}

function IntroPoint({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3.5 rounded-2xl bg-white px-4 py-3.5 shadow-card">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-sm font-bold text-accent-700">
        {n}
      </span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm leading-relaxed text-ink/65">{children}</span>
      </span>
    </li>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="w-full rounded-2xl bg-accent-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-accent-600/30 transition hover:bg-accent-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 disabled:opacity-40 disabled:shadow-none"
    >
      {children}
    </button>
  );
}

const inputClass =
  "mt-2 block w-full rounded-xl bg-slate-100 px-4 py-3.5 text-base placeholder:text-ink/35 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-600";

function ContactStep({
  contact,
  onChange,
  onNext,
}: {
  contact: Contact;
  onChange: (c: Contact) => void;
  onNext: () => void;
}) {
  const [problem, setProblem] = useState<string | null>(null);
  const set = (patch: Partial<Contact>) => {
    onChange({ ...contact, ...patch });
    setProblem(null);
  };

  function validate() {
    const age = Number(contact.age);
    const digits = contact.phone.replace(/\D/g, "").length;
    if (contact.fullName.trim().length < 2) return "Shkruani emrin tuaj.";
    if (!contact.age || !Number.isInteger(age)) return "Shkruani moshën tuaj.";
    if (age < MIN_AGE || age > MAX_AGE) return `Ky studim është për persona të moshës ${MIN_AGE}–${MAX_AGE} vjeç.`;
    if (digits < 8 || digits > 15) return "Shkruani një numër telefoni të vlefshëm.";
    if (!contact.consent) return "Ju lutemi pajtohuni që ekipi t’ju kontaktojë.";
    return null;
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const p = validate();
        if (p) setProblem(p);
        else onNext();
      }}
      className="space-y-5"
    >
      <div>
        <h1 className="text-3xl font-bold leading-tight tracking-tight">Si mund t’ju kontaktojmë?</h1>
        <p className="mt-3 flex gap-2 rounded-2xl bg-accent-50 px-4 py-3 text-sm leading-relaxed text-ink/75">
          <span className="mt-0.5 text-accent-700">
            <LockIcon />
          </span>
          Këto të dhëna janë konfidenciale dhe nuk ndahen me askënd jashtë ekipit të studimit. I përdorim vetëm për
          t’ju kontaktuar.
        </p>
      </div>

      <label className="block text-sm font-medium">
        Emri dhe mbiemri
        <input
          className={inputClass}
          autoComplete="name"
          maxLength={120}
          value={contact.fullName}
          onChange={(e) => set({ fullName: e.target.value })}
        />
      </label>

      <label className="block text-sm font-medium">
        Mosha
        <input
          className={`${inputClass} max-w-32`}
          inputMode="numeric"
          value={contact.age}
          onChange={(e) => set({ age: e.target.value.replace(/\D/g, "").slice(0, 3) })}
        />
      </label>

      <label className="block text-sm font-medium">
        Numri i telefonit
        <input
          className={inputClass}
          type="tel"
          autoComplete="tel"
          placeholder="p.sh. 044 123 456"
          maxLength={30}
          value={contact.phone}
          onChange={(e) => set({ phone: e.target.value })}
        />
      </label>

      {/* Honeypot for bots: hidden from people and assistive technology. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={contact.website} onChange={(e) => set({ website: e.target.value })} />
        </label>
      </div>

      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 accent-accent-600"
          checked={contact.consent}
          onChange={(e) => set({ consent: e.target.checked })}
        />
        <span>
          Pajtohem që ekipi i studimit PACT të më kontaktojë me telefon dhe t’i ruajë përgjigjet e mia për këtë qëllim.
        </span>
      </label>

      {problem && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {problem}
        </p>
      )}

      <PrimaryButton type="submit">Vazhdo</PrimaryButton>
    </form>
  );
}

function QuestionStep({
  question,
  answers,
  pending,
  isLast,
  onAnswer,
  onNext,
}: {
  question: Question;
  answers: Answers;
  pending: boolean;
  isLast: boolean;
  onAnswer: (patch: Partial<Answers>, thenAdvance: boolean) => void;
  onNext: () => void;
}) {
  const optionClass = (selected: boolean) =>
    `w-full rounded-2xl px-5 py-4 text-base font-semibold transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 disabled:opacity-50 ${
      selected
        ? "bg-accent-600 text-white shadow-lg shadow-accent-600/30"
        : "bg-accent-50 text-accent-700 hover:bg-accent-100"
    }`;

  return (
    <fieldset disabled={pending} className="space-y-6">
      <legend className="text-[1.65rem] font-bold leading-snug tracking-tight">{question.title}</legend>
      {question.help && <p className="-mt-2 text-sm leading-relaxed text-ink/70">{question.help}</p>}

      {question.kind === "yesno" && (
        <div className="grid grid-cols-2 gap-3">
          {(["po", "jo"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={answers[question.id] === v}
              onClick={() => onAnswer({ [question.id]: v }, true)}
              className={`${optionClass(answers[question.id] === v)} py-5 text-center text-xl`}
            >
              {v === "po" ? "Po" : "Jo"}
            </button>
          ))}
        </div>
      )}

      {question.kind === "multi" && (
        <>
          <div className="space-y-3">
            {question.options.map((o) => {
              const selected = answers.exposure?.includes(o.value) ?? false;
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    const cur = answers.exposure ?? [];
                    onAnswer({ exposure: selected ? cur.filter((x) => x !== o.value) : [...cur, o.value] }, false);
                  }}
                  className={`${optionClass(selected)} text-left`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          <PrimaryButton onClick={onNext} disabled={!isAnswered(question, answers)}>
            Vazhdo
          </PrimaryButton>
        </>
      )}

      {question.kind === "choice" && (
        <>
          <div className="space-y-3">
            {question.options.map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={answers.source === o.value}
                onClick={() => onAnswer({ source: answers.source === o.value ? undefined : o.value }, false)}
                className={`${optionClass(answers.source === o.value)} text-left`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <PrimaryButton onClick={onNext}>{pending ? "Duke dërguar…" : isLast ? "Dërgo" : "Vazhdo"}</PrimaryButton>
        </>
      )}

      {pending && question.kind === "yesno" && <p className="text-sm text-ink/60">Duke dërguar…</p>}
    </fieldset>
  );
}
