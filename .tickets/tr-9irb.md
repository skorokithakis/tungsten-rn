---
id: tr-9irb
status: closed
deps: [tr-b2ig]
links: []
created: 2026-04-08T13:57:32Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Restore Android Auto plugin compatibility

Adjust the custom Expo Android Auto plugin only where the Expo SDK 53 generated Android project differs from SDK 52. Scope includes the plugin and bundled native template files it copies if required. Non-goals: expanding Android Auto features or refactoring storage behavior beyond compatibility fixes.

## Design

Keep the plugin strategy intact. Prefer the smallest change that keeps dependency injection and generated file patching working against the new Expo output.

## Acceptance Criteria

The custom Android Auto plugin applies successfully against the SDK 53 generated Android project and preserves existing Android Auto behavior.

