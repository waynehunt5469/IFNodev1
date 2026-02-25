import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AnalysisViewTab, Overrides, SegmentNode } from '../types/schema';
import { styleForSegment } from '../utils/styleMapping';

interface Props {
  segments: SegmentNode[];
  tab: AnalysisViewTab;
  overrides: Overrides;
  visualIntensity: number;
  onPressSegment: (segment: SegmentNode) => void;
}

const applyOverride = (segment: SegmentNode, overrides: Overrides): SegmentNode => {
  const ov = overrides.bySegmentId[segment.id];
  if (!ov) return segment;
  return {
    ...segment,
    meta: {
      ...segment.meta,
      tone: ov.tone ?? segment.meta.tone,
      speechActs: ov.speechActs ?? segment.meta.speechActs,
      dominantSpeechAct: ov.dominantSpeechAct ?? segment.meta.dominantSpeechAct,
      certaintyBucket: ov.certaintyBucket ?? segment.meta.certaintyBucket,
      warnings: segment.meta.warnings.map((w) => {
        const update = ov.warningUpdates?.find((u) => u.code === w.code);
        return update ? { ...w, ...update } : w;
      }),
    },
  };
};

const renderPhrase = (
  phrase: SegmentNode,
  tab: AnalysisViewTab,
  overrides: Overrides,
  visualIntensity: number,
  onPressSegment: (segment: SegmentNode) => void,
) => {
  const merged = applyOverride(phrase, overrides);
  return (
    <Pressable key={phrase.id} onPress={() => onPressSegment(phrase)}>
      <Text style={styleForSegment(merged.meta, tab, visualIntensity)}>
        {merged.tokens?.map((token) => (
          <Text key={token.id}>{token.text} </Text>
        ))}
      </Text>
      {tab !== 'Raw' && merged.meta.dominantSpeechAct ? <Text style={styles.badge}>{merged.meta.dominantSpeechAct}</Text> : null}
    </Pressable>
  );
};

export const SemanticTextRenderer: React.FC<Props> = ({
  segments,
  tab,
  overrides,
  visualIntensity,
  onPressSegment,
}) => (
  <View>
    {segments.map((paragraph) => (
      <View key={paragraph.id} style={styles.paragraph}>
        {paragraph.children?.map((sentence) => (
          <View key={sentence.id}>
            {sentence.children?.map((phrase) =>
              renderPhrase(phrase, tab, overrides, visualIntensity, onPressSegment),
            )}
          </View>
        ))}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  paragraph: { marginBottom: 12, gap: 6 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: 4,
    fontSize: 11,
    color: '#374151',
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
