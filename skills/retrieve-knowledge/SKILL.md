---
name: retrieve-knowledge
description: Wiki-first retrieval for implementation and debugging. Use for any non-trivial coding task. Skip for trivial changes (formatting-only, obvious renames, isolated low-risk edits) unless KB retrieval is explicitly requested.
skip_when: trivial edits, formatting-only, obvious renames, isolated low-risk changes
---

# Retrieve Knowledge

Goal: lazy memory - actionable rules from snippets first, full notes only when needed.

## Retrieval checklist

1. Run `wiki_search` with an intent-rich query: `<task> <component> <contract> <constraint>`. Run 1-2 variants; do not repeat equivalent queries.
2. Check `last_verified:` on top-hit notes. If missing or older than 90 days, flag as potentially stale.
   - Code verification is sufficient when the note's rule maps cleanly to one current implementation point and verification confirms the note is still correct.
   - A wiki update is mandatory when verification shows behavior changed, scope widened/narrowed, terminology drifted, or the old note omitted a rule you needed to finish the task.
   - If you cannot verify current behavior quickly, treat the note as advisory rather than authoritative and surface the uncertainty.
3. Use snippet context as the default source of truth. Escalate to a full note only if:
   - snippets conflict between notes
   - a hard rule, path, or command is missing
   - change touches security/auth, data migration, or infra reliability
   - user requests exhaustive coverage
   - otherwise, do not fetch the full note
4. Before escalating, confirm all are true for snippet-only sufficiency:
   - source scope is appropriate (`project-specific` > `platform` > `general`)
   - at least one snippet contains a concrete rule, not only navigation text
   - no unresolved contradiction across top hits
   - planned change stays within the rule boundary
   - if all are true, treat the snippet as sufficient and stop retrieval
5. If search returns broad file discovery instead of actionable snippets, refine in this order:
   - exact note title or heading terms from the top hit
   - nearby wiki index entries and related note titles
   - project alias terms already used in the snippets
   - domain plus constraint (`placement`, `mapping`, `registration`, `route`, `search`)
   - narrower scope terms (`feature`, `foundation`, `runbook`, `architecture`)
   - only then use `wiki_list`/`wiki_read` to inspect the smallest promising set of notes
6. Budget: for routine tasks, use 1-3 search calls, top 1-3 hits per call, 0-1 full-note fetches per task slice, and max `top_k` 12. Reuse prior reads when scope is unchanged.
   - Hard-retrieval fallback budget: one additional query variant, one additional focused full-note read, or one temporary `top_k` increase above 12 when earlier queries proved recall is the blocker.
   - If that fallback still does not produce an actionable rule, stop broadening retrieval and switch to `wiki-maintenance` or surface the gap explicitly.
7. Conflicts: prefer narrower-scope notes; prefer active runbooks for procedures. Flag conflicts for `wiki-maintenance`.

## Write-back trigger (mandatory)

After completing a task, if implementation revealed behavior not reflected in any retrieved note, trigger `wiki-maintenance` (enrich path) in the same session. Do not defer.

## MCP availability

Use `mcp__kb` as the default retrieval interface.

## Evidence checkpoint (required before edits)

Use this format before editing:

- Query: `...`
- Section(s) read:
  - `Note.md#Heading`
- `last_verified:` of source note: `YYYY-MM-DD` | missing
- Adopted rule/pattern: `...`
- Gap or ambiguity: `none` | `...`
- Full-note fetch required: `yes` (reason) | `no`

If a full-note read occurs, the reason must map to one of the escalation conditions above; otherwise treat the read as unnecessary and tighten retrieval behavior on the next step.

## Cross-project use

Keep this skill repository-agnostic. Discover project-specific terms from the wiki, not from this skill. When MCP namespace differs from `mcp__kb`, apply the same lazy-memory policy to the equivalent tools.
