// Comment intelligence parser and urology content idea generator

const QUESTION_INDICATORS = [
  '?',
  'how',
  'what',
  'why',
  'when',
  'which',
  'where',
  'can i',
  'can we',
  'is it',
  'does it',
  'should i',
  'kya',
  'kaise',
  'kab',
  'sir',
  'doctor',
  'doc',
  'please explain',
  'advice',
  'suggest',
  'pain',
];

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'to', 'for',
  'it', 'with', 'as', 'by', 'that', 'this', 'my', 'me', 'i', 'we', 'you', 'your',
  'sir', 'dr', 'doctor', 'please', 'thanks', 'thank', 'very', 'good', 'nice', 'video',
  'kya', 'hai', 'me', 'ko', 'se', 'ki', 'ka', 'ke', 'aur', 'hi',
]);

export function isCommentQuestion(text: string): boolean {
  if (!text) return false;
  if (text.includes('?')) return true;
  const lower = text.toLowerCase();
  return QUESTION_INDICATORS.some((indicator) => lower.startsWith(indicator) || lower.includes(` ${indicator} `));
}

export interface KeywordFrequency {
  word: string;
  count: number;
}

export function extractFrequentKeywords(comments: Array<{ text: string }>, topN = 15): KeywordFrequency[] {
  const counts: Record<string, number> = {};

  comments.forEach((c) => {
    const words = c.text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

    words.forEach((w) => {
      counts[w] = (counts[w] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
}
