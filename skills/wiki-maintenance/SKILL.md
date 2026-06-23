---
name: wiki-maintenance
description: Keep wiki notes current, well-structured, and retrieval-ready. Use when implementation reveals a knowledge gap (enrich path) or when retrieval quality or note structure needs improvement (optimize path). Replaces enrich-wiki and optimize-wiki.
skip_when: no gap found and retrieval quality is already adequate
---

# Wiki Maintenance

Two paths - pick one at the top of each use:

- **Enrich** - gap, stale note, or conflicting guidance found during implementation
- **Optimize** - retrieval quality or structural audit (poor search recall, mixed concerns, duplicated rules)

## Shared rules (both paths)

- Scope every note explicitly: `project-specific` | `platform` | `general`.
- Keep workflow mechanics in skills; keep wiki notes focused on domain truth, architecture decisions, and runbook procedures.
- One canonical location per rule - deduplicate on write.
- Update index links when a note is created, moved, or renamed.
- Set `last_verified:` frontmatter to today's date on every note you touch (see Staleness convention below).
- Make notes compile into decision-ready context: include `Decision`, `Do`, `Do not`, `Evidence`, and `Retrieval hints` sections, plus `scope`, `last_verified`, and preferably `id`, `status`, and `applies_to` frontmatter.
- Write complete, coherent notes with `wiki_write`; do not append fragments. Read the current note first, merge changes locally, then write the full Markdown document so frontmatter, headings, links, and retrieval hints remain consistent.
- Use the wiki MCP tools as the default retrieval interface during wiki maintenance. Tool names vary by agent; common MCP-prefixed names include `wiki-manager_wiki_search`, `wiki-manager_wiki_read`, `wiki-manager_wiki_list`, and `wiki-manager_wiki_write`.
- When a wiki MCP tool is present in the active tool surface, invoke it through the agent/client's native tool-call mechanism. Do not print a JSON object such as `{"name":"wiki-manager_wiki_search","arguments":{...}}` as a substitute for executing the tool.

## MCP image support contract

The wiki MCP server implementation should support this decision-ready retrieval layer:

- Parse frontmatter fields: `id`, `scope`, `last_verified`, `applies_to`, and `status`.
- Parse semantic sections: `Use this when`, `Decision`, `Do`, `Do not`, `Evidence`, and `Retrieval hints`.
- Compile each source note into a normalized context packet with `rule`, `confidence`, `source`, `last_verified`, `needs_verification`, `applies_to`, `do`, `do_not`, `evidence`, and `gaps`.
- Store compiled packets as first-class index records with semantic metadata such as `decision`, `constraints`, `anti_patterns`, `evidence`, `examples`, and `raw_prose`.
- Build packet embeddings from decision-ready sections (`Use this when`, `Decision`, `Do`, `Do not`, `Evidence`, `Retrieval hints`, `applies_to`) and keep `raw_prose` as metadata/fallback instead of the primary packet embedding text.
- Rank retrieval by semantic usefulness: packets first when they match, then decision/do/do-not/evidence-bearing chunks, then background prose.
- Return context packets from `wiki_search` before raw chunks when a packet matches the query.
- Flag stale or uncertain packets with `confidence: medium` and `needs_verification: true` when `last_verified` is missing, older than the staleness threshold, or evidence source files changed after verification.
- Keep standard wiki Markdown as the saved/editable format. Context packets may be internal derived index records; agents should not need to maintain generated wiki files.

## Required output

When you use this skill, record the result in the task response:

- Path used: `Enrich` | `Optimize`
- Notes touched
- Queries used
- What changed
- Why the change improves future retrieval or maintenance

For `Optimize`, also include:

- baseline query results before changes
- baseline query results after changes
- remaining misses or explicit statement that none remain

## Staleness convention

Every wiki note should carry this frontmatter:

```yaml
---
id: stable-note-id
scope: project-specific
last_verified: YYYY-MM-DD
status: active
applies_to:
  - domain-or-component
---
```

- Set it to today whenever you write or confirm a note's content is still current.
- During retrieval (`retrieve-knowledge`), if a top-hit note has no `last_verified` or it is older than 90 days, treat it as potentially stale: surface the age to the user and prefer code verification before adopting the rule.
- Do not rely on file modification dates - they change on trivial edits.

## Enrich path

**When:** search returns no actionable rule | snippets conflict and code resolves it | implementation changed behavior | repeated questions indicate missing guidance.

**Checklist:**
1. Classify scope: `project-specific` / `platform` / `general`.
2. Ask whether this belongs in the wiki at all. Keep it only if at least one is true:
   - a future implementation/debugging/maintenance task would likely need it again
   - it captures an architecture decision, constraint, or repeatable pattern
   - it improves retrieval by adding a durable alias, type name, heading, or canonical file/location
   Reject it when it is archival noise, a one-off sample, or trivia that will not improve future retrieval or maintenance.
3. Target: update an existing note unless no clear owner exists or scope would be overloaded.
4. Write the strict decision-ready shape:
   - `Use this when` - the task boundary where this note applies.
   - `Decision` - the rule an agent can follow without inferring from prose.
   - `Do` - concrete allowed/preferred actions.
   - `Do not` - concrete anti-patterns or forbidden placements.
   - `Evidence` - source paths, commands, or verification notes.
   - `Retrieval hints` - terms developers and agents are likely to query.
5. Use `wiki_write` with the complete note content. Do not rely on append-only edits for decision notes.
6. Set `last_verified:` to today.
7. Fix link hygiene: update index, fix moved/renamed references, keep anchors stable.
8. Attach evidence: query and section anchors that exposed the gap, what changed, why it closes future retrieval gaps.
9. Reject archival noise, one-off samples, and trivia that do not improve future retrieval or maintenance.

## Optimize path

**When:** search returns narrative over rules | notes mix architecture and runbooks | terminology drift causes poor recall | frequent full-note reads required | duplicated or stale guidance.

**Checklist:**
1. Run 3-6 baseline queries; record query, anchors returned, actionable-hit status, full-note-read needed (yes/no).
2. Split oversized mixed-purpose sections; one implementation decision per section.
3. Deduplicate - one canonical location per rule.
4. Stabilize vocabulary: use terms developers actually query; if semantic search keeps missing a term, add it to the note's `Retrieval hints` section and, when helpful, to the relevant heading or index entry.
5. Separate architecture guidance (stable rules) from runbooks (procedures); cross-link.
6. Trim stale/noise content: remove historical details that no longer affect active paths; prefer "current state + constraint" over narrative history.
7. Set `last_verified:` on every note touched.
8. Re-run the same baseline queries; compare. If results are still weak, fix them in this order:
   - tighten headings and move mandatory rules closer to the top of the note
   - add or correct `Retrieval hints` for missing terminology
   - move exact routing terms into the owning note or index so search can anchor to them
   - split mixed topics so one query does not have to retrieve a large narrative note
   - only then add concise connective narrative where rules still lack enough context
9. Use `wiki_write` with complete note content for every optimized note.
10. If search keeps surfacing file lists or generic notes, move the exact headings, aliases, and routing terms into the relevant wiki note index or note frontmatter so future searches can anchor to them.

**Acceptance target:** >=80% of representative queries yield directly actionable rules in top 1-2 results.

If the post-change baseline is still materially below target (for example around 60%), do not stop at "improved a bit." Record which queries still fail, apply the checklist above to those misses, and re-run until the remaining gap is explained by genuinely sparse source material rather than note structure or vocabulary.

**Stop rule:** stop optimizing when one of these is true:

- the acceptance target is met
- the remaining misses are due to genuinely missing source knowledge rather than note structure, headings, or aliases
- further improvement would require changing domain truth instead of retrieval structure

In the last two cases, record the unresolved misses and route the follow-up to `Enrich` or to the owning implementation task.

## Micro examples

- Weak optimize fix: query misses `member route map` because the note only says `authenticated member routes`. Add `member route map` to `Retrieval hints` and promote the route map heading.
- Weak enrich candidate: a one-off debugging timestamp or temporary experiment log. Do not add it unless the durable conclusion changes how future work should be done.

## Implementation note

Use the checklists in the skill body. Keep the skill self-contained so it can be reused as a shared submodule without extra helper files.
