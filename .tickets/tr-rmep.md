---
id: tr-rmep
status: closed
deps: []
links: []
created: 2026-04-08T16:16:48Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Guard against empty ItemList in car screens

In MainCarScreen.kt:buildButtonList() and ButtonListScreen.kt:onGetTemplate(), if all buttons have blank labels (separators), the ItemList ends up empty and ListTemplate.setSingleList() throws. After the button loop, check if no items were added and return a MessageTemplate fallback instead (e.g. 'No buttons configured' with a Refresh action). Apply to both files.

## Acceptance Criteria

A screen with only blank-label buttons renders a MessageTemplate instead of crashing.

