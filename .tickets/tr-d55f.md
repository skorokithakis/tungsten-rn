---
id: tr-d55f
status: closed
deps: []
links: []
created: 2026-04-08T16:16:43Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Fix Android Auto manifest metadata key

The config plugin uses the wrong metadata key name. Change 'androidx.car.app.minCarAppApiLevel' to 'androidx.car.app.minCarApiLevel' on both line 75 and line 83 of plugins/withAndroidAuto.js. This is the sole cause of the 'unexpected error' crash on Android Auto — the Car App Library v1.7.0 expects minCarApiLevel (no 'App' in the middle).

## Acceptance Criteria

Both occurrences of the metadata key in withAndroidAuto.js use 'androidx.car.app.minCarApiLevel'.

