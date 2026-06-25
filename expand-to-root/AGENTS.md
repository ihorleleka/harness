# Agents

## Skill routing

| trigger | skill |
|---|---|
| empty/missing wiki or first-time wiki setup | `$initialize-wiki` |
| existing wiki schema upgrade or typed-note migration | `$migrate-wiki` |
| non-trivial implementation or debugging | `$retrieve-knowledge` |
| wiki gap, stale note, or conflicting guidance found | `$wiki-maintenance` (enrich path) |
| retrieval quality or structure audit | `$wiki-maintenance` (optimize path) |

Skill files are the workflow source of truth. `AGENTS.md` owns durable repository policy; skills own retrieval/authoring workflow mechanics. Do not duplicate procedures here.

Use `$initialize-wiki` for bootstrapping new wiki content and `$migrate-wiki` for broad schema conversion. Use `$wiki-maintenance` for normal ongoing note enrichment or retrieval optimization after the wiki exists.

## Wiki gate

Before non-trivial code edits, run `$retrieve-knowledge`. Prefer current compiled packets over full notes. If code contradicts wiki guidance, verify code reality and use `$wiki-maintenance` only when the durable write-back threshold below is met.

## Wiki note taxonomy

Wiki notes must declare `kind:` in frontmatter. Use:

- `rule` for mandatory durable behavior.
- `decision` for architecture, product, or implementation choices.
- `reference` for durable facts, concepts, API shapes, and domain context that are not rules.
- `runbook` for repeatable operational or maintenance procedures.
- `glossary` for names, terms, aliases, and vocabulary.

Do not force notes into `Do` / `Do not` when they are really decisions or references. Keep todos out of wiki unless they describe durable debt, a known limitation, or deferred work that future sessions must account for.

## Delivery standard

Every response must state which wiki note changed, or briefly why no wiki update was needed. Do not create wiki notes merely to satisfy this rule.

## Communication budget

Default to terse outputs:

- During work, send progress updates only for long-running or blocked tasks; keep them to one sentence.
- In final responses, prefer 1-3 short bullets or a short paragraph.
- Do not include evidence logs, todo/done lists, test transcripts, or detailed reasoning unless requested, high-risk, or decision-changing.
- For minor fixes, state the files changed and whether verification ran; omit broad summaries.

## Wiki write-back threshold

Use `$wiki-maintenance` only when future sessions would need the outcome as decision context: durable architecture rules, decisions, reference facts, repeated patterns/invariants, placement conventions, stale/missing/conflicting wiki guidance, or cross-cutting behavior affecting data model, migrations, APIs, startup, import/export, or major UI workflows.

Do not update wiki notes for one-off details, cosmetic tweaks, routine CSS fixes, typo fixes, isolated bugs with no reusable guidance, or task-specific outcomes. When unsure, skip wiki write-back unless the conclusion would be useful to query later by name.

## Core rules

- Follow architecture and placement rules from the relevant wiki notes.
- Prefer targeted changes within task scope; do not opportunistically modernize unrelated areas.
- Route changes by purpose: repository-wide durable rules in `AGENTS.md`; living domain knowledge in `wiki/`; workflow mechanics in skill files.
- When updating guidance, prefer broadening or correcting existing guidance over adding narrow new rules; use specifics as examples or evidence unless the specificity is the actual invariant.
- Do not run frontend builds unless the user explicitly asks.
