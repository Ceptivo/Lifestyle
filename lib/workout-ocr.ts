// Rule-based extraction from OCR'd text of a fitness-tracker summary
// screenshot (built against Samsung Health's stat-card layout). Runs
// entirely client-side against Tesseract.js output — no API key, no
// server round trip. Best-effort: always returns whatever it could find,
// never throws, so a partial or failed read just means fewer prefilled
// fields rather than a broken form.

export type ParsedWorkout = {
  activityType: string | null;
  durationMinutes: number | null;
  distanceKm: number | null;
  calories: number | null;
  notes: string | null;
};

function firstMatch(text: string, pattern: RegExp): RegExpMatchArray | null {
  return text.match(pattern);
}

// Samsung Health renders decimals with a comma in some locales (e.g.
// "3,62 km"); normalize to a dot before parsing as a float.
function parseLocaleNumber(raw: string): number {
  return Number(raw.replace(/\s/g, "").replace(",", "."));
}

export function parseWorkoutText(rawText: string): ParsedWorkout {
  const text = rawText.replace(/\r/g, "");

  let activityType: string | null = null;
  const distanceMatch = firstMatch(text, /distance[^\d]*([\d.,]+)\s*km/i);
  const distanceKm = distanceMatch ? parseLocaleNumber(distanceMatch[1]) : null;

  const durationMatch = firstMatch(text, /duration[^\d]*(\d{1,2}):(\d{2})(?::(\d{2}))?/i);
  let durationMinutes: number | null = null;
  if (durationMatch) {
    const [, a, b, c] = durationMatch;
    // hh:mm:ss if a third group matched, otherwise mm:ss
    durationMinutes = c
      ? Number(a) * 60 + Number(b) + Number(c) / 60
      : Number(a) + Number(b) / 60;
    durationMinutes = Math.round(durationMinutes * 10) / 10;
  }

  const caloriesMatch = firstMatch(text, /calories?[^\d]*([\d,.]+)\s*kcal/i);
  const calories = caloriesMatch ? Math.round(parseLocaleNumber(caloriesMatch[1])) : null;

  const paceMatch = firstMatch(text, /pace[^\d]*(\d+)['’](\d+)/i);
  const heartRateMatch = firstMatch(text, /heart rate[^\d]*(\d+)\s*bpm/i);
  const cadenceMatch = firstMatch(text, /cadence[^\d]*(\d+)\s*spm/i);
  const stepsMatch = firstMatch(text, /steps[^\d]*([\d,.\s]+?)(?:\n|$)/i);

  const notesParts: string[] = [];
  if (paceMatch) notesParts.push(`Avg pace ${paceMatch[1]}'${paceMatch[2]}"/km`);
  if (heartRateMatch) notesParts.push(`Avg HR ${heartRateMatch[1]}bpm`);
  if (cadenceMatch) notesParts.push(`Cadence ${cadenceMatch[1]}spm`);
  if (stepsMatch) {
    const steps = stepsMatch[1].replace(/[^\d]/g, "");
    if (steps) notesParts.push(`Steps ${steps}`);
  }

  // No explicit activity-type label on the Samsung Health summary card —
  // infer Run when pace/cadence/steps (running-specific metrics) show up,
  // otherwise leave it null so the caller keeps whatever was selected.
  if (paceMatch || cadenceMatch || stepsMatch) activityType = "Run";

  return {
    activityType,
    durationMinutes,
    distanceKm,
    calories,
    notes: notesParts.length ? notesParts.join(" · ") : null,
  };
}
