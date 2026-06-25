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
- Classify the note first with `kind: rule`, `decision`, `reference`, `runbook`, or `glossary`.
- Scope notes as `project-specific`, `platform`, or `general`.
- Keep one canonical location per rule; deduplicate on write.
- Use the suggested wiki sections as canonical homes when creating or moving notes.
- Prefer generalizing or correcting existing guidance over adding new narrow bullets; keep task-specific facts in `Evidence` or examples unless they are the durable guidance.
- Read the current note first, merge locally, then write the complete note with `wiki_write`; do not append fragments.
- Set `last_verified:` to today on every note touched.
- Prefer decision-ready typed sections over narrative. Keep the most reusable answer near the top.
- Keep `Evidence` focused on source paths and verified behavior; do not store retrieval audit logs or baseline-search narration in domain notes unless it is decision-critical.
- Keep TODOs out of wiki unless they represent durable debt, a known limitation, or deferred work future sessions must account for.

## Typed Note Shapes

Frontmatter:

```yaml
---
id: stable-note-id
kind: rule
scope: project-specific
last_verified: YYYY-MM-DD
status: active
applies_to:
  - domain-or-component
---
```

Use these shapes:

- `rule`: `Use this when`, `Rule`, `Do`, `Do not`, `Evidence`, `Retrieval hints`.
- `decision`: `Use this when`, `Decision`, `Rationale`, `Consequences`, `Evidence`, `Retrieval hints`.
- `reference`: `Use this when`, `Summary`, `Key facts`, `Evidence`, `Retrieval hints`.
- `runbook`: `Use this when`, `Steps`, `Do not`, `Evidence`, `Retrieval hints`.
- `glossary`: `Terms`, `Aliases`, `Retrieval hints`.

Do not force a reference or decision into `Do` / `Do not`. If a note contains both mandatory behavior and background facts, split it or make the mandatory behavior the canonical rule and move supporting facts into `Evidence`.

## Suggested Wiki Sections

Use these as canonical homes when a durable gap needs a new note or when
optimization reveals scattered guidance. Do not create placeholder notes without
verified content.

- `index.md` (`reference`): map of active notes and retrieval hints.
- `overview.md` (`reference`): repository purpose, main runtime, important entrypoints.
- `architecture.md` (`decision`): major architecture, product, or implementation choices.
- `coding-standards.md` (`rule`): mandatory coding conventions, validation rules, testing rules, generated-code rules, or review constraints.
- `development-runbook.md` (`runbook`): install, build, test, run, and common verification commands.
- `components/<name>.md` (`reference`): primary modules, bounded contexts, or domains.
- `api.md` or `api/<area>.md` (`reference` or `rule`): public contracts, route conventions, request/response shapes, or API compatibility rules.
- `data.md` or `data/<area>.md` (`reference` or `decision`): data model facts, persistence choices, migrations, indexing, import/export, or integration contracts.
- `ui-patterns.md` (`rule` or `reference`): shared UI conventions, component placement, accessibility rules, or interaction patterns.
- `operations/<topic>.md` (`runbook`): deployment, configuration, maintenance, observability, recovery, or other repeated operational tasks.
- `rules/<topic>.md` (`rule`): focused mandatory placement or behavior rules that do not belong in a broader canonical rule note.
- `glossary.md` (`glossary`): project terms, aliases, acronyms, and naming vocabulary.

## Enrich

Use when a durable/reusable rule is missing, stale, conflicting, or repeatedly needed.

Reject archival noise, one-off samples, minor polish, cosmetic tweaks, isolated bugs with no reusable rule, and trivia.

Checklist:

1. Decide whether the guidance belongs in wiki under the `AGENTS.md` write-back threshold.
2. Update an existing note unless no clear owner exists.
3. Choose the narrowest correct `kind` and use that note shape.
4. Include concrete guidance, evidence, retrieval hints, and `last_verified`.
5. Generalize the invariant; put examples and task-specific facts in `Evidence` unless the specificity is the invariant.
6. Update index links if a note is created, moved, or renamed.

## Optimize

Use when searches return narrative over rules, mixed concerns, duplicated guidance, stale guidance, or frequent full-note reads.

Checklist:

1. Run 2-3 representative baseline queries.
2. Classify or correct `kind`; split mixed rule/decision/reference content when one packet cannot answer cleanly.
3. Move the decision-ready answer near the top using the matching typed sections.
4. Add developer/agent query terms to headings or `Retrieval hints`.
5. Remove stale/noise content that no longer affects active work.
6. Re-run baseline queries and keep improving until top results are directly actionable or the remaining gap is missing source knowledge; summarize results in the response, not in domain notes, unless they affect the note's decision.

## Output

Keep task responses to one compact line by default: path used, notes touched, and why it improves future retrieval. Add details only when requested or decision-critical.
