import { AnalyzeInput, AnalyzeOutput } from '../types/schema';

export interface Analyzer {
  analyzeText(input: AnalyzeInput): Promise<AnalyzeOutput>;
}
