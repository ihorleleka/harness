---
name: wiki-maintenance
description: Keep wiki notes current and retrieval-ready when durable guidance is missing, stale, conflicting, or poorly retrievable.
skip_when: no durable gap found and retrieval quality is adequate
---

# Wiki Maintenance

Pick one path:

- **Enrich**: durable gap, stale note, or conflicting guidance found during implementation.
- **Optimize**: retrieval quality or structure is poor.

## Shared Rules

- Keep workflow mechanics in skills, repo policy in `AGENTS.md`, and domain truth in wiki notes.
- Scope notes as `project-specific`, `platform`, or `general`.
- Keep one canonical location per rule; deduplicate on write.
- Prefer generalizing or correcting existing guidance over adding new narrow bullets; keep task-specific facts in `Evidence` or examples unless they are the durable rule.
- Read the current note first, merge locally, then write the complete note with `wiki_write`; do not append fragments.
- Set `last_verified:` to today on every note touched.
- Prefer decision-ready sections: `Use this when`, `Decision`, `Do`, `Do not`, `Evidence`, `Retrieval hints`.
- Keep `Evidence` focused on source paths and verified behavior; do not store retrieval audit logs or baseline-search narration in domain notes unless it is decision-critical.

## Enrich

Use when a durable/reusable rule is missing, stale, conflicting, or repeatedly needed.

Reject archival noise, one-off samples, minor polish, cosmetic tweaks, isolated bugs with no reusable rule, and trivia.

Checklist:

1. Decide whether the rule belongs in wiki under the `AGENTS.md` write-back threshold.
2. Update an existing note unless no clear owner exists.
3. Include the decision, concrete do/do-not guidance, evidence, retrieval hints, and `last_verified`.
4. Update index links if a note is created, moved, or renamed.

## Optimize

Use when searches return narrative over rules, mixed concerns, duplicated guidance, stale guidance, or frequent full-note reads.

Checklist:

1. Run 2-3 representative baseline queries.
2. Split mixed sections and move mandatory rules near the top.
3. Add developer/agent query terms to headings or `Retrieval hints`.
4. Remove stale/noise content that no longer affects active work.
5. Re-run baseline queries and keep improving until top results are directly actionable or the remaining gap is missing source knowledge; summarize results in the response, not in domain notes, unless they affect the note's decision.

## Output

Keep task responses to one compact line by default: path used, notes touched, and why it improves future retrieval. Add details only when requested or decision-critical.
