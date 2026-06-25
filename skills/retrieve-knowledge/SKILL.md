---
name: retrieve-knowledge
description: Wiki-first retrieval for non-trivial implementation/debugging. Skip trivial, isolated, low-risk edits unless KB retrieval is requested.
skip_when: trivial edits, formatting-only, obvious renames, isolated low-risk changes
---

# Retrieve Knowledge

Goal: get decision-ready wiki context before non-trivial edits without loading long notes unnecessarily.

## Checklist

1. If the task is broad or does not name a component, run the orientation pass first.
2. Search wiki with 1-2 intent-rich queries: `<task> <component> <contract> <constraint>`.
3. For concrete tasks that may be governed by repo-wide conventions, run a guardrail query.
4. Prefer `record_type: packet` results. Read `kind`, `rule`, `source`, `last_verified`, `confidence`, `needs_verification`, `applies_to`, and `gaps`.
5. Use packet fields by `kind`: `do` / `do_not` for rules, `decision` / `rationale` / `consequences` for decisions, `summary` / `key_facts` for references, `steps` for runbooks, and `terms` / `aliases` for glossaries. Treat `rule` as the compact packet headline for all kinds.
6. Treat high-confidence current packets as enough when they give concrete guidance and the planned change stays within scope.
7. Do not force all wiki context into rules. Reference and decision packets can be sufficient when the task needs facts or rationale rather than mandatory behavior.
8. Read full notes only for conflicts, missing hard rules, security/auth, data migration, infra reliability, or explicit exhaustive review.
9. If `last_verified` is missing/older than 90 days, `needs_verification` is true, or `gaps` mention missing typed-note structure, verify against code before relying on it.
10. Re-enter retrieval only when a new domain slice, unfamiliar component, contradiction, or durable architecture inference appears.
11. Use active wiki MCP tools (`wiki_search`, `wiki_read`, `wiki_list`) through native tool calls; if absent, use tool discovery before direct wiki file reads.

## Guardrail Query

Use this for concrete tasks when the work might cross repo-wide rules even
though the component is known. Good triggers include public API changes, data
model changes, migrations, auth/security, validation, error handling, caching,
startup/configuration, tests, build/deployment, shared UI patterns, generated
code, or edits touching multiple modules.

1. Run one focused standards query using the task type and known slice:
   `<component> <task type> coding standards architecture constraints placement rules`.
2. Prefer `kind: rule` and `kind: decision` packets with matching `applies_to`.
3. Adopt only packets that directly constrain the planned edit. Ignore broad
   background packets unless they expose a hard rule, architectural decision, or
   stale/conflicting guidance that needs verification.
4. Do not read full global notes for routine concrete work unless the packet says
   a hard rule exists but omits the actionable detail.

## Orientation Pass

Use this only when the user asks for broad work such as "clean this up",
"improve the API", "fix the page", or "review the implementation" without
naming the component, contract, or constraint.

1. Run one repository-map query: `project overview architecture coding standards placement rules`.
2. Run one task-shape query using the user's verb and likely work type:
   `<task verb> implementation conventions testing validation API UI data auth`.
3. Prefer packets from `index`, `architecture`, `coding-standards`, `glossary`,
   and placement-rule notes. These notes should route the agent to relevant
   areas; they should not require loading the whole wiki.
4. Adopt only the top 1-3 directly relevant packets. Do not read broad full
   notes unless packets conflict, are stale, identify required gaps, or mention
   hard rules that are not present in the packet.
5. After a quick code inspection reveals a concrete component, route, model,
   migration, auth boundary, or unfamiliar subsystem, run one focused query for
   that slice and continue with the normal checklist.

## Budgets

- Routine task: 1-3 searches, top 1-3 hits, 0-1 full-note reads per task slice.
- Concrete task with cross-cutting risk: routine budget plus 1 guardrail query.
- Broad or ambiguous task: orientation pass, then 1 focused search after code inspection.
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
