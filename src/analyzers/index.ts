import { Analyzer } from './interface';
import { MockAnalyzer } from './mockAnalyzer';

export const getAnalyzer = (provider: 'mock' = 'mock'): Analyzer => {
  if (provider === 'mock') {
    return new MockAnalyzer();
  }
  return new MockAnalyzer();
};
