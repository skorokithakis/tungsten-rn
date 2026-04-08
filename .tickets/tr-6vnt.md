---
id: tr-6vnt
status: closed
deps: []
links: []
created: 2026-04-08T17:14:43Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Add auto_favorite field to TypeScript Button interface and YAML parser

Add optional 'auto_favorite' boolean to the Button interface in screensStore.tsx. Parse it from YAML in parser.ts (default false). It flows through AsyncStorage naturally since it's just another JSON field.

## Acceptance Criteria

Button interface has auto_favorite?: boolean. YAML buttons with auto_favorite: true produce Button objects with the field set.

