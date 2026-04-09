---
id: tr-23tj
status: closed
deps: []
links: []
created: 2026-04-09T00:14:12Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Replace 'All panes' colored circle with a grid icon

In MainCarScreen.kt, the 'All panes' GridItem currently uses colorCircleIcon('All panes'). Replace it with a distinct icon: a 2x2 grid of rounded squares drawn on a bitmap, similar to how colorCircleIcon works.

Add a new function (e.g. gridIcon()) in ColorCircleIcon.kt that creates a 128x128 bitmap and draws four evenly-spaced rounded squares in a neutral color (white or light gray, e.g. 0xFFBDBDBD). Then use it in MainCarScreen.kt for the 'All panes' item instead of colorCircleIcon.

Non-goals: do not add drawable XML resources or change the config plugin.

## Acceptance Criteria

The 'All panes' GridItem uses the new grid icon function instead of colorCircleIcon.

