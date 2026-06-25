---
name: retrieve-knowledge
description: Wiki-first retrieval for non-trivial implementation/debugging. Skip trivial, isolated, low-risk edits unless KB retrieval is requested.
skip_when: trivial edits, formatting-only, obvious renames, isolated low-risk changes
---

# Retrieve Knowledge

Goal: get decision-ready wiki context before non-trivial edits without loading long notes unnecessarily.

## Checklist

1. Search wiki with 1-2 intent-rich queries: `<task> <component> <contract> <constraint>`.
2. Prefer `record_type: packet` results. Read `kind`, `rule`, `source`, `last_verified`, `confidence`, `needs_verification`, `applies_to`, and `gaps`.
3. Use packet fields by `kind`: `do` / `do_not` for rules, `decision` / `rationale` / `consequences` for decisions, `summary` / `key_facts` for references, `steps` for runbooks, and `terms` / `aliases` for glossaries. Treat `rule` as the compact packet headline for all kinds.
4. Treat high-confidence current packets as enough when they give concrete guidance and the planned change stays within scope.
5. Do not force all wiki context into rules. Reference and decision packets can be sufficient when the task needs facts or rationale rather than mandatory behavior.
6. Read full notes only for conflicts, missing hard rules, security/auth, data migration, infra reliability, or explicit exhaustive review.
7. If `last_verified` is missing/older than 90 days, `needs_verification` is true, or `gaps` mention missing typed-note structure, verify against code before relying on it.
8. Re-enter retrieval only when a new domain slice, unfamiliar component, contradiction, or durable architecture inference appears.
9. Use active wiki MCP tools (`wiki_search`, `wiki_read`, `wiki_list`) through native tool calls; if absent, use tool discovery before direct wiki file reads.

## Budgets

- Routine task: 1-3 searches, top 1-3 hits, 0-1 full-note reads per task slice.
- If search misses: try one focused query or one focused full-note read, then stop broadening and surface the gap.

## Write-Back

Use `wiki-maintenance` only when durable/reusable behavior is missing, stale, or contradictory and meets the `AGENTS.md` write-back threshold.

Use the maintenance path when a useful note lacks `kind`, uses the wrong note shape, mixes unrelated concerns, or would need repeated full-note reads because packet fields are weak.

Do not trigger wiki maintenance for one-off implementation details, cosmetic tweaks, routine fixes, typo fixes, isolated bug fixes with no reusable guidance, or task-specific outcomes. In those cases, briefly state that no wiki update was needed.

## Evidence Checkpoint

Before edits, record internally or briefly in the response only when useful:

- query
- packet/note source or explicit gap
- `kind`
- `last_verified`
- confidence / `needs_verification` / important `gaps`
- adopted guidance
