# Tungsten — agent orientation

## What the app is

Tungsten is a configurable remote-control Android app. Users import YAML config files from URLs. Each file defines one or more screens containing grids of labeled buttons. Pressing a button fires an HTTP POST to a configured URL. Primary use case is home automation.

## Configuration

Config is downloaded YAML. Each YAML document is one screen with a `title` and a `ui` array of buttons. Button fields:

- `label` — button text
- `span` — column width (1–6 grid)
- `height` — row height
- `url` — POST target
- `auto_favorite` — (optional) surfaces button in Android Auto

Separators are buttons with an empty label and `span: 6`.

Parsed by `src/services/yaml/parser.ts` using `js-yaml`. Screens are stored in AsyncStorage under the key `@screens`.

## Phone UI

Single-screen layout with:

- Horizontal tab bar for switching screens
- 6-column flexbox button grid (splits into two columns in landscape)
- Swipe gestures for screen navigation
- Modal for importing new YAML URLs

State is managed via React Context + `useReducer` in `src/stores/screensStore.tsx`.

## Android Auto

Native Kotlin layer lives in `plugins/android-auto/`, injected at prebuild by the Expo config plugin `plugins/withAndroidAuto.js`. It reads screen data directly from AsyncStorage's backing SQLite database (RKStorage) — no JS bridge involved.

- Root screen shows favorites (`auto_favorite: true`) as a grid, or falls back to a screen list.
- Button taps fire HTTP POSTs via `CarActionExecutor`.
- Registered under the IOT car app category.
- Key constraint: `GridTemplate` action strips allow max 1 action with a custom title.

## Architecture notes

- Android-only. Expo managed workflow; no committed `android/` directory.
- All native code is injected via the config plugin at prebuild time.
- AsyncStorage is the shared data layer between RN and Android Auto (via direct SQLite access).
- Two Axios instances exist; `src/services/client.ts` is the active one.
- Build via EAS using the `./build` script.

## Key paths

| Path | Purpose |
|---|---|
| `app/(tabs)/index.tsx` | Main phone UI |
| `src/stores/screensStore.tsx` | App state (Context + useReducer) |
| `src/services/yaml/parser.ts` | YAML config parsing |
| `plugins/android-auto/` | Android Auto native (Kotlin) |
| `plugins/withAndroidAuto.js` | Config plugin — native injection |
