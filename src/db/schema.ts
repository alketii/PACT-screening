import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { Answers, Flag } from "@/lib/questions";

export const ENTRY_STATUSES = ["new", "contacted", "scheduled", "declined", "unsuitable"] as const;
export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export const entries = pgTable("entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  fullName: text("full_name").notNull(),
  age: integer("age").notNull(),
  phone: text("phone").notNull(),
  /** When the respondent ticked the consent box. */
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull().defaultNow(),
  answers: jsonb("answers").$type<Answers>().notNull(),
  /** Hints for the team, computed on the server at submission. */
  flags: jsonb("flags").$type<Flag[]>().notNull().default([]),
  status: text("status").$type<EntryStatus>().notNull().default("new"),
});

export type Entry = typeof entries.$inferSelect;
