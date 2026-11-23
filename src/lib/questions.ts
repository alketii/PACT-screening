/**
 * Self-report version of the PACT screening interview (short yes/no form).
 * The full interview is done later on the phone / in person.
 */

export type YesNo = "po" | "jo";

export const EXPOSURE_OPTIONS = [
  { value: "direct", label: "Më ka ndodhur mua" },
  { value: "witnessed", label: "E kam parë duke i ndodhur dikujt tjetër" },
  { value: "learned", label: "I ka ndodhur një anëtari të familjes ose një personi të afërt" },
  { value: "work", label: "Përballem vazhdimisht me detaje të ngjarjeve të tilla për shkak të punës" },
] as const;

export const SOURCE_OPTIONS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "acquaintance", label: "Nga një i njohur" },
  { value: "other", label: "Tjetër" },
] as const;

export type ExposureValue = (typeof EXPOSURE_OPTIONS)[number]["value"];
export type SourceValue = (typeof SOURCE_OPTIONS)[number]["value"];

export interface Answers {
  trauma?: YesNo;
  exposure?: ExposureValue[];
  diagnosed?: YesNo;
  ptsdDiagnosis?: YesNo;
  reexperiencing?: YesNo;
  reactivity?: YesNo;
  avoidance?: YesNo;
  arousal?: YesNo;
  impairment?: YesNo;
  psychotic?: YesNo;
  manic?: YesNo;
  alcohol?: YesNo;
  substance?: YesNo;
  suicidality?: YesNo;
  currentTreatment?: YesNo;
  pastTreatment?: YesNo;
  crisisContact?: YesNo;
  source?: SourceValue;
}

type YesNoKey = {
  [K in keyof Answers]-?: Answers[K] extends YesNo | undefined ? (YesNo extends Answers[K] ? K : never) : never;
}[keyof Answers];

export type Question = {
  title: string;
  help?: string;
  /** Short label for the admin panel. */
  short: string;
  showIf?: (a: Answers) => boolean;
} & (
  | { id: YesNoKey; kind: "yesno" }
  | { id: "exposure"; kind: "multi"; options: typeof EXPOSURE_OPTIONS }
  | { id: "source"; kind: "choice"; optional: true; options: typeof SOURCE_OPTIONS }
);

const hadTrauma = (a: Answers) => a.trauma === "po";

export const QUESTIONS: Question[] = [
  {
    id: "trauma",
    kind: "yesno",
    short: "Ngjarje traumatike",
    title: "A keni përjetuar ndonjë ngjarje traumatike gjatë jetës suaj?",
    help: "Për shembull: një aksident i rëndë, dhunë, sulm seksual, luftë, ose keni parë diçka të tillë t’i ndodhë dikujt tjetër. Nuk keni nevojë të jepni detaje.",
  },
  {
    id: "exposure",
    kind: "multi",
    short: "Lloji i përvojës",
    title: "Si e keni përjetuar këtë ngjarje?",
    help: "Mund të zgjidhni më shumë se një.",
    options: EXPOSURE_OPTIONS,
    showIf: hadTrauma,
  },
  {
    id: "reexperiencing",
    kind: "yesno",
    short: "Ripërjetim",
    title: "A e ripërjetoni rregullisht ngjarjen, p.sh. përmes imazheve ose mendimeve ndërhyrëse, ose përmes ëndrrave?",
    showIf: hadTrauma,
  },
  {
    id: "reactivity",
    kind: "yesno",
    short: "Shqetësim / reagime fizike",
    title: "A shqetësoheni emocionalisht ose keni reagime fizike kur diçka ju kujton ngjarjen?",
    showIf: hadTrauma,
  },
  {
    id: "avoidance",
    kind: "yesno",
    short: "Shmangie",
    title: "A i shmangni mendimet dhe ndjenjat që lidhen me ngjarjen, ose situata, vende a njerëz të caktuar për shkak të saj?",
    showIf: hadTrauma,
  },
  {
    id: "arousal",
    kind: "yesno",
    short: "Irritim / gatishmëri / gjumë",
    title: "A ndiheni vazhdimisht të irrituar ose në gatishmëri, trembeni lehtë, apo keni probleme me përqendrimin ose gjumin?",
    showIf: hadTrauma,
  },
  {
    id: "impairment",
    kind: "yesno",
    short: "Ndikim në funksionim",
    title: "A ndikojnë këto vështirësi në aftësinë tuaj për të funksionuar në punë, në shoqëri, në studime etj.?",
    showIf: hadTrauma,
  },
  {
    id: "diagnosed",
    kind: "yesno",
    short: "Diagnozë psikologjike",
    title: "A jeni diagnostikuar ndonjëherë me një çrregullim psikologjik?",
  },
  {
    id: "ptsdDiagnosis",
    kind: "yesno",
    short: "Diagnozë PTSD",
    title: "A është çrregullimi i stresit posttraumatik (PTSD) ndër diagnozat tuaja?",
    showIf: (a) => a.diagnosed === "po",
  },
  {
    id: "psychotic",
    kind: "yesno",
    short: "Çrregullim psikotik",
    title: "A vuani për momentin nga një çrregullim psikotik (p.sh. skizofreni)?",
  },
  {
    id: "manic",
    kind: "yesno",
    short: "Çrregullim manik/hipomanik",
    title: "A vuani për momentin nga një çrregullim manik ose hipomanik?",
    help: "P.sh. çrregullim bipolar.",
  },
  {
    id: "alcohol",
    kind: "yesno",
    short: "Varësi nga alkooli",
    title: "A keni për momentin probleme me përdorimin e alkoolit, p.sh. varësi nga alkooli?",
  },
  {
    id: "substance",
    kind: "yesno",
    short: "Varësi nga substancat",
    title: "A keni për momentin probleme me përdorimin e substancave të tjera, p.sh. varësi ose abuzim?",
  },
  {
    id: "suicidality",
    kind: "yesno",
    short: "Mendime/plane për vetëvrasje",
    title: "Në muajin e kaluar, a keni pasur mendime ose plane për vetëvrasje, ose a keni tentuar ndonjëherë?",
    help: "E dimë që kjo është pyetje e vështirë. Përgjigjja juaj na ndihmon t’ju mbështesim më mirë.",
  },
  {
    id: "currentTreatment",
    kind: "yesno",
    short: "Trajtim aktual",
    title: "A jeni duke marrë psikoterapi ose trajtim psikiatrik?",
  },
  {
    id: "pastTreatment",
    kind: "yesno",
    short: "Trajtim i mëparshëm",
    title: "A keni qenë ndonjëherë më parë në psikoterapi ose trajtim psikiatrik?",
  },
  {
    id: "crisisContact",
    kind: "yesno",
    short: "Person kontaktues në krizë",
    title: "A keni dikë me të cilin mund të flisni ose t’i kërkoni ndihmë në rast të një krize emocionale?",
    help: "P.sh. një terapist, mjek, familjar ose mik.",
  },
  {
    id: "source",
    kind: "choice",
    optional: true,
    short: "Burimi",
    title: "Si keni marrë vesh për studimin?",
    options: SOURCE_OPTIONS,
  },
];

export function visibleQuestions(a: Answers): Question[] {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(a));
}

/** Drops answers to questions that are hidden by an earlier answer. */
export function pruneAnswers(a: Answers): Answers {
  const visible = new Set<string>(visibleQuestions(a).map((q) => q.id));
  return Object.fromEntries(Object.entries(a).filter(([k]) => visible.has(k))) as Answers;
}

export function isAnswered(q: Question, a: Answers): boolean {
  if (q.kind === "multi") return (a.exposure?.length ?? 0) > 0;
  if (q.kind === "choice") return true;
  return a[q.id] !== undefined;
}

export interface Flag {
  level: "urgent" | "exclusion" | "check";
  text: string;
}

/**
 * Hints for the team in the admin panel. These are not decisions and are
 * never shown to the respondent.
 */
export function computeFlags(a: Answers): Flag[] {
  const flags: Flag[] = [];
  if (a.suicidality === "po") flags.push({ level: "urgent", text: "Mendime/plane për vetëvrasje — kontaktoni me përparësi" });
  if (a.trauma === "jo") flags.push({ level: "exclusion", text: "Nuk raporton ngjarje traumatike (kriteri A)" });
  if (a.psychotic === "po") flags.push({ level: "exclusion", text: "Çrregullim psikotik" });
  if (a.manic === "po") flags.push({ level: "exclusion", text: "Çrregullim manik/hipomanik" });
  if (a.alcohol === "po") flags.push({ level: "exclusion", text: "Përdorim i alkoolit" });
  if (a.substance === "po") flags.push({ level: "exclusion", text: "Përdorim i substancave" });
  const anySymptom = [a.reexperiencing, a.reactivity, a.avoidance, a.arousal].includes("po");
  if (a.trauma === "po" && !anySymptom && a.ptsdDiagnosis !== "po") {
    flags.push({ level: "check", text: "Pa simptoma të raportuara të PTSD dhe pa diagnozë" });
  }
  if (a.crisisContact === "jo") flags.push({ level: "check", text: "Pa person kontaktues për rast krize" });
  return flags;
}
