import AsyncStorage from '@react-native-async-storage/async-storage';
import { IFArtifact, ArtifactListItem } from '../types/schema';
import { createId } from '../utils/ids';

const INDEX_KEY = 'ifnode:artifact-index';
const ARTIFACT_KEY = (id: string) => `ifnode:artifact:${id}`;

const toListItem = (artifact: IFArtifact): ArtifactListItem => ({
  artifactId: artifact.artifactId,
  createdAt: artifact.createdAt,
  updatedAt: artifact.updatedAt,
  title: artifact.originalText.slice(0, 40) || 'Untitled message',
  topIntent: artifact.analysis.intentSnapshot.text,
});

export const loadArtifactIndex = async (): Promise<ArtifactListItem[]> => {
  const raw = await AsyncStorage.getItem(INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ArtifactListItem[];
    return parsed.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  } catch {
    return [];
  }
};

export const saveArtifact = async (artifact: IFArtifact): Promise<void> => {
  await AsyncStorage.setItem(ARTIFACT_KEY(artifact.artifactId), JSON.stringify(artifact));
  const index = await loadArtifactIndex();
  const item = toListItem(artifact);
  const withoutCurrent = index.filter((i) => i.artifactId !== artifact.artifactId);
  withoutCurrent.unshift(item);
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(withoutCurrent));
};

export const loadArtifact = async (id: string): Promise<IFArtifact | null> => {
  const raw = await AsyncStorage.getItem(ARTIFACT_KEY(id));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as IFArtifact;
    if (parsed.version !== 'IFArtifact-0.1') return null;
    return parsed;
  } catch {
    return null;
  }
};

export const loadAllArtifacts = async (): Promise<IFArtifact[]> => {
  const index = await loadArtifactIndex();
  const artifacts = await Promise.all(index.map((item) => loadArtifact(item.artifactId)));
  return artifacts.filter((a): a is IFArtifact => !!a);
};

export const mergeImportedArtifacts = async (incoming: IFArtifact[]): Promise<number> => {
  const existing = await loadArtifactIndex();
  const existingSet = new Set(existing.map((i) => i.artifactId));
  let importedCount = 0;

  for (const artifact of incoming) {
    if (artifact.version !== 'IFArtifact-0.1') continue;
    let resolved = artifact;
    if (existingSet.has(artifact.artifactId)) {
      resolved = {
        ...artifact,
        artifactId: createId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    await saveArtifact(resolved);
    existingSet.add(resolved.artifactId);
    importedCount += 1;
  }

  return importedCount;
};
