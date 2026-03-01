import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ArtifactListItem, IFArtifact } from '../types/schema';
import { loadArtifact, loadArtifactIndex, saveArtifact } from '../storage/artifactStorage';
import { AppSettings, loadSettings, saveSettings } from '../storage/settingsStorage';

interface AppState {
  artifactIndex: ArtifactListItem[];
  settings: AppSettings;
  reloadIndex: () => Promise<void>;
  getArtifactById: (id: string) => Promise<IFArtifact | null>;
  upsertArtifact: (artifact: IFArtifact) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [artifactIndex, setArtifactIndex] = useState<ArtifactListItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ visualIntensity: 0.6, analyzerProvider: 'mock' });

  const reloadIndex = useCallback(async () => {
    setArtifactIndex(await loadArtifactIndex());
  }, []);

  useEffect(() => {
    void reloadIndex();
    void loadSettings().then(setSettings);
  }, [reloadIndex]);

  const getArtifactById = useCallback(async (id: string) => loadArtifact(id), []);

  const upsertArtifact = useCallback(async (artifact: IFArtifact) => {
    await saveArtifact(artifact);
    await reloadIndex();
  }, [reloadIndex]);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    await saveSettings(next);
  }, [settings]);

  const value = useMemo(
    () => ({ artifactIndex, settings, reloadIndex, getArtifactById, upsertArtifact, updateSettings }),
    [artifactIndex, settings, reloadIndex, getArtifactById, upsertArtifact, updateSettings],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppState = (): AppState => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used under AppProvider');
  return ctx;
};
