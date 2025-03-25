import type { Word } from "@/components/dictionary-provider";

export function getWordOfTheDay(words: Word[]): Word | null {
  if (words.length === 0) return null;

  // Get current date components
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();

  // Create a deterministic seed based on the date
  // This ensures the same word is chosen on the same day for all users
  const dateSeed = year * 10000 + month * 100 + day;

  // Use the seed to select a word
  const index = dateSeed % words.length;

  return words[index];
}

export function formatShareText(word: Word): string {
  return (
    `📚 Word of the Day: "${word.term}"\n\n` +
    `Definition: ${word.definition}\n\n` +
    `Example: "${word.usageExamples[0]?.text || "No example available"}"\n\n` +
    `Regions: ${word.region.join(", ")}\n\n` +
    `From the Regional Dialect Dictionary`
  );
}
