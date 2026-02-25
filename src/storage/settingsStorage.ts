import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  visualIntensity: number;
  analyzerProvider: 'mock';
}

const SETTINGS_KEY = 'ifnode:settings';

const defaults: AppSettings = {
  visualIntensity: 0.6,
  analyzerProvider: 'mock',
};

export const loadSettings = async (): Promise<AppSettings> => {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaults;
  try {
    return { ...defaults, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return defaults;
  }
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
