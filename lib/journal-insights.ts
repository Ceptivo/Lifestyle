// Rules-based triage for the personal health journal. This is NOT a
// diagnosis and never claims to be one — it surfaces widely-recognized
// red-flag symptoms worth a doctor's attention, and pattern-matches recent
// entries against a small table of common, mostly non-emergency condition
// clusters so there's a starting point for "is this worth getting checked
// out." Always defers to a real clinician; when in doubt, it says so.

export const NOT_A_DIAGNOSIS_NOTICE =
  "This is not a medical diagnosis — just pattern-matching on what you've logged. When in doubt, check with a doctor.";

export type ConcernFlag = { level: "urgent" | "moderate"; reason: string };

const RED_FLAGS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /chest pain|tightness in (my |the )?chest|chest tightness/i,
    reason:
      "Chest pain can be a sign of a heart or lung problem — if it's severe, sudden, or comes with shortness of breath, seek medical care promptly.",
  },
  {
    pattern: /short(ness)? of breath|difficult(y)? breathing|can'?t breathe|trouble breathing/i,
    reason: "Difficulty breathing warrants prompt medical attention, especially if it's sudden or severe.",
  },
  {
    pattern: /worst headache|thunderclap|sudden severe headache/i,
    reason: "A sudden, severe ('worst ever') headache needs urgent medical evaluation.",
  },
  {
    pattern: /numbness|weakness on one side|slurred speech|face droop/i,
    reason:
      "One-sided weakness, numbness, or slurred speech can be signs of a stroke — seek emergency care immediately if this came on suddenly.",
  },
  {
    pattern: /vision loss|blurred vision|double vision|loss of vision/i,
    reason: "Sudden vision changes should be evaluated promptly.",
  },
  {
    pattern: /faint(ed|ing)?|passed out|blacked out/i,
    reason: "Fainting or loss of consciousness is worth getting checked out.",
  },
  {
    pattern: /cough(ing)? (up )?blood|blood in (my |the )?(stool|urine|vomit)/i,
    reason: "Blood in stool, urine, vomit, or a cough should be evaluated by a doctor.",
  },
  {
    pattern: /severe abdominal pain|unbearable pain/i,
    reason: "Severe or unbearable pain is worth a prompt medical check.",
  },
  {
    pattern: /suicidal|self.?harm|want(ed)? to die/i,
    reason: "If you're having thoughts of self-harm, please reach out to a mental health professional or crisis line right away.",
  },
  {
    pattern: /seizure|convuls/i,
    reason: "A seizure should be evaluated by a doctor, especially if it's new.",
  },
  {
    pattern: /can'?t keep (food|anything) down|unable to keep .* down/i,
    reason: "Being unable to keep food or fluids down for an extended period can lead to dehydration — worth checking in with a doctor.",
  },
];

export function checkEntryForConcern(input: {
  symptom: string;
  severity: number;
  bodyArea: string | null;
  triggers: string | null;
  notes: string | null;
}): ConcernFlag | null {
  const text = [input.symptom, input.bodyArea, input.triggers, input.notes].filter(Boolean).join(" ");
  for (const flag of RED_FLAGS) {
    if (flag.pattern.test(text)) {
      return { level: "urgent", reason: flag.reason };
    }
  }
  if (input.severity >= 8) {
    return {
      level: "moderate",
      reason: `Severity ${input.severity}/10 is high — if this persists or worsens, it's worth getting checked out.`,
    };
  }
  return null;
}

export type PossibleCondition = { name: string; advice: string; matchedOn: string[] };

const CONDITION_PATTERNS: { name: string; advice: string; keywords: { label: string; pattern: RegExp }[] }[] = [
  {
    name: "Migraine",
    advice: "If headaches with light sensitivity or nausea keep recurring, a doctor can discuss migraine treatment options.",
    keywords: [
      { label: "headache", pattern: /headache/i },
      { label: "nausea", pattern: /nausea/i },
      { label: "light sensitivity", pattern: /light sensitiv|photophobia/i },
      { label: "vision/aura", pattern: /vision|aura/i },
      { label: "throbbing pain", pattern: /throbbing/i },
    ],
  },
  {
    name: "Tension headache",
    advice: "Usually eases with rest, hydration, and stress reduction — see a doctor if it becomes frequent or severe.",
    keywords: [
      { label: "headache", pattern: /headache/i },
      { label: "neck/shoulder", pattern: /neck|shoulder/i },
      { label: "stress trigger", pattern: /stress|tension/i },
    ],
  },
  {
    name: "Common cold / flu",
    advice: "Usually resolves on its own within a week or two — see a doctor if it worsens or a high fever persists beyond a few days.",
    keywords: [
      { label: "sore throat", pattern: /sore throat/i },
      { label: "cough", pattern: /cough/i },
      { label: "fever", pattern: /fever/i },
      { label: "fatigue", pattern: /fatigue|tired/i },
      { label: "congestion", pattern: /congestion|runny nose|blocked nose/i },
    ],
  },
  {
    name: "Gastroenteritis (stomach bug)",
    advice: "Usually resolves in a few days with rest and fluids — see a doctor if you can't keep fluids down or it persists beyond 48 hours.",
    keywords: [
      { label: "nausea", pattern: /nausea/i },
      { label: "vomiting", pattern: /vomit/i },
      { label: "diarrhea", pattern: /diarrh/i },
      { label: "abdominal pain", pattern: /abdominal|stomach/i },
      { label: "cramping", pattern: /cramp/i },
    ],
  },
  {
    name: "Allergic reaction",
    advice: "Mild reactions often respond to antihistamines — see a doctor if swelling spreads or breathing is affected.",
    keywords: [
      { label: "rash", pattern: /rash/i },
      { label: "itching", pattern: /itch/i },
      { label: "swelling", pattern: /swelling|swollen/i },
      { label: "hives", pattern: /hives/i },
    ],
  },
  {
    name: "Muscle strain / overuse",
    advice: "Usually improves with rest and light stretching — see a doctor if pain doesn't ease after a week or worsens with activity.",
    keywords: [
      { label: "muscle soreness", pattern: /muscle|strain|sore/i },
      { label: "training-related", pattern: /exercise|training|workout|run|gym/i },
      { label: "joint/limb area", pattern: /back|leg|shoulder|knee|calf|hamstring/i },
    ],
  },
  {
    name: "Anxiety / stress response",
    advice:
      "If chest tightness or a racing heart happen alongside stress, it's worth discussing with a doctor — both to rule out other causes and to talk through management options.",
    keywords: [
      { label: "anxiety/stress", pattern: /anxious|anxiety|stress/i },
      { label: "racing heart", pattern: /racing heart|palpitat/i },
      { label: "chest tightness", pattern: /chest tight/i },
      { label: "trouble relaxing", pattern: /can'?t (relax|sleep)/i },
    ],
  },
  {
    name: "Dehydration",
    advice: "Try increasing fluids first — see a doctor if dizziness or fatigue doesn't improve.",
    keywords: [
      { label: "dizziness", pattern: /dizzy|dizziness/i },
      { label: "fatigue", pattern: /fatigue|tired/i },
      { label: "headache", pattern: /headache/i },
      { label: "dry mouth", pattern: /dry mouth/i },
    ],
  },
];

const LOOKBACK_DAYS = 14;
const MIN_KEYWORD_MATCHES = 2;
const MIN_ENTRIES_FOR_PATTERN = 2;

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function generatePossibleConditions(
  entries: { entryDate: string; symptom: string; bodyArea: string | null; triggers: string | null; notes: string | null }[],
  today: string
): PossibleCondition[] {
  const cutoff = addDays(today, -LOOKBACK_DAYS);
  const recent = entries.filter((e) => e.entryDate >= cutoff);
  if (recent.length < MIN_ENTRIES_FOR_PATTERN) return [];

  const text = recent.map((e) => [e.symptom, e.bodyArea, e.triggers, e.notes].filter(Boolean).join(" ")).join(" | ");

  return CONDITION_PATTERNS.map((cond) => {
    const matched = cond.keywords.filter((k) => k.pattern.test(text));
    return { name: cond.name, advice: cond.advice, matchedOn: matched.map((k) => k.label), score: matched.length };
  })
    .filter((c) => c.score >= MIN_KEYWORD_MATCHES)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ name, advice, matchedOn }) => ({ name, advice, matchedOn }));
}
