import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AnalysisViewTab } from '../types/schema';

const tabs: AnalysisViewTab[] = ['Raw', 'Tone', 'Intent', 'Risk'];

export const TabSwitcher: React.FC<{
  selected: AnalysisViewTab;
  onSelect: (tab: AnalysisViewTab) => void;
}> = ({ selected, onSelect }) => (
  <View style={styles.row}>
    {tabs.map((tab) => (
      <Pressable key={tab} onPress={() => onSelect(tab)} style={[styles.tab, selected === tab && styles.active]}>
        <Text style={[styles.tabText, selected === tab && styles.activeText]}>{tab}</Text>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 8,
    alignItems: 'center',
  },
  active: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  tabText: { color: '#111827' },
  activeText: { color: 'white', fontWeight: '600' },
});
