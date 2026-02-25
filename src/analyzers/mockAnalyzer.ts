import { Analyzer } from './interface';
import {
  AnalyzeInput,
  AnalyzeOutput,
  SegmentNode,
  SpeechActLabel,
  TokenNode,
  ToneLabel,
  WarningCode,
  WarningItem,
} from '../types/schema';
import { createId } from '../utils/ids';

const toneLexicon: Record<ToneLabel, string[]> = {
  calm: ['steady', 'okay', 'fine', 'settled'],
  warm: ['thanks', 'appreciate', 'care', 'glad'],
  neutral: ['update', 'info', 'noted'],
  tense: ['urgent', 'immediately', 'soon', 'asap'],
  harsh: ['always', 'never', 'ridiculous', 'unacceptable'],
  sad: ['sorry', 'hurt', 'sad', 'down'],
  fearful: ['worried', 'afraid', 'anxious', 'risk'],
  joyful: ['great', 'excited', 'happy', 'awesome'],
};

const emotionallyLoadedWords = new Set(['always', 'never', 'ridiculous', 'unacceptable', 'hate', 'love']);
const ambiguousWords = new Set(['maybe', 'kind of', 'sort of', 'probably', 'possibly']);

const detectTone = (text: string): ToneLabel => {
  const lower = text.toLowerCase();
  let best: ToneLabel = 'neutral';
  let bestScore = 0;
  (Object.keys(toneLexicon) as ToneLabel[]).forEach((tone) => {
    const score = toneLexicon[tone].reduce((sum, word) => sum + (lower.includes(word) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = tone;
    }
  });
  return best;
};

const detectSpeechActs = (text: string): SpeechActLabel[] => {
  const lower = text.toLowerCase();
  const labels: SpeechActLabel[] = [];
  if (lower.includes('?')) labels.push('Question');
  if (/(please|could you|can you)/.test(lower)) labels.push('Request');
  if (/(i feel|i'm feeling|i am feeling)/.test(lower)) labels.push('Feel');
  if (/(i need|we need)/.test(lower)) labels.push('Need');
  if (/(i think|it seems|looks like)/.test(lower)) labels.push('Interpret');
  if (/(i will|we will|i can|i'll)/.test(lower)) labels.push('Commit');
  if (/(must|have to|cannot|can't)/.test(lower)) labels.push('Boundary');
  if (/(warning|risk|careful|danger)/.test(lower)) labels.push('Warn');
  if (labels.length === 0) labels.push('Observe');
  return labels;
};

const bucketFromScore = (score: number): 0 | 1 | 2 | 3 | 4 => {
  if (score <= 0) return 1;
  if (score === 1) return 2;
  if (score <= 3) return 3;
  return 4;
};

const generateWarnings = (text: string): WarningItem[] => {
  const lower = text.toLowerCase();
  const warnings: WarningItem[] = [];
  if ([...ambiguousWords].some((w) => lower.includes(w))) {
    warnings.push({
      code: 'ambiguous_phrasing',
      explanation: 'This phrase uses wording that can be interpreted in multiple ways.',
      severity: 'info',
    });
  }
  if ([...emotionallyLoadedWords].some((w) => lower.includes(w))) {
    warnings.push({
      code: 'emotionally_loaded_wording',
      explanation: 'This phrase includes emotionally charged wording that may intensify reactions.',
      severity: 'warn',
    });
  }
  return warnings;
};

const splitParagraphs = (text: string) => {
  const chunks: Array<{ text: string; start: number; end: number }> = [];
  let cursor = 0;
  text.split(/\n+/).forEach((p) => {
    const start = text.indexOf(p, cursor);
    const end = start + p.length;
    if (p.trim().length > 0 && start >= 0) chunks.push({ text: p, start, end });
    cursor = end;
  });
  return chunks;
};

const splitSentences = (text: string, offset: number) => {
  const matches = [...text.matchAll(/[^.!?]+[.!?]?/g)];
  return matches
    .map((m) => {
      const sentence = m[0];
      const index = m.index ?? 0;
      const trimmed = sentence.trim();
      const leftPad = sentence.indexOf(trimmed);
      const start = offset + index + Math.max(leftPad, 0);
      return { text: trimmed, start, end: start + trimmed.length };
    })
    .filter((s) => s.text.length > 0);
};

const splitPhrases = (text: string, offset: number) => {
  const phrases: Array<{ text: string; start: number; end: number }> = [];
  let runningOffset = 0;
  text
    .split(/(;|,|\band\b|\bbut\b)/gi)
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const idxRaw = text.toLowerCase().indexOf(part.toLowerCase(), runningOffset);
      const idx = idxRaw >= 0 ? idxRaw : runningOffset;
      const start = offset + idx;
      phrases.push({ text: part, start, end: start + part.length });
      runningOffset = idx + part.length;
    });
  return phrases.length ? phrases : [{ text, start: offset, end: offset + text.length }];
};

const tokenize = (text: string, offset: number): TokenNode[] => {
  const matches = [...text.matchAll(/\S+/g)];
  return matches.map((m) => {
    const tokenText = m[0];
    const start = offset + (m.index ?? 0);
    const lower = tokenText.toLowerCase();
    return {
      id: createId(),
      start,
      end: start + tokenText.length,
      text: tokenText,
      meta: {
        emotionallyLoaded: emotionallyLoadedWords.has(lower),
        ambiguous: ambiguousWords.has(lower),
        confidenceBucket: 2,
      },
    };
  });
};

const createPhraseNode = (text: string, start: number, end: number): SegmentNode => {
  const speechActs = detectSpeechActs(text);
  const warnings = generateWarnings(text);
  const certaintyBucket = bucketFromScore(speechActs.length + warnings.length);
  return {
    id: createId(),
    type: 'phrase',
    start,
    end,
    text,
    tokens: tokenize(text, start),
    meta: {
      speechActs,
      dominantSpeechAct: speechActs[0] ?? 'Uncertain',
      tone: detectTone(text),
      forcefulness: /(!|must|need|never|always)/i.test(text) ? 'high' : /should|could/i.test(text) ? 'med' : 'low',
      certaintyBucket,
      warnings,
      confidenceBucket: certaintyBucket,
      intentSummary: speechActs.join(', '),
    },
  };
};

const createSentenceNode = (text: string, start: number, end: number): SegmentNode => {
  const phraseNodes = splitPhrases(text, start).map((p) => createPhraseNode(p.text, p.start, p.end));
  const allWarnings = phraseNodes.flatMap((p) => p.meta.warnings.map((w) => w.code));
  const speechActs = detectSpeechActs(text);
  return {
    id: createId(),
    type: 'sentence',
    start,
    end,
    text,
    children: phraseNodes,
    meta: {
      speechActs,
      dominantSpeechAct: speechActs[0] ?? 'Uncertain',
      tone: detectTone(text),
      forcefulness: /(!|must|need)/i.test(text) ? 'high' : /should|could/i.test(text) ? 'med' : 'low',
      certaintyBucket: bucketFromScore(phraseNodes.length),
      warnings: [...new Set(allWarnings)].map((code) => ({
        code: code as WarningCode,
        explanation:
          code === 'ambiguous_phrasing'
            ? 'Part of this sentence can be interpreted in more than one way.'
            : 'Part of this sentence uses emotionally loaded wording.',
        severity: code === 'ambiguous_phrasing' ? 'info' : 'warn',
      })),
      confidenceBucket: bucketFromScore(speechActs.length),
      intentSummary: speechActs.join(', '),
      escalationRisk: /(!|never|always|unacceptable|must)/i.test(text) ? 'high' : 'med',
      clarity: allWarnings.includes('ambiguous_phrasing') ? 'low' : 'high',
    },
  };
};

export class MockAnalyzer implements Analyzer {
  async analyzeText(input: AnalyzeInput): Promise<AnalyzeOutput> {
    const paragraphs = splitParagraphs(input.text).map((p) => {
      const sentences = splitSentences(p.text, p.start).map((s) => createSentenceNode(s.text, s.start, s.end));
      const tones = sentences.map((s) => s.meta.tone);
      return {
        id: createId(),
        type: 'paragraph' as const,
        start: p.start,
        end: p.end,
        text: p.text,
        children: sentences,
        meta: {
          speechActs: ['Observe'] as SpeechActLabel[],
          dominantSpeechAct: 'Observe' as SpeechActLabel,
          tone: tones[0] ?? 'neutral',
          forcefulness: 'med' as const,
          certaintyBucket: 2 as const,
          warnings: sentences.flatMap((s) => s.meta.warnings),
          confidenceBucket: 2 as const,
        },
      };
    });

    const sentenceNodes = paragraphs.flatMap((p) => p.children ?? []);
    const allWarnings = sentenceNodes.flatMap((s) => s.meta.warnings.map((w) => w.code));
    const dominantSentence = sentenceNodes[0];

    return {
      intentSnapshot: {
        text: dominantSentence?.meta.intentSummary ?? 'Observe',
        confidenceBucket: dominantSentence?.meta.confidenceBucket ?? 2,
      },
      documentMeta: {
        dominantTone: dominantSentence?.meta.tone ?? 'neutral',
        topWarnings: [...new Set(allWarnings)].slice(0, 2) as WarningCode[],
        confidenceBucket: sentenceNodes.length > 0 ? 2 : 1,
      },
      segments: paragraphs,
    };
  }
}
