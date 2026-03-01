import { TextStyle } from 'react-native';
import { AnalysisViewTab, SegmentMeta, ToneLabel } from '../types/schema';

const toneColor: Record<ToneLabel, string> = {
  calm: '#4b7bec',
  warm: '#fd9644',
  neutral: '#6c757d',
  tense: '#a55eea',
  harsh: '#eb3b5a',
  sad: '#778ca3',
  fearful: '#8854d0',
  joyful: '#20bf6b',
};

const riskColor: Record<ToneLabel, string> = {
  calm: '#2d98da',
  warm: '#f7b731',
  neutral: '#a5b1c2',
  tense: '#fa8231',
  harsh: '#eb3b5a',
  sad: '#4b6584',
  fearful: '#b33939',
  joyful: '#20bf6b',
};

export const styleForSegment = (meta: SegmentMeta, tab: AnalysisViewTab, intensity: number): TextStyle => {
  const sizeScale = meta.certaintyBucket === 4 ? 1.18 : meta.certaintyBucket === 3 ? 1.1 : meta.certaintyBucket === 2 ? 1 : 0.94;
  const fontSize = 16 + (sizeScale - 1) * 12 * intensity;
  const fontWeight = meta.forcefulness === 'high' ? '700' : meta.forcefulness === 'med' ? '500' : '400';

  if (tab === 'Raw') return { fontSize: 16, fontWeight: '400', color: '#1f2937' };

  if (tab === 'Risk') {
    return {
      fontSize,
      fontWeight,
      color: riskColor[meta.tone],
      backgroundColor: meta.warnings.length > 0 ? 'rgba(235,59,90,0.08)' : undefined,
    };
  }

  return {
    fontSize,
    fontWeight,
    color: toneColor[meta.tone],
    backgroundColor: tab === 'Intent' && meta.warnings.length > 0 ? 'rgba(247,183,49,0.12)' : undefined,
  };
};
