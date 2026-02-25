import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { IFArtifact } from '../types/schema';
import { loadAllArtifacts, mergeImportedArtifacts } from '../storage/artifactStorage';

export const exportAllArtifacts = async (): Promise<boolean> => {
  const artifacts = await loadAllArtifacts();
  const json = JSON.stringify(artifacts, null, 2);
  const targetPath = `${FileSystem.cacheDirectory}ifnode-artifacts-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(targetPath, json, { encoding: FileSystem.EncodingType.UTF8 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(targetPath, {
      mimeType: 'application/json',
      dialogTitle: 'Export IFNode artifacts',
    });
    return true;
  }
  return false;
};

export const exportSingleArtifact = async (artifact: IFArtifact): Promise<boolean> => {
  const json = JSON.stringify([artifact], null, 2);
  const targetPath = `${FileSystem.cacheDirectory}ifnode-artifact-${artifact.artifactId}.json`;
  await FileSystem.writeAsStringAsync(targetPath, json, { encoding: FileSystem.EncodingType.UTF8 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(targetPath, {
      mimeType: 'application/json',
      dialogTitle: 'Export IFNode artifact',
    });
    return true;
  }
  return false;
};

export const importArtifactsFromJson = async (): Promise<number> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) return 0;
  const asset = result.assets[0];
  if (!asset) return 0;
  const jsonRaw = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
  const parsed = JSON.parse(jsonRaw) as IFArtifact[];
  if (!Array.isArray(parsed)) return 0;
  return mergeImportedArtifacts(parsed);
};
