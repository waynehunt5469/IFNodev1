# IFNode (IFMedium Node v1)

A minimal Expo SDK 54 mobile app for single-message intent-fidelity analysis. IFNode preserves original text, runs deterministic local mock analysis, visualizes uncertainty-aware semantics, supports user overrides, and stores artifacts locally.

## Core Principles

- IFMedium does not read minds. Interpretations are hypotheses under uncertainty.
- Confidence indicates confidence in interpretation, not correctness.
- Original text is preserved unchanged.

## Tech Stack

- Expo SDK 54 (React Native)
- TypeScript
- React Navigation
- AsyncStorage for local persistence
- Expo File System + Document Picker + Sharing for JSON export/import

## Run in Codespaces

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Expo:
   ```bash
   npm run start
   ```
3. For OTA workflow with Expo Go + EAS Updates (no LAN/tunnel requirement):
   - Configure `app.json` with your real `updates.url` and `extra.eas.projectId`.
   - Publish updates:
     ```bash
     npx eas update --branch production --message "IFNode update"
     ```

## App Structure

- `App.tsx`: app providers and navigator root
- `src/navigation/AppNavigator.tsx`: stack + tabs
- `src/screens/*`: Home, New Analysis, Analysis, Settings
- `src/components/*`: semantic renderer, inspector modal, confidence icon, tab switcher
- `src/analyzers/*`: analyzer interface, deterministic mock analyzer, future OpenAI stub
- `src/storage/*`: artifact/settings persistence
- `src/types/schema.ts`: IFArtifact v0.1 schema + analysis types
- `src/utils/importExport.ts`: export/import JSON flows

## IFArtifact Schema

The schema is defined in `src/types/schema.ts`.

Top-level format version: `IFArtifact-0.1`.

Includes:
- immutable source text (`originalText`)
- nested segmented structure (`segments`)
- analysis output snapshot (`analysis`)
- user overrides (`userOverrides`) applied at render time
- local provenance metadata (`provenance`)

## Add a Real Analyzer Later

1. Implement `Analyzer` interface in `src/analyzers/interface.ts`.
2. Add provider implementation (example stub in `src/analyzers/openAIAnalyzer.stub.ts`).
3. Update `getAnalyzer` in `src/analyzers/index.ts` to select provider.
4. Keep output format compatible with `AnalyzeOutput`.

## Notes

- Mobile-first V1; no web target required.
- Storage is local only (no auth, no cloud).
- JSON import handles collisions by regenerating IDs.
