import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../navigation/AppNavigator';
import { useAppState } from '../context/AppContext';
import { exportAllArtifacts, importArtifactsFromJson } from '../utils/importExport';

export const SettingsScreen: React.FC<BottomTabScreenProps<TabParamList, 'Settings'>> = () => {
  const { settings, updateSettings, reloadIndex } = useAppState();

  const onImport = async () => {
    const count = await importArtifactsFromJson();
    await reloadIndex();
    Alert.alert('Import complete', `${count} artifacts imported.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.label}>Visual intensity: {settings.visualIntensity.toFixed(2)}</Text>
      <Slider
        minimumValue={0}
        maximumValue={1}
        step={0.05}
        value={settings.visualIntensity}
        onSlidingComplete={(v) => updateSettings({ visualIntensity: Number(v) })}
      />

      <Text style={styles.label}>Analyzer provider</Text>
      <View style={styles.providerBox}>
        <Text>Mock (V1 only)</Text>
      </View>

      <Pressable style={styles.button} onPress={() => exportAllArtifacts()}>
        <Text style={styles.buttonText}>Export All JSON</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={onImport}>
        <Text>Import JSON</Text>
      </Pressable>

      <Text style={styles.help}>IFMedium does not read minds. Interpretations are hypotheses under uncertainty.</Text>
      <Text style={styles.help}>Original text is preserved unchanged.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  heading: { fontWeight: '700', fontSize: 20, marginBottom: 10 },
  label: { fontWeight: '600', marginTop: 8, marginBottom: 6 },
  providerBox: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12 },
  button: { marginTop: 20, backgroundColor: '#111827', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '700' },
  secondaryButton: { marginTop: 10, borderWidth: 1, borderColor: '#d1d5db', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  help: { marginTop: 12, color: '#4b5563' },
});
