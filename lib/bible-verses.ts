// The NLT (New Living Translation) is copyrighted by Tyndale House
// Publishers, so its wording can't be hardcoded/redistributed here — only
// the reference (book/chapter/verse) is fixed and rotated deterministically
// by calendar date; the actual verse text is fetched fresh each time from a
// free public Bible-text API. A short, curated fallback (referencing a
// well-known, freely-quotable passage) covers the rare case where that
// fetch fails, so the section never renders empty.
export type BibleVerse = { text: string; reference: string };

const BOOK_IDS: Record<string, number> = {
  Genesis: 1,
  Exodus: 2,
  Leviticus: 3,
  Numbers: 4,
  Deuteronomy: 5,
  Joshua: 6,
  Judges: 7,
  Ruth: 8,
  "1 Samuel": 9,
  "2 Samuel": 10,
  "1 Kings": 11,
  "2 Kings": 12,
  "1 Chronicles": 13,
  "2 Chronicles": 14,
  Ezra: 15,
  Nehemiah: 16,
  Esther: 17,
  Job: 18,
  Psalm: 19,
  Proverbs: 20,
  Ecclesiastes: 21,
  "Song of Solomon": 22,
  Isaiah: 23,
  Jeremiah: 24,
  Lamentations: 25,
  Ezekiel: 26,
  Daniel: 27,
  Hosea: 28,
  Joel: 29,
  Amos: 30,
  Obadiah: 31,
  Jonah: 32,
  Micah: 33,
  Nahum: 34,
  Habakkuk: 35,
  Zephaniah: 36,
  Haggai: 37,
  Zechariah: 38,
  Malachi: 39,
  Matthew: 40,
  Mark: 41,
  Luke: 42,
  John: 43,
  Acts: 44,
  Romans: 45,
  "1 Corinthians": 46,
  "2 Corinthians": 47,
  Galatians: 48,
  Ephesians: 49,
  Philippians: 50,
  Colossians: 51,
  "1 Thessalonians": 52,
  "2 Thessalonians": 53,
  "1 Timothy": 54,
  "2 Timothy": 55,
  Titus: 56,
  Philemon: 57,
  Hebrews: 58,
  James: 59,
  "1 Peter": 60,
  "2 Peter": 61,
  "1 John": 62,
  "2 John": 63,
  "3 John": 64,
  Jude: 65,
  Revelation: 66,
};

type VerseRef = { book: string; chapter: number; verse: number };

const REFERENCES: VerseRef[] = [
  { book: "Philippians", chapter: 4, verse: 13 },
  { book: "Proverbs", chapter: 3, verse: 5 },
  { book: "Jeremiah", chapter: 29, verse: 11 },
  { book: "Joshua", chapter: 1, verse: 9 },
  { book: "Romans", chapter: 8, verse: 28 },
  { book: "Psalm", chapter: 23, verse: 1 },
  { book: "John", chapter: 3, verse: 16 },
  { book: "Psalm", chapter: 118, verse: 24 },
  { book: "Isaiah", chapter: 40, verse: 31 },
  { book: "Psalm", chapter: 37, verse: 5 },
  { book: "Mark", chapter: 5, verse: 36 },
  { book: "Psalm", chapter: 37, verse: 4 },
  { book: "Deuteronomy", chapter: 31, verse: 6 },
  { book: "Proverbs", chapter: 3, verse: 6 },
  { book: "Psalm", chapter: 27, verse: 1 },
  { book: "Psalm", chapter: 55, verse: 22 },
  { book: "Isaiah", chapter: 41, verse: 10 },
  { book: "Galatians", chapter: 6, verse: 9 },
  { book: "Ephesians", chapter: 4, verse: 32 },
  { book: "Proverbs", chapter: 17, verse: 22 },
  { book: "Philippians", chapter: 4, verse: 4 },
  { book: "Psalm", chapter: 107, verse: 1 },
  { book: "Colossians", chapter: 3, verse: 23 },
  { book: "1 Corinthians", chapter: 16, verse: 14 },
  { book: "Matthew", chapter: 6, verse: 33 },
  { book: "2 Corinthians", chapter: 5, verse: 7 },
  { book: "Psalm", chapter: 46, verse: 10 },
  { book: "Exodus", chapter: 14, verse: 14 },
  { book: "Hebrews", chapter: 12, verse: 1 },
  { book: "Psalm", chapter: 27, verse: 14 },
  { book: "Luke", chapter: 1, verse: 37 },
  { book: "Psalm", chapter: 28, verse: 7 },
  { book: "Philippians", chapter: 4, verse: 8 },
  { book: "James", chapter: 4, verse: 8 },
  { book: "James", chapter: 1, verse: 17 },
  { book: "Psalm", chapter: 1, verse: 1 },
  { book: "Proverbs", chapter: 27, verse: 17 },
  { book: "Matthew", chapter: 7, verse: 7 },
  { book: "Philippians", chapter: 4, verse: 6 },
  { book: "Philippians", chapter: 4, verse: 7 },
  { book: "Isaiah", chapter: 26, verse: 3 },
  { book: "Matthew", chapter: 5, verse: 14 },
  { book: "Matthew", chapter: 5, verse: 16 },
  { book: "2 Timothy", chapter: 2, verse: 15 },
  { book: "2 Timothy", chapter: 1, verse: 7 },
  { book: "Hebrews", chapter: 11, verse: 1 },
  { book: "Hebrews", chapter: 4, verse: 16 },
  { book: "Colossians", chapter: 3, verse: 14 },
  { book: "Philippians", chapter: 4, verse: 19 },
  { book: "Lamentations", chapter: 3, verse: 23 },
  { book: "Psalm", chapter: 30, verse: 5 },
  { book: "Psalm", chapter: 34, verse: 18 },
  { book: "Psalm", chapter: 147, verse: 3 },
  { book: "1 Peter", chapter: 5, verse: 7 },
  { book: "1 John", chapter: 4, verse: 7 },
  { book: "1 John", chapter: 4, verse: 18 },
  { book: "Proverbs", chapter: 22, verse: 6 },
  { book: "Proverbs", chapter: 15, verse: 1 },
  { book: "Proverbs", chapter: 16, verse: 18 },
  { book: "Proverbs", chapter: 9, verse: 10 },
];

const FALLBACK_VERSE: BibleVerse = {
  text: "Trust in the LORD with all your heart; do not depend on your own understanding.",
  reference: "Proverbs 3:5 (NLT)",
};

function dayOfYear(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  const start = Date.UTC(year, 0, 1);
  return Math.floor((target - start) / 86400000) + 1;
}

export async function verseOfTheDay(dateStr: string): Promise<BibleVerse> {
  const ref = REFERENCES[dayOfYear(dateStr) % REFERENCES.length];
  const bookId = BOOK_IDS[ref.book];
  const reference = `${ref.book} ${ref.chapter}:${ref.verse} (NLT)`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://bolls.life/get-text/NLT/${bookId}/${ref.chapter}/`, {
      signal: controller.signal,
      // Bible text never changes — cache aggressively rather than refetching every visit.
      next: { revalidate: 604800 },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`bolls.life returned ${res.status}`);

    const verses = (await res.json()) as { verse: number; text: string }[];
    const match = verses.find((v) => v.verse === ref.verse);
    if (!match) throw new Error("verse not found in chapter response");

    return { text: match.text.replace(/<[^>]+>/g, "").trim(), reference };
  } catch {
    return FALLBACK_VERSE;
  }
}
