/**
 * Texts and contacts the study team must confirm before the link is shared.
 */

/** Institutions running the study, shown on the first screen. */
export const ORGANISATIONS = ["Universiteti i Salzburgut", "Kolegji AAB"];

export const MIN_AGE = 18;
export const MAX_AGE = 65;

export interface SupportContact {
  name: string;
  detail: string;
  /** Digits for the tel: link. */
  phone: string;
}

/**
 * Shown to anyone who reports suicidal thoughts or plans.
 * TODO(study team): add the study's own crisis contact and a verified helpline
 * number (e.g. Linja e Jetës) with its current opening hours.
 */
export const SUPPORT_CONTACTS: SupportContact[] = [
  { name: "Numri i urgjencës", detail: "Në rast rreziku të menjëhershëm, 24 orë", phone: "112" },
];
