# Agents

## Skill routing

| trigger | skill |
|---|---|
| non-trivial implementation, debugging, review, planning, or repo analysis | `$wiki` retrieve path |
| delegated/sub-agent exploration, repository search, or codebase orientation | `$wiki` retrieve path |
| empty/missing wiki or first-time wiki setup | `$wiki` initialize path |
| existing wiki schema upgrade or typed-note migration | `$wiki` migrate path |
| wiki gap, stale note, or conflicting guidance found | `$wiki` maintain/enrich path |
| retrieval quality, structure audit, or schema report | `$wiki` audit or maintain/optimize path |

The `$wiki` skill is the workflow source of truth. `AGENTS.md` owns durable repository policy; skills own retrieval/authoring workflow mechanics. Do not duplicate procedures here.

Use `$wiki` for bootstrapping new wiki content, broad schema conversion, normal ongoing note enrichment, retrieval optimization, and packet-first retrieval.

## Wiki gate

Before non-trivial code edits, reviews, plans, or repository analysis, run `$wiki` retrieval. Retrieve the direct task context plus any likely governing guidance that could constrain the work, such as relevant conventions, decisions, boundaries, contracts, quality expectations, or operational constraints. Keep this relevance-based: query what might matter for the task instead of loading broad wiki areas by default. Prefer current compiled packets over full notes. If code contradicts wiki guidance, verify code reality and use the `$wiki` maintain path only when the durable write-back threshold below is met.

For delegated agents and sub-agents, treat exploration and repository search as wiki-gated unless the request is a tiny literal lookup with an already-known file or symbol. Start with narrow packet retrieval to identify likely areas, terms, constraints, and reusable guidance; then inspect the repository normally. Report code reality over stale wiki guidance, and mention stale or missing wiki context compactly.

If wiki retrieval misses, say that plainly instead of treating guesses as wiki-backed guidance. If the wiki appears missing, empty, stale, broken, or untrusted, route through the `$wiki` initialize or audit path. After wiki writes, perform the smallest useful verification, such as reading/searching the touched note or checking schema health for migration/audit work.

Ask the user only when missing information changes the target, scope, risk, or durable meaning of a wiki update. Otherwise make a bounded assumption, state it if useful, and continue. Keep wiki-backed facts, code-verified facts, and inference distinct when the distinction matters.

## Wiki note taxonomy

Wiki notes must declare `kind:` in frontmatter. Use:

- `rule` for mandatory durable behavior.
- `decision` for architecture, product, or implementation choices.
- `reference` for durable facts, concepts, API shapes, and domain context that are not rules.
- `runbook` for repeatable operational or maintenance procedures.
- `glossary` for names, terms, aliases, and vocabulary.

Do not force notes into `Do` / `Do not` when they are really decisions or references. Keep todos out of wiki unless they describe durable debt, a known limitation, or deferred work that future sessions must account for.

## Delivery standard

Every final response, handoff, or task-closing status must include a compact wiki status:

- `Wiki: updated <note>` when a wiki note changed.
- `Wiki: no update needed - <specific reason>` when no note changed.

Use concrete reasons such as "one-off bugfix," "cosmetic-only change," "no durable guidance changed," or "retrieval only." This is an accountability check, not a quota. Do not create or touch wiki notes just to make the status non-empty, and do not use a vague reason when the work produced reusable project guidance that meets the write-back threshold.

## Communication budget

Default to terse outputs:

- During work, send progress updates only for long-running or blocked tasks; keep them to one sentence.
- In final responses, prefer 1-3 short bullets or a short paragraph.
- Do not include evidence logs, todo/done lists, test transcripts, or detailed reasoning unless requested, high-risk, or decision-changing.
- For minor fixes, state the files changed and whether verification ran; omit broad summaries.

## Wiki write-back threshold

Use the `$wiki` maintain path only when future sessions would need the outcome as decision context: durable architecture rules, decisions, reference facts, repeated patterns/invariants, placement conventions, stale/missing/conflicting wiki guidance, or cross-cutting behavior affecting data model, migrations, APIs, startup, import/export, or major UI workflows.

Do not update wiki notes for one-off details, cosmetic tweaks, routine CSS fixes, typo fixes, isolated bugs with no reusable guidance, or task-specific outcomes. When unsure, skip wiki write-back unless the conclusion would be useful to query later by name.

Treat useful user corrections, durable preferences, and repeated error->fix lessons as write-back candidates, but promote them only when they are project-relevant, reusable, and verified enough to guide future agents. Ask before writing changes that would alter policy, architecture, ownership, naming, or public behavior.

## Core rules

- Follow architecture and placement rules from the relevant wiki notes.
- Prefer targeted changes within task scope; do not opportunistically modernize unrelated areas.
- Route changes by purpose: repository-wide durable rules in `AGENTS.md`; living domain knowledge in `wiki/`; workflow mechanics in skill files.
- When creating, migrating, or moving wiki notes, use the relevant lifecycle skill's suggested wiki sections as canonical homes; do not create empty placeholder notes.
- When updating guidance, prefer broadening or correcting existing guidance over adding narrow new rules; use specifics as examples or evidence unless the specificity is the actual invariant.
