---
name: retrieve-knowledge
description: Wiki-first retrieval for non-trivial implementation/debugging. Skip trivial, isolated, low-risk edits unless KB retrieval is requested.
skip_when: trivial edits, formatting-only, obvious renames, isolated low-risk changes
---

# Retrieve Knowledge

Goal: get decision-ready wiki context before non-trivial edits without loading long notes unnecessarily.

## Checklist

1. Search wiki with 1-2 intent-rich queries: `<task> <component> <contract> <constraint>`.
2. Prefer `record_type: packet` results. Read `rule`, `do`, `do_not`, `source`, `last_verified`, `confidence`, `needs_verification`, and `applies_to`.
3. Treat high-confidence current packets as enough when they give a concrete rule and the planned change stays within scope.
4. Read full notes only for conflicts, missing hard rules, security/auth, data migration, infra reliability, or explicit exhaustive review.
5. If `last_verified` is missing/older than 90 days or `needs_verification` is true, verify against code before relying on it.
6. Re-enter retrieval only when a new domain slice, unfamiliar component, contradiction, or durable architecture inference appears.
7. Use active wiki MCP tools (`wiki_search`, `wiki_read`, `wiki_list`) through native tool calls; if absent, use tool discovery before direct wiki file reads.

## Budgets

- Routine task: 1-3 searches, top 1-3 hits, 0-1 full-note reads per task slice.
- If search misses: try one focused query or one focused full-note read, then stop broadening and surface the gap.

## Write-Back

Use `wiki-maintenance` only when durable/reusable behavior is missing, stale, or contradictory and meets the `AGENTS.md` write-back threshold.

Do not trigger wiki maintenance for one-off implementation details, cosmetic tweaks, routine fixes, typo fixes, isolated bug fixes with no reusable rule, or task-specific outcomes. In those cases, briefly state that no wiki update was needed.

## Evidence Checkpoint

Before edits, record internally or briefly in the response only when useful:

- query
- packet/note source or explicit gap
- `last_verified`
- confidence / `needs_verification`
- adopted rule
