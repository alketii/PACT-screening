"use server";

import { z } from "zod";
import { MAX_AGE, MIN_AGE } from "@/config/site";
import { getDb, schema } from "@/db";
import { computeFlags, isAnswered, pruneAnswers, visibleQuestions, type Answers } from "@/lib/questions";

const yn = z.enum(["po", "jo"]).optional();

const answersSchema = z.object({
  trauma: yn,
  exposure: z.array(z.enum(["direct", "witnessed", "learned", "work"])).max(4).optional(),
  diagnosed: yn,
  ptsdDiagnosis: yn,
  reexperiencing: yn,
  reactivity: yn,
  avoidance: yn,
  arousal: yn,
  impairment: yn,
  psychotic: yn,
  manic: yn,
  alcohol: yn,
  substance: yn,
  suicidality: yn,
  currentTreatment: yn,
  pastTreatment: yn,
  crisisContact: yn,
  source: z.enum(["facebook", "instagram", "tiktok", "acquaintance", "other"]).optional(),
});

const submissionSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  age: z.number().int().min(MIN_AGE).max(MAX_AGE),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^\+?[\d\s()/-]+$/)
    .refine((v) => {
      const digits = v.replace(/\D/g, "").length;
      return digits >= 8 && digits <= 15;
    }),
  consent: z.literal(true),
  /** Honeypot: real users never fill this. */
  website: z.string().max(0),
  answers: answersSchema,
});

export async function submitEntry(input: unknown): Promise<{ ok: boolean }> {
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  const answers: Answers = pruneAnswers(parsed.data.answers);
  if (!visibleQuestions(answers).every((q) => isAnswered(q, answers))) return { ok: false };

  await getDb().insert(schema.entries).values({
    fullName: parsed.data.fullName,
    age: parsed.data.age,
    phone: parsed.data.phone,
    answers,
    flags: computeFlags(answers),
  });

  // Deliberately returns nothing about eligibility.
  return { ok: true };
}
