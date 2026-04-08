---
id: tr-4f1s
status: closed
deps: [tr-6vnt, tr-aka5]
links: []
created: 2026-04-08T17:14:52Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Show favorites at Android Auto root screen with Browse all panes row

Update MainCarScreen.kt: collect all ButtonData with autoFavorite=true across all screens. If any exist, render them as Row items in a ListTemplate at the root. Add a 'Browse all panes' row at the bottom that pushes a new screen showing the current pane list (extract the existing pane list logic into a separate screen, or reuse it). If no favorites, preserve current behavior. Skip blank-label buttons from favorites.

## Acceptance Criteria

Buttons with auto_favorite: true appear at root. 'Browse all panes' row at bottom navigates to the pane list. No favorites falls back to current behavior.

