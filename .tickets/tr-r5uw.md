---
id: tr-r5uw
status: closed
deps: []
links: []
created: 2026-04-08T23:35:04Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Add AGENTS.md with app overview for AI agents

Create an AGENTS.md at the repo root. It should give an AI agent immediate orientation on the app. Cover these topics concisely:

**What the app is**: Tungsten is a configurable remote-control Android app. Users import YAML config files from URLs; each file defines one or more 'screens' containing grids of labeled buttons. Pressing a button fires an HTTP POST to a configured URL. Primary use case is home automation.

**Configuration**: Downloaded YAML files. Each YAML document = one screen with a title and a ui array of buttons. Buttons have label, span (1-6 column grid), height, url, and optional auto_favorite (for Android Auto). Separators are buttons with empty label and span 6. Parsed by src/services/yaml/parser.ts using js-yaml. Screens are stored in AsyncStorage under key @screens.

**Phone UI**: Single-screen layout with a horizontal tab bar for switching screens, a 6-column flexbox button grid (splits into two columns in landscape), swipe gestures for screen navigation, and a modal for importing new YAML URLs. State managed via React Context + useReducer in src/stores/screensStore.tsx.

**Android Auto**: Native Kotlin layer in plugins/android-auto/, injected at prebuild by the Expo config plugin plugins/withAndroidAuto.js. Reads screen data directly from AsyncStorage's backing SQLite database (RKStorage) — no JS bridge. Root screen shows favorites (buttons with auto_favorite: true) as a grid, or falls back to a screen list. Button taps fire HTTP POSTs via CarActionExecutor. Registered under the IOT car app category. Key constraint: GridTemplate action strips allow max 1 action with a custom title.

**Architecture notes**: Android-only. Expo managed workflow, no committed android/ directory. All native code injected via config plugin. AsyncStorage is the shared data layer between RN and Android Auto (via direct SQLite access). Two Axios instances exist (src/services/client.ts is the active one). Build via EAS (./build script).

**Key paths**: app/(tabs)/index.tsx (main UI), src/stores/screensStore.tsx (state), src/services/yaml/parser.ts (config parsing), plugins/android-auto/ (car UI), plugins/withAndroidAuto.js (native injection).

Write it in a direct, scannable style. No filler. Use short sections with headers. Keep it under ~80 lines.

## Acceptance Criteria

AGENTS.md exists at repo root, covers all listed topics, is concise and scannable.

