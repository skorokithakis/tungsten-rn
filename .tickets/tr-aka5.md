---
id: tr-aka5
status: closed
deps: []
links: []
created: 2026-04-08T17:14:47Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Add auto_favorite field to Kotlin ButtonData and parse from JSON

Add 'autoFavorite' boolean (default false) to the ButtonData data class in CarDataStore.kt. Parse it from the JSON key 'auto_favorite' using optBoolean.

## Acceptance Criteria

ButtonData has autoFavorite field. JSON with auto_favorite: true produces ButtonData with autoFavorite = true.

