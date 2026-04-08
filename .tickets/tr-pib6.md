---
id: tr-pib6
status: closed
deps: []
links: []
created: 2026-04-08T23:31:55Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Fix Android Auto crash: move 'Browse all panes' from action strip to grid tile

In plugins/android-auto/MainCarScreen.kt, the favorites branch (line 23) builds a GridTemplate whose ActionStrip has two custom-titled actions, violating the Android Auto limit of 1. This crashes the app whenever any button is marked as a favorite.

Fix: In the favorites branch, after the favorites for-loop (line 34), append a GridItem to listBuilder titled "All panes" with an onClickListener that pushes ScreenListScreen(carContext). Use colorCircleIcon for its image. Then remove the second addAction block (the "Browse all panes" action, lines 48-55) from the ActionStrip so only "Refresh" remains.

Non-goals: Do not touch any other code path or file. Do not refactor the action strip pattern used elsewhere.

## Acceptance Criteria

The ActionStrip in the favorites GridTemplate contains exactly one action (Refresh). A GridItem labeled 'All panes' appears at the end of the favorites grid and navigates to ScreenListScreen on click.

