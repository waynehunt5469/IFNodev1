import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TabParamList, RootStackParamList } from '../navigation/AppNavigator';
import { useAppState } from '../context/AppContext';
import { ConfidenceIcon } from '../components/ConfidenceIcon';
import { exportAllArtifacts, importArtifactsFromJson } from '../utils/importExport';

export const HomeScreen: React.FC<BottomTabScreenProps<TabParamList, 'Home'>> = ({ navigation }) => {
  const { artifactIndex, reloadIndex } = useAppState();
  const stackNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onImport = async () => {
    const count = await importArtifactsFromJson();
    await reloadIndex();
    Alert.alert('Import complete', `${count} artifacts imported.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.philosophy}>IFMedium does not read minds. Interpretations are hypotheses under uncertainty.</Text>

      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={() => navigation.navigate('NewAnalysis')}>
          <Text style={styles.btnText}>New Analysis</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={onImport}>
          <Text>Import JSON</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => exportAllArtifacts()}>
          <Text>Export All JSON</Text>
        </Pressable>
      </View>

      <FlatList
        data={artifactIndex}
        keyExtractor={(item) => item.artifactId}
        ListEmptyComponent={<Text style={styles.empty}>No saved artifacts yet.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => stackNav.navigate('Analysis', { mode: 'existing', artifactId: item.artifactId })}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text>{new Date(item.updatedAt).toLocaleString()}</Text>
            <View style={styles.rowInline}>
              <ConfidenceIcon bucket={2} />
              <Text> Intent: {item.topIntent}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  philosophy: { color: '#4b5563', marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  btn: { backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  btnText: { color: 'white', fontWeight: '600' },
  secondaryBtn: { borderWidth: 1, borderColor: '#d1d5db', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 8 },
  cardTitle: { fontWeight: '700', marginBottom: 4, color: '#111827' },
  rowInline: { flexDirection: 'row', alignItems: 'center' },
  empty: { color: '#6b7280', marginTop: 16 },
});
