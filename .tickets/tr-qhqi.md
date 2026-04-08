---
id: tr-qhqi
status: closed
deps: []
links: []
created: 2026-04-07T22:24:01Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Fix config plugin idempotency in withAndroidAuto.js

The Expo config plugin in plugins/withAndroidAuto.js uses existence checks that prevent updates to already-generated values. Two functions need upsert logic instead of insert-if-missing:

1. withAndroidAutoBuildGradle (line ~95): Currently checks gradle.includes('androidx.car.app:app') and skips if found. Change to: if the dependency already exists, replace the version string in-place (regex match on the version portion); if it doesn't exist, insert it as before.

2. withAndroidAutoManifest (line ~73): Currently checks if minCarAppApiLevel meta-data exists and skips if found. Change to: if the meta-data exists, update its android:value; if it doesn't exist, add it as before.

Non-goals: Do not change the library version number, minCarAppApiLevel value, Kotlin files, XML files, or any other plugin logic. Only fix the two upsert paths.

## Acceptance Criteria

Both withAndroidAutoBuildGradle and withAndroidAutoManifest correctly update existing values on re-prebuild (not just insert when missing). No other behavioral changes.

