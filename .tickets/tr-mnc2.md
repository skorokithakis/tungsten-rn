---
id: tr-mnc2
status: closed
deps: [tr-aa7h]
links: []
created: 2026-04-08T22:00:05Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Convert per-screen button list from ListTemplate to GridTemplate

In ButtonListScreen.kt, change the button list rendering to use GridTemplate with GridItem instead of ListTemplate with Row. Same pattern as the favorites view: colored circle CarIcon + label as primary text. Keep the Back header action. Keep Refresh in the action strip. Empty state (MessageTemplate) stays unchanged.

