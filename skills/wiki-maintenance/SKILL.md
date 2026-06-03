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
- Use `mcp__kb` MCP as the default retrieval interface during wiki maintenance.

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
last_verified: YYYY-MM-DD
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
4. Write decision-ready sections: Purpose -> Scope/Applies-to -> Mandatory rules -> Canonical pattern -> Exceptions -> Related links.
5. Set `last_verified:` to today.
6. Fix link hygiene: update index, fix moved/renamed references, keep anchors stable.
7. Attach evidence: query and section anchors that exposed the gap, what changed, why it closes future retrieval gaps.
8. Reject archival noise, one-off samples, and trivia that do not improve future retrieval or maintenance.

## Optimize path

**When:** search returns narrative over rules | notes mix architecture and runbooks | terminology drift causes poor recall | frequent full-note reads required | duplicated or stale guidance.

**Checklist:**
1. Run 3-6 baseline queries; record query, anchors returned, actionable-hit status, full-note-read needed (yes/no).
2. Split oversized mixed-purpose sections; one implementation decision per section.
3. Deduplicate - one canonical location per rule.
4. Stabilize vocabulary: use terms developers actually query; if semantic search keeps missing a term, add it to the note's `Aliases/Search Terms` section and, when helpful, to the relevant heading or index entry.
5. Separate architecture guidance (stable rules) from runbooks (procedures); cross-link.
6. Trim stale/noise content: remove historical details that no longer affect active paths; prefer "current state + constraint" over narrative history.
7. Set `last_verified:` on every note touched.
8. Re-run the same baseline queries; compare. If results are still weak, fix them in this order:
   - tighten headings and move mandatory rules closer to the top of the note
   - add or correct `Aliases/Search Terms` for missing terminology
   - move exact routing terms into the owning note or index so search can anchor to them
   - split mixed topics so one query does not have to retrieve a large narrative note
   - only then add concise connective narrative where rules still lack enough context
9. If search keeps surfacing file lists or generic notes, move the exact headings, aliases, and routing terms into the relevant wiki note index or note frontmatter so future searches can anchor to them.

**Acceptance target:** >=80% of representative queries yield directly actionable rules in top 1-2 results.

If the post-change baseline is still materially below target (for example around 60%), do not stop at "improved a bit." Record which queries still fail, apply the checklist above to those misses, and re-run until the remaining gap is explained by genuinely sparse source material rather than note structure or vocabulary.

**Stop rule:** stop optimizing when one of these is true:

- the acceptance target is met
- the remaining misses are due to genuinely missing source knowledge rather than note structure, headings, or aliases
- further improvement would require changing domain truth instead of retrieval structure

In the last two cases, record the unresolved misses and route the follow-up to `Enrich` or to the owning implementation task.

## Micro examples

- Weak optimize fix: query misses `member route map` because the note only says `authenticated member routes`. Add `member route map` to `Aliases/Search Terms` and promote the route map heading.
- Weak enrich candidate: a one-off debugging timestamp or temporary experiment log. Do not add it unless the durable conclusion changes how future work should be done.

## Implementation note

Use the checklists in the skill body. Keep the skill self-contained so it can be reused as a shared submodule without extra helper files.
