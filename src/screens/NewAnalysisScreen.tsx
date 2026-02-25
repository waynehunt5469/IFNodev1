import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAnalyzer } from '../analyzers';
import { useAppState } from '../context/AppContext';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { AudienceType } from '../types/schema';

const audiences: AudienceType[] = ['family', 'legal', 'medical', 'business', 'personal'];

export const NewAnalysisScreen: React.FC<BottomTabScreenProps<TabParamList, 'NewAnalysis'>> = () => {
  const [text, setText] = useState('');
  const [audienceType, setAudienceType] = useState<AudienceType | undefined>();
  const [loading, setLoading] = useState(false);
  const { settings } = useAppState();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const analyze = async () => {
    if (!text.trim()) {
      Alert.alert('Message required', 'Please enter a message before analyzing.');
      return;
    }
    setLoading(true);
    try {
      const analyzer = getAnalyzer('mock');
      const analysis = await analyzer.analyzeText({ text, audienceType, options: { visualIntensity: settings.visualIntensity } });
      nav.navigate('Analysis', {
        mode: 'new',
        originalText: text,
        audienceType,
        analysis,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.label}>Original message</Text>
      <TextInput
        multiline
        numberOfLines={8}
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Paste or type one message"
        textAlignVertical="top"
      />
      <Text style={styles.hint}>Original text is preserved unchanged.</Text>

      <Text style={styles.label}>Audience type (optional)</Text>
      <View style={styles.pillWrap}>
        {audiences.map((audience) => (
          <Pressable
            key={audience}
            style={[styles.pill, audienceType === audience && styles.pillActive]}
            onPress={() => setAudienceType(audience)}
          >
            <Text>{audience}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.analyzeBtn} onPress={analyze} disabled={loading}>
        <Text style={{ color: 'white', fontWeight: '700' }}>{loading ? 'Analyzing...' : 'Analyze'}</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  label: { fontWeight: '700', marginBottom: 8, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, minHeight: 160, padding: 10 },
  hint: { color: '#6b7280', marginTop: 8 },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  pill: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  pillActive: { borderColor: '#111827', backgroundColor: '#f3f4f6' },
  analyzeBtn: { marginTop: 20, backgroundColor: '#111827', borderRadius: 10, alignItems: 'center', paddingVertical: 14 },
});
