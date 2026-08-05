// KJV text (public domain) — a fixed rotation so "today's verse" is
// deterministic from the calendar date rather than randomized per render,
// and stays consistent across every request that lands on the same day.
export type BibleVerse = { text: string; reference: string };

const VERSES: BibleVerse[] = [
  { text: "I can do all things through Christ which strengtheneth me.", reference: "Philippians 4:13" },
  { text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.", reference: "Proverbs 3:5" },
  { text: "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.", reference: "Jeremiah 29:11" },
  { text: "Be strong and of a good courage, be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.", reference: "Joshua 1:9" },
  { text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", reference: "Romans 8:28" },
  { text: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1" },
  { text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", reference: "John 3:16" },
  { text: "This is the day which the Lord hath made; we will rejoice and be glad in it.", reference: "Psalm 118:24" },
  { text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles.", reference: "Isaiah 40:31" },
  { text: "Commit thy way unto the Lord; trust also in him; and he shall bring it to pass.", reference: "Psalm 37:5" },
  { text: "Be not afraid, only believe.", reference: "Mark 5:36" },
  { text: "Delight thyself also in the Lord: and he shall give thee the desires of thine heart.", reference: "Psalm 37:4" },
  { text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee.", reference: "Joshua 1:9" },
  { text: "In all thy ways acknowledge him, and he shall direct thy paths.", reference: "Proverbs 3:6" },
  { text: "The Lord is my light and my salvation; whom shall I fear?", reference: "Psalm 27:1" },
  { text: "Cast thy burden upon the Lord, and he shall sustain thee.", reference: "Psalm 55:22" },
  { text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God.", reference: "Isaiah 41:10" },
  { text: "Let us not be weary in well doing: for in due season we shall reap, if we faint not.", reference: "Galatians 6:9" },
  { text: "Be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you.", reference: "Ephesians 4:32" },
  { text: "A merry heart doeth good like a medicine: but a broken spirit drieth the bones.", reference: "Proverbs 17:22" },
  { text: "Rejoice in the Lord always: and again I say, Rejoice.", reference: "Philippians 4:4" },
  { text: "Give thanks unto the Lord; for he is good: for his mercy endureth for ever.", reference: "Psalm 107:1" },
  { text: "Whatsoever ye do, do it heartily, as to the Lord, and not unto men.", reference: "Colossians 3:23" },
  { text: "Let all your things be done with charity.", reference: "1 Corinthians 16:14" },
  { text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.", reference: "Matthew 6:33" },
  { text: "For we walk by faith, not by sight.", reference: "2 Corinthians 5:7" },
  { text: "Be still, and know that I am God.", reference: "Psalm 46:10" },
  { text: "The Lord will fight for you, and ye shall hold your peace.", reference: "Exodus 14:14" },
  { text: "And let us not be weary in well doing: for in due season we shall reap, if we faint not.", reference: "Galatians 6:9" },
  { text: "Wait on the Lord: be of good courage, and he shall strengthen thine heart: wait, I say, on the Lord.", reference: "Psalm 27:14" },
  { text: "For with God nothing shall be impossible.", reference: "Luke 1:37" },
  { text: "The Lord is my strength and my shield; my heart trusted in him, and I am helped.", reference: "Psalm 28:7" },
  { text: "Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, think on these things.", reference: "Philippians 4:8" },
  { text: "Draw nigh to God, and he will draw nigh to you.", reference: "James 4:8" },
  { text: "Every good gift and every perfect gift is from above, and cometh down from the Father of lights.", reference: "James 1:17" },
  { text: "Blessed is the man that walketh not in the counsel of the ungodly... but his delight is in the law of the Lord.", reference: "Psalm 1:1-2" },
  { text: "As iron sharpeneth iron; so a man sharpeneth the countenance of his friend.", reference: "Proverbs 27:17" },
  { text: "Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you.", reference: "Matthew 7:7" },
  { text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.", reference: "Philippians 4:6" },
  { text: "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.", reference: "Philippians 4:7" },
  { text: "The steadfast of mind thou wilt keep in perfect peace, because he trusteth in thee.", reference: "Isaiah 26:3" },
  { text: "Ye are the light of the world. A city that is set on an hill cannot be hid.", reference: "Matthew 5:14" },
  { text: "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.", reference: "Matthew 5:16" },
  { text: "Study to shew thyself approved unto God, a workman that needeth not to be ashamed.", reference: "2 Timothy 2:15" },
  { text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.", reference: "2 Timothy 1:7" },
  { text: "Now faith is the substance of things hoped for, the evidence of things not seen.", reference: "Hebrews 11:1" },
  { text: "Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need.", reference: "Hebrews 4:16" },
  { text: "Above all things, put on charity, which is the bond of perfectness.", reference: "Colossians 3:14" },
  { text: "But my God shall supply all your need according to his riches in glory by Christ Jesus.", reference: "Philippians 4:19" },
  { text: "It is of the Lord's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.", reference: "Lamentations 3:22-23" },
  { text: "Weeping may endure for a night, but joy cometh in the morning.", reference: "Psalm 30:5" },
  { text: "The Lord is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.", reference: "Psalm 34:18" },
  { text: "He healeth the broken in heart, and bindeth up their wounds.", reference: "Psalm 147:3" },
  { text: "Casting all your care upon him; for he careth for you.", reference: "1 Peter 5:7" },
  { text: "Beloved, let us love one another: for love is of God; and every one that loveth is born of God, and knoweth God.", reference: "1 John 4:7" },
  { text: "There is no fear in love; but perfect love casteth out fear.", reference: "1 John 4:18" },
  { text: "Train up a child in the way he should go: and when he is old, he will not depart from it.", reference: "Proverbs 22:6" },
  { text: "A soft answer turneth away wrath: but grievous words stir up anger.", reference: "Proverbs 15:1" },
  { text: "Pride goeth before destruction, and an haughty spirit before a fall.", reference: "Proverbs 16:18" },
  { text: "The fear of the Lord is the beginning of wisdom.", reference: "Proverbs 9:10" },
];

function dayOfYear(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  const start = Date.UTC(year, 0, 1);
  return Math.floor((target - start) / 86400000) + 1;
}

export function verseOfTheDay(dateStr: string): BibleVerse {
  return VERSES[dayOfYear(dateStr) % VERSES.length];
}
