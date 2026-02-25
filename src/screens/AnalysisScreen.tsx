import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAppState } from '../context/AppContext';
import { ConfidenceIcon } from '../components/ConfidenceIcon';
import { InspectorModal } from '../components/InspectorModal';
import { SemanticTextRenderer } from '../components/SemanticTextRenderer';
import { TabSwitcher } from '../components/TabSwitcher';
import { IFArtifact, SegmentNode, SegmentOverride } from '../types/schema';
import { createId } from '../utils/ids';
import { exportSingleArtifact } from '../utils/importExport';

export const AnalysisScreen: React.FC<NativeStackScreenProps<RootStackParamList, 'Analysis'>> = ({ route }) => {
  const { getArtifactById, upsertArtifact, settings } = useAppState();
  const [artifact, setArtifact] = useState<IFArtifact | null>(null);
  const [tab, setTab] = useState<'Raw' | 'Tone' | 'Intent' | 'Risk'>('Raw');
  const [selected, setSelected] = useState<SegmentNode | null>(null);

  useEffect(() => {
    const load = async () => {
      if (route.params.mode === 'existing' && route.params.artifactId) {
        const loaded = await getArtifactById(route.params.artifactId);
        if (loaded) setArtifact(loaded);
      } else if (route.params.mode === 'new' && route.params.originalText && route.params.analysis) {
        const now = new Date().toISOString();
        setArtifact({
          artifactId: createId(),
          version: 'IFArtifact-0.1',
          createdAt: now,
          updatedAt: now,
          sourceType: 'message',
          audienceType: route.params.audienceType,
          originalText: route.params.originalText,
          segments: route.params.analysis.segments,
          analysis: route.params.analysis,
          userOverrides: { bySegmentId: {} },
          provenance: {
            analyzerProvider: 'mock',
            analyzerVersion: '0.1',
          },
        });
      }
    };
    void load();
  }, [getArtifactById, route.params]);

  const onSaveOverride = (override: SegmentOverride) => {
    if (!artifact || !selected) return;
    setArtifact({
      ...artifact,
      userOverrides: {
        bySegmentId: {
          ...artifact.userOverrides.bySegmentId,
          [selected.id]: {
            ...artifact.userOverrides.bySegmentId[selected.id],
            ...override,
          },
        },
      },
      updatedAt: new Date().toISOString(),
    });
    setSelected(null);
  };

  const saveArtifact = async () => {
    if (!artifact) return;
    await upsertArtifact({ ...artifact, updatedAt: new Date().toISOString() });
    Alert.alert('Saved', 'Artifact saved locally.');
  };

  if (!artifact) {
    return (
      <View style={styles.centered}>
        <Text>Loading analysis...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 28 }}>
      <Text style={styles.snapshotTitle}>Intent Snapshot</Text>
      <View style={styles.snapshotRow}>
        <ConfidenceIcon bucket={artifact.analysis.intentSnapshot.confidenceBucket} size={20} />
        <Text style={styles.snapshotText}>{artifact.analysis.intentSnapshot.text}</Text>
      </View>
      <Text style={styles.help}>Confidence indicates confidence in interpretation, not correctness.</Text>

      <TabSwitcher selected={tab} onSelect={setTab} />

      <SemanticTextRenderer
        segments={artifact.segments}
        tab={tab}
        overrides={artifact.userOverrides}
        visualIntensity={settings.visualIntensity}
        onPressSegment={setSelected}
      />

      <View style={styles.buttonRow}>
        <Pressable style={styles.saveButton} onPress={saveArtifact}>
          <Text style={styles.saveText}>Save Artifact</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => exportSingleArtifact(artifact)}>
          <Text>Export Single JSON</Text>
        </Pressable>
      </View>

      <InspectorModal
        visible={!!selected}
        segment={selected}
        initialOverride={selected ? artifact.userOverrides.bySegmentId[selected.id] : undefined}
        onClose={() => setSelected(null)}
        onSave={onSaveOverride}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  snapshotTitle: { fontSize: 18, fontWeight: '700' },
  snapshotRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 6 },
  snapshotText: { fontSize: 16, color: '#111827' },
  help: { color: '#4b5563', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  saveButton: { flex: 1, backgroundColor: '#111827', borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
  saveText: { color: 'white', fontWeight: '700' },
  secondaryButton: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
});
