---
id: tr-b2ig
status: closed
deps: []
links: []
created: 2026-04-08T13:57:32Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Upgrade Expo SDK to 53

Upgrade the app from Expo SDK 52 to Expo SDK 53 and align SDK-coupled Expo packages. Scope includes package manifests and Expo config only as needed for the version bump. Non-goals: feature work, native redesign, or unrelated dependency churn.

## Acceptance Criteria

The repository depends on Expo SDK 53-compatible package versions and no longer relies on SDK 52 for Android release builds.

