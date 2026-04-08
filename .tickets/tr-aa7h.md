---
id: tr-aa7h
status: closed
deps: []
links: []
created: 2026-04-08T21:59:52Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Add color circle icon generator utility

Create a Kotlin utility that generates a solid colored circle Bitmap/CarIcon from a button label string. Hash the full label to deterministically pick a color from a hardcoded palette of ~10-12 visually distinct colors. Use Android Canvas to draw a filled circle onto a Bitmap, then wrap it as a CarIcon via IconCompat. This will be used by GridItem as the image. Keep it simple: one function that takes a label string and returns a CarIcon.

## Acceptance Criteria

Given the same label, always returns the same color. Different labels produce reasonably distinct colors across the palette.

