---
id: tr-12yg
status: closed
deps: [tr-aa7h]
links: []
created: 2026-04-08T22:00:01Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Convert favorites view from ListTemplate to GridTemplate

In MainCarScreen.kt, change the favorites rendering path to use GridTemplate with GridItem instead of ListTemplate with Row. Each favorite button becomes a GridItem with: the colored circle CarIcon from the icon generator utility as the image, and the button label as primary text. The 'Browse all panes' entry at the end should remain as-is — move it to the GridTemplate's header action strip or keep it accessible (GridTemplate supports a header with actions). Keep the Refresh action in the action strip. Keep the HTTP POST on-click behavior via CarActionExecutor. Empty state (MessageTemplate) stays unchanged.

## Design

GridTemplate does not support mixing grid items with a navigation row. For 'Browse all panes', add it as an Action in the header's action strip instead of a grid item. The header already supports actions.

