/**
 * Deterministic text calculation utilities for the editorial workspace.
 */

function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  const words = text.trim().match(/\b[\w'-]+\b/g);
  return words ? words.length : 0;
}

function countSentences(text) {
  if (!text || typeof text !== 'string') return 0;
  // Match sentence terminators (. ! ?) followed by whitespace or end of line
  const sentences = text.trim().split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 0);
  return Math.max(sentences.length, 1);
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(matches.length, 1) : 1;
}

/**
 * Calculates Flesch-Kincaid Reading Ease:
 * 206.835 - 1.015 * (total_words / total_sentences) - 84.6 * (total_syllables / total_words)
 */
function calculateReadability(text) {
  const words = text.trim().match(/\b[\w'-]+\b/g) || [];
  if (words.length === 0) {
    return { score: 100, readingLevel: 'Easy' };
  }

  const sentences = countSentences(text);
  const totalWords = words.length;

  let totalSyllables = 0;
  for (const w of words) {
    totalSyllables += countSyllables(w);
  }

  const asl = totalWords / sentences;
  const asw = totalSyllables / totalWords;

  let score = Math.round(206.835 - (1.015 * asl) - (84.6 * asw));
  score = Math.max(0, Math.min(100, score));

  let readingLevel = 'Standard';
  if (score >= 90) readingLevel = 'Very Easy';
  else if (score >= 80) readingLevel = 'Easy';
  else if (score >= 70) readingLevel = 'Fairly Easy';
  else if (score >= 60) readingLevel = 'Standard';
  else if (score >= 50) readingLevel = 'Fairly Difficult';
  else if (score >= 30) readingLevel = 'Difficult';
  else readingLevel = 'Very Difficult';

  return { score, readingLevel };
}

function calculateMetrics(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      wordCount: 0,
      sentenceCount: 0,
      averageSentenceLength: 0,
      readingTime: 0,
      readabilityScore: 100,
      readingLevel: 'Standard'
    };
  }

  const wordCount = countWords(text);
  const sentenceCount = countSentences(text);
  const averageSentenceLength = sentenceCount > 0 ? Math.round((wordCount / sentenceCount) * 10) / 10 : 0;
  // Estimated reading speed: 200 words per minute
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const { score, readingLevel } = calculateReadability(text);

  return {
    wordCount,
    sentenceCount,
    averageSentenceLength,
    readingTime,
    readabilityScore: score,
    readingLevel
  };
}

module.exports = {
  countWords,
  countSentences,
  calculateReadability,
  calculateMetrics
};
