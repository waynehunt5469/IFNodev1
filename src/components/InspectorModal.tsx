import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ConfidenceIcon } from './ConfidenceIcon';
import { SegmentNode, SegmentOverride, SpeechActLabel, ToneLabel } from '../types/schema';

const tones: ToneLabel[] = ['calm', 'warm', 'neutral', 'tense', 'harsh', 'sad', 'fearful', 'joyful'];
const speechActs: SpeechActLabel[] = [
  'Observe',
  'Interpret',
  'Feel',
  'Need',
  'Request',
  'Boundary',
  'Warn',
  'Repair',
  'Commit',
  'Question',
  'Correct',
  'Accuse',
  'Defend',
  'Reflect',
  'Uncertain',
];

interface Props {
  visible: boolean;
  segment: SegmentNode | null;
  initialOverride?: SegmentOverride;
  onClose: () => void;
  onSave: (override: SegmentOverride) => void;
}

export const InspectorModal: React.FC<Props> = ({ visible, segment, initialOverride, onClose, onSave }) => {
  const [tone, setTone] = useState<ToneLabel | undefined>();
  const [dominant, setDominant] = useState<SpeechActLabel | undefined>();
  const [certaintyBucket, setCertaintyBucket] = useState<0 | 1 | 2 | 3 | 4 | undefined>();

  useEffect(() => {
    setTone(initialOverride?.tone);
    setDominant(initialOverride?.dominantSpeechAct);
    setCertaintyBucket(initialOverride?.certaintyBucket);
  }, [initialOverride, segment?.id]);

  if (!segment) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.title}>Inspector</Text>
            <Text style={styles.label}>Original segment</Text>
            <Text style={styles.value}>{segment.text}</Text>

            <Text style={styles.label}>Inferred tone</Text>
            <Text style={styles.value}>{segment.meta.tone}</Text>

            <Text style={styles.label}>Inferred speech act</Text>
            <Text style={styles.value}>{segment.meta.dominantSpeechAct}</Text>

            <Text style={styles.label}>Confidence in interpretation, not correctness</Text>
            <View style={styles.row}>
              <ConfidenceIcon bucket={segment.meta.confidenceBucket} size={22} />
              <Text style={styles.value}> Bucket {segment.meta.confidenceBucket}</Text>
            </View>

            <Text style={styles.label}>Warnings (neutral diagnostics)</Text>
            {segment.meta.warnings.map((w) => (
              <View key={w.code} style={styles.warningBox}>
                <Text style={styles.value}>{w.code}</Text>
                <Text style={styles.hint}>{w.explanation}</Text>
              </View>
            ))}

            <Text style={styles.label}>Override tone</Text>
            <View style={styles.pillWrap}>
              {tones.map((option) => (
                <Pressable key={option} style={[styles.pill, tone === option && styles.pillActive]} onPress={() => setTone(option)}>
                  <Text>{option}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Override speech act</Text>
            <View style={styles.pillWrap}>
              {speechActs.map((option) => (
                <Pressable
                  key={option}
                  style={[styles.pill, dominant === option && styles.pillActive]}
                  onPress={() => setDominant(option)}
                >
                  <Text>{option}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Override certainty bucket</Text>
            <View style={styles.row}>
              {[0, 1, 2, 3, 4].map((b) => (
                <Pressable key={b} style={[styles.circleBtn, certaintyBucket === b && styles.pillActive]} onPress={() => setCertaintyBucket(b as 0 | 1 | 2 | 3 | 4)}>
                  <ConfidenceIcon bucket={b as 0 | 1 | 2 | 3 | 4} size={18} />
                </Pressable>
              ))}
            </View>

            <Text style={styles.hint}>Confidence indicates confidence in interpretation, not correctness.</Text>
          </ScrollView>

          <View style={styles.footerRow}>
            <Pressable onPress={onClose} style={styles.secondaryBtn}>
              <Text>Close</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                onSave({
                  tone,
                  dominantSpeechAct: dominant,
                  speechActs: dominant ? [dominant] : undefined,
                  certaintyBucket,
                })
              }
              style={styles.primaryBtn}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>Save Override</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { maxHeight: '85%', backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  label: { marginTop: 10, color: '#374151', fontWeight: '600' },
  value: { marginTop: 3, color: '#111827' },
  hint: { color: '#6b7280', marginTop: 3 },
  warningBox: { marginTop: 6, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  pill: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 6 },
  pillActive: { borderColor: '#111827', backgroundColor: '#f3f4f6' },
  circleBtn: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 20, padding: 8 },
  footerRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  secondaryBtn: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
  primaryBtn: { flex: 1, backgroundColor: '#111827', borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
});
