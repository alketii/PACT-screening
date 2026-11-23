import type { EntryStatus } from "@/db/schema";

export const STATUS_LABELS: Record<EntryStatus, string> = {
  new: "I ri",
  contacted: "Kontaktuar",
  scheduled: "Takim i caktuar",
  declined: "Nuk dëshiron",
  unsuitable: "Jo i përshtatshëm",
};
