---
id: tr-oi53
status: closed
deps: []
links: []
created: 2026-04-09T00:14:05Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Use ITEM_SIZE_LARGE on all button GridTemplates

Add .setItemSize(GridTemplate.ITEM_SIZE_LARGE) to every GridTemplate.Builder that displays buttons/favorites. Three locations:

1. MainCarScreen.kt — favorites GridTemplate (~line 47)
2. MainCarScreen.kt — buildButtonList GridTemplate (~line 142)
3. ButtonListScreen.kt — GridTemplate (~line 46)

Do not touch ListTemplate or MessageTemplate builders.

## Acceptance Criteria

All three GridTemplate builders call setItemSize(GridTemplate.ITEM_SIZE_LARGE).

