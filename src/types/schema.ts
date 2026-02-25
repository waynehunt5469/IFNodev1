export type AudienceType = 'family' | 'legal' | 'medical' | 'business' | 'personal';

export type SpeechActLabel =
  | 'Observe'
  | 'Interpret'
  | 'Feel'
  | 'Need'
  | 'Request'
  | 'Boundary'
  | 'Warn'
  | 'Repair'
  | 'Commit'
  | 'Question'
  | 'Correct'
  | 'Accuse'
  | 'Defend'
  | 'Reflect'
  | 'Uncertain';

export type ToneLabel =
  | 'calm'
  | 'warm'
  | 'neutral'
  | 'tense'
  | 'harsh'
  | 'sad'
  | 'fearful'
  | 'joyful';

export type WarningCode = 'ambiguous_phrasing' | 'emotionally_loaded_wording';

export type ConfidenceBucket = 0 | 1 | 2 | 3 | 4;

export interface WarningItem {
  code: WarningCode;
  explanation: string;
  severity: 'info' | 'warn';
  acknowledged?: boolean;
  dismissed?: boolean;
}

export interface SegmentMeta {
  speechActs: SpeechActLabel[];
  dominantSpeechAct: SpeechActLabel;
  tone: ToneLabel;
  forcefulness: 'low' | 'med' | 'high';
  certaintyBucket: ConfidenceBucket;
  warnings: WarningItem[];
  confidenceBucket: ConfidenceBucket;
  intentSummary?: string;
  escalationRisk?: 'low' | 'med' | 'high';
  clarity?: 'low' | 'med' | 'high';
}

export interface TokenNode {
  id: string;
  start: number;
  end: number;
  text: string;
  meta: {
    emotionallyLoaded?: boolean;
    ambiguous?: boolean;
    confidenceBucket?: ConfidenceBucket;
  };
}

export interface SegmentNode {
  id: string;
  type: 'paragraph' | 'sentence' | 'phrase';
  start: number;
  end: number;
  text: string;
  children?: SegmentNode[];
  tokens?: TokenNode[];
  meta: SegmentMeta;
}

export interface AnalyzeInput {
  text: string;
  audienceType?: AudienceType;
  options?: {
    visualIntensity?: number;
  };
}

export interface AnalyzeOutput {
  intentSnapshot: {
    text: string;
    confidenceBucket: ConfidenceBucket;
  };
  documentMeta: {
    dominantTone: ToneLabel;
    topWarnings: WarningCode[];
    confidenceBucket: ConfidenceBucket;
  };
  segments: SegmentNode[];
}

export interface SegmentOverride {
  tone?: ToneLabel;
  speechActs?: SpeechActLabel[];
  dominantSpeechAct?: SpeechActLabel;
  certaintyBucket?: ConfidenceBucket;
  warningUpdates?: Array<{
    code: WarningCode;
    acknowledged?: boolean;
    dismissed?: boolean;
  }>;
}

export interface Overrides {
  bySegmentId: Record<string, SegmentOverride>;
}

export interface IFArtifact {
  artifactId: string;
  version: 'IFArtifact-0.1';
  createdAt: string;
  updatedAt: string;
  sourceType: 'message';
  audienceType?: AudienceType;
  originalText: string;
  segments: SegmentNode[];
  analysis: AnalyzeOutput;
  userOverrides: Overrides;
  provenance: {
    analyzerProvider: 'mock';
    analyzerVersion: '0.1';
  };
  replyToText?: string;
  senderRole?: string;
  participants?: Array<{ id: string; label: string }>;
  notes?: string;
}

export interface ArtifactListItem {
  artifactId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  topIntent: string;
}

export type AnalysisViewTab = 'Raw' | 'Tone' | 'Intent' | 'Risk';
