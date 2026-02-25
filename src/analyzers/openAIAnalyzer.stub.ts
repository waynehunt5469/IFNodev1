import { Analyzer } from './interface';
import { AnalyzeInput, AnalyzeOutput } from '../types/schema';

export class OpenAIAnalyzer implements Analyzer {
  async analyzeText(_input: AnalyzeInput): Promise<AnalyzeOutput> {
    throw new Error('OpenAIAnalyzer is not wired in V1. Use MockAnalyzer.');
  }
}
