---
name: retrieve-knowledge
description: Wiki-first retrieval for implementation and debugging. Use for any non-trivial coding task. Skip for trivial changes (formatting-only, obvious renames, isolated low-risk edits) unless KB retrieval is explicitly requested.
skip_when: trivial edits, formatting-only, obvious renames, isolated low-risk changes
---

# Retrieve Knowledge

Goal: lazy memory - compiled decision context first, full notes only when needed. The agent should rely on returned packets as directly fed working context instead of recomputing decisions from source code or long wiki prose.

## Retrieval checklist

1. Invoke the active wiki search tool, commonly exposed as `wiki-manager_wiki_search`, with an intent-rich query: `<task> <component> <contract> <constraint>`. Prefer returned `record_type: packet` results because they contain normalized decision-ready rules. Run 1-2 variants; do not repeat equivalent queries.
2. Read compiled packet fields before prose. Adopt `rule`, `do`, `do_not`, `confidence`, `needs_verification`, `source`, `last_verified`, and `applies_to` when present. Treat `semantic_metadata` as supporting context and non-compiled hits as fallback evidence.
3. Check `last_verified:` on top-hit notes. If missing or older than 90 days, or if a compiled packet says `needs_verification: true`, flag as potentially stale.
   - Code verification is sufficient when the note's rule maps cleanly to one current implementation point and verification confirms the note is still correct.
   - A wiki update is mandatory when verification shows behavior changed, scope widened/narrowed, terminology drifted, or the old note omitted a rule you needed to finish the task.
   - If you cannot verify current behavior quickly, treat the note as advisory rather than authoritative and surface the uncertainty.
4. Use compiled packet context as the default source of truth. Do not fetch full notes merely to feel safer when a current high-confidence packet contains a concrete rule and the planned change stays within its boundary. Escalate to the source note only if:
   - snippets conflict between notes
   - a hard rule, path, or command is missing
   - change touches security/auth, data migration, or infra reliability
   - user requests exhaustive coverage
   - otherwise, do not fetch the full note
5. Before escalating, confirm all are true for compiled-packet or snippet-only sufficiency:
   - source scope is appropriate (`project-specific` > `platform` > `general`)
   - at least one packet or snippet contains a concrete rule, not only navigation text
   - no unresolved contradiction across top hits
   - planned change stays within the rule boundary
   - if all are true, treat the snippet as sufficient and stop retrieval
6. If search returns broad file discovery instead of actionable context packets, refine in this order:
   - exact terms from returned context packets
   - exact note title or heading terms from the top hit
   - nearby wiki index entries and related note titles
   - project alias terms already used in the snippets
   - domain plus constraint (`placement`, `mapping`, `registration`, `route`, `search`)
   - narrower scope terms (`feature`, `foundation`, `runbook`, `architecture`)
   - only then invoke the active wiki list/read tools, commonly exposed as `wiki-manager_wiki_list` and `wiki-manager_wiki_read`, to inspect the smallest promising set of notes
7. Budget: for routine tasks, use 1-3 search calls, top 1-3 hits per call, 0-1 full-note fetches per task slice, and max `top_k` 12. Reuse prior reads when scope is unchanged.
   - Hard-retrieval fallback budget: one additional query variant, one additional focused full-note read, or one temporary `top_k` increase above 12 when earlier queries proved recall is the blocker.
   - If that fallback still does not produce an actionable rule, stop broadening retrieval and switch to `wiki-maintenance` skill or surface the gap explicitly.
8. Conflicts: prefer narrower-scope notes; prefer active runbooks for procedures. Flag conflicts for `wiki-maintenance` skill.

## Follow-up retrieval trigger

Re-enter retrieval any time during the same task when any of the following appears:

- a new subtopic, constraint, or implementation decision emerges that was not covered by the original wiki pass
- an unfamiliar component, convention, tool, package, framework area, deployment path, content model, route, search/indexing path, auth boundary, or data contract becomes relevant
- code, tests, or inspection reveal behavior that does not match the retrieved rule
- the task expands into a different domain slice with its own searchable contract or placement rules
- the agent starts inferring durable architecture from code because no packet is currently in session context

When re-entering, run a fresh targeted wiki search for that new slice and re-check `last_verified:` before editing it. Reuse earlier reads only if the scope is still unchanged. Retrieval is not a one-time gate; it is available whenever new knowledge would reduce guesswork.

## Write-back trigger (mandatory)

After completing a task, if implementation revealed behavior not reflected in any retrieved packet or note, trigger `wiki-maintenance` skill (enrich path) in the same session. Do not defer. Store reusable conclusions as decision-ready wiki notes so future agents receive packets instead of rediscovering the same behavior.

## MCP availability

Use the wiki MCP tools as the default retrieval interface. Tool names vary by agent; the common MCP-prefixed names are `wiki-manager_wiki_search`, `wiki-manager_wiki_read`, `wiki-manager_wiki_list`, and `wiki-manager_wiki_write`.

When the tool is present in the active tool surface, invoke it through the agent/client's native tool-call mechanism. Do not print a JSON object such as `{"name":"wiki-manager_wiki_search","arguments":{...}}` as a substitute for executing the tool.

If the wiki MCP tools are not present in the active tool surface, use the agent/client's tool discovery mechanism if one exists before falling back to direct wiki file reads.
Treat direct wiki file reads as fallback verification, not as the primary retrieval path.

## Evidence checkpoint (required before edits)

Use this format before editing:

- Query: `...`
- Section(s) read:
  - context packet from `Note.md` or `Note.md#Heading`
- `last_verified:` of source note: `YYYY-MM-DD` | missing
- Confidence / verification: `high` | `medium` | `needs_verification`
- Adopted rule/pattern: `...`
- Gap or ambiguity: `none` | `...`
- Full-note fetch required: `yes` (reason) | `no`

If a full-note read occurs, the reason must map to one of the escalation conditions above; otherwise treat the read as unnecessary and tighten retrieval behavior on the next step.
