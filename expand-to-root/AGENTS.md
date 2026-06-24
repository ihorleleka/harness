# Agents

## Skill routing

| trigger | skill |
|---|---|
| non-trivial implementation or debugging | `$retrieve-knowledge` |
| wiki gap, stale note, or conflicting guidance found | `$wiki-maintenance` (enrich path) |
| retrieval quality or structure audit | `$wiki-maintenance` (optimize path) |

Skill files are the workflow source of truth. `AGENTS.md` owns durable repository policy; skills own retrieval/authoring workflow mechanics. Do not duplicate procedures here.

## Wiki gate

Before non-trivial code edits, run `$retrieve-knowledge`. Prefer current compiled packets over full notes. If code contradicts wiki guidance, verify code reality and use `$wiki-maintenance` only when the durable write-back threshold below is met.

## Delivery standard

Every response must state which wiki note changed, or briefly why no wiki update was needed. Do not create wiki notes merely to satisfy this rule.

## Communication budget

Default to terse outputs:

- During work, send progress updates only for long-running or blocked tasks; keep them to one sentence.
- In final responses, prefer 1-3 short bullets or a short paragraph.
- Do not include evidence logs, todo/done lists, test transcripts, or detailed reasoning unless requested, high-risk, or decision-changing.
- For minor fixes, state the files changed and whether verification ran; omit broad summaries.

## Wiki write-back threshold

Use `$wiki-maintenance` only when future sessions would need the outcome as decision context: durable architecture rules, repeated patterns/invariants, placement conventions, stale/missing/conflicting wiki rules, or cross-cutting behavior affecting data model, migrations, APIs, startup, import/export, or major UI workflows.

Do not update wiki notes for one-off details, cosmetic tweaks, routine CSS fixes, typo fixes, isolated bugs with no reusable rule, or task-specific outcomes. When unsure, skip wiki write-back unless the conclusion would be useful to query later by name.

## Core rules

- Follow architecture and placement rules from the relevant wiki notes.
- Prefer targeted changes within task scope; do not opportunistically modernize unrelated areas.
- Route changes by purpose: repository-wide durable rules in `AGENTS.md`; living domain knowledge in `wiki/`; workflow mechanics in skill files.
- When updating guidance, prefer broadening or correcting existing guidance over adding narrow new rules; use specifics as examples or evidence unless the specificity is the actual invariant.
- Do not run frontend builds unless the user explicitly asks.
