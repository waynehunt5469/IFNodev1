import React from 'react';
import { Text } from 'react-native';
import { ConfidenceBucket } from '../types/schema';

const symbols: Record<ConfidenceBucket, string> = {
  0: '○',
  1: '◔',
  2: '◑',
  3: '◕',
  4: '●',
};

export const ConfidenceIcon: React.FC<{ bucket: ConfidenceBucket; size?: number }> = ({ bucket, size = 16 }) => (
  <Text style={{ fontSize: size }}>{symbols[bucket]}</Text>
);
