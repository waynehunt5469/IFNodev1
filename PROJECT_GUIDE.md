# IFMedium / IFNode Project Guide (Alignment)

This repo implements **IFNode (IFMedium Node v1)** — a mobile-first, intent-fidelity message viewer/interpreter.

This document is the canonical alignment reference across ChatGPT/Codex/Claude and across chats.

---

## 1) Core Philosophy (Non-Negotiable)

- IFNode does **not** read minds.
- All interpretations are **probabilistic hypotheses**, never truths.
- The original text is preserved unchanged and always accessible.
- “Confidence” means **confidence in interpretation**, not correctness.
- The system is **non-authoritative**: it does not adjudicate who is right.
- Users may override selected inferred metadata.
- The goal is interpretive visibility and reduced distortion, not persuasion.

If any change conflicts with this philosophy, do not implement it.

---

## 2) Current Constraints & Workflow

Hard constraints:
- **Expo SDK 54** (compatible with Expo Go v54).
- Tunnel and LAN dev server are **not used**.
- Delivery to phone is **EAS Update (OTA)** from GitHub Codespaces.
- Local-only storage (on device). No auth, no cloud in V1.

Working workflow:
1) Develop in GitHub Codespaces in the Expo project folder.
2) Verify with: `npx tsc --noEmit`
3) Publish to phone with: `eas update --branch main --message "<msg>"`
4) On phone: Expo Go → Profile (same Expo account) → Projects → open/reload.

All instructions and README steps must assume EAS Update delivery.

---

## 3) V1 Product Scope (Keep Small, Stable)

V1 is a **single-message analysis** tool.

User flow:
1) Paste/type a message.
2) Press **Analyze** (no live analysis).
3) View in tabs:
   - **Raw**
   - **Tone**
   - **Intent**
   - **Risk**
4) Tap segments to open an Inspector.
5) Override selected metadata.
6) Save locally.
7) Import/export JSON of saved artifacts.

No full messaging network, no accounts, no cloud sync in V1.

---

## 4) Data Model: IFArtifact v0.1

We store and export a structured artifact containing:
- raw message text
- nested segmentation
- inferred metadata
- user overrides (stored separately)
- provenance (analyzer provider/version)

Hierarchy:
- paragraph → sentence → phrase → token

Warnings (V1 only):
- `ambiguous_phrasing`
- `emotionally_loaded_wording`

Speech acts (Prime-aligned fixed set of 15):
1 Observe
2 Interpret
3 Feel
4 Need
5 Request
6 Boundary
7 Warn
8 Repair
9 Commit
10 Question
11 Correct
12 Accuse
13 Defend
14 Reflect
15 Uncertain

Confidence bucket (0..4) maps to a circle icon:
- 0 empty ○ (very low)
- 1 ◔ (low)
- 2 ◑ (moderate)
- 3 ◕ (high)
- 4 ● (very high, never “certainty”)

Empty and full should be uncommon relative to middle buckets.

---

## 5) Analyzer Architecture (Pluggable)

- V1 uses a deterministic **MockAnalyzer** (no network).
- Analyzer must be pluggable via a clean interface so a real provider can be added later.
- All inferred outputs must carry confidence buckets and be editable where allowed.

---

## 6) UI Principles

The UI should feel:
- clean and analytical
- warm and humane
- visually semantic (size/color/weight/overlays)
- not gamified
- not alarmist

Mode-dependent color meaning:
- **Tone** view uses an emotional palette.
- **Risk** view uses a diagnostic palette.
- **Intent** view uses phrase overlays + speech-act badges.

Inspector must include:
- warning explanations in plain language
- “Confidence in interpretation, not correctness.”

---

## 7) Development Discipline (How we work)

When giving instructions or implementing changes:
- Do not jump ahead multiple refactors.
- Prefer one step at a time.
- Terminal instructions should be **one line per step**.
- Protect stability: commit/tag a reset point before major changes.

---

## 8) Strategy: Golden Reference + Mobile Port

We maintain two helpful tracks:
- A fast UI/behavior reference (e.g., HTML prototype) as the “golden reference.”
- The Expo app as the mobile deployment vehicle.

We do not rebuild blindly. We port validated UX patterns into Expo.

---

## 9) Decision Rule (Avoid Drift)

Good changes:
- increase clarity
- make uncertainty explicit
- preserve inspectability
- keep user agency over interpretations

Bad changes:
- hidden scoring systems (toxicity/morality)
- fake precision
- feature creep that destabilizes V1
- authority claims about intent

---

## 10) Long-Term Direction (Do Not Overbuild Now)

IFNode will eventually support:
- two-way exchanges
- compare view
- audience view
- networked IFMedium nodes

But V1 remains small and stable.

