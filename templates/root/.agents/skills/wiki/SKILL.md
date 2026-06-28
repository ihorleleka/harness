---
name: wiki
description: Unified Project-Rag-Wiki workflow for repository knowledge management. Use when Codex or a delegated/sub-agent needs packet-first wiki retrieval before non-trivial implementation, debugging, review, planning, repository analysis, exploration, repository search, codebase orientation, component discovery, governing guidance lookup, or answering from repository knowledge; when initializing, migrating, maintaining, optimizing, or auditing wiki notes; when wiki content seems missing, stale, broken, untrusted, drifted, or needs provenance checking; or when the user mentions wiki, knowledge base, retrieve knowledge, search wiki, explore, find, investigate, trust this, provenance, drift, schema report, packets, wiki_search, wiki_read, wiki_write, or wiki_schema_report.
---

# Wiki

Goal: use the configured `wiki-manager` MCP server and its `wiki_*` tools as a packet-first, typed-note knowledge system for the repository `wiki/`.

## Route

Choose one path:

- **Retrieve**: before non-trivial implementation/debugging, review, planning, repository analysis, delegated exploration, repository search, codebase orientation, or answering from wiki context.
- **Initialize**: when `wiki/` is missing, empty, or needs starter notes.
- **Migrate**: when existing notes need the current typed schema.
- **Maintain**: when durable guidance is missing, stale, conflicting, or hard to retrieve.
- **Audit**: when the user asks about schema quality, retrieval quality, stale notes, duplicate IDs, broken wiki links, provenance, drift, broken/missing wiki content, or whether wiki guidance can be trusted.

Use active wiki MCP tools through native tool calls: `wiki_search`, `wiki_read`, `wiki_list`, `wiki_schema_report`, and `wiki_write`. If the tools are absent, use tool discovery before direct file reads. If direct file writes are required as a fallback, say MCP indexing was not invoked.

## Hard Rules

- Prefer `wiki_search` results where `record_type` is `packet`.
- Treat typed Markdown notes as the authored source of truth; generated packets are derived by the MCP service.
- Do not author packet files.
- Do not append fragments. Read the current note, merge locally, then write the complete Markdown note with `wiki_write`.
- Keep workflow mechanics in this skill, durable repo policy in `AGENTS.md`, and project/domain truth in `wiki/`.
- Do not create wiki notes for one-off task details, cosmetic tweaks, routine isolated bugs, or transient todos.
- Do not introduce raw-source ingestion, topic hubs, archive registries, session capture, datasets, or compiler workflows unless the repository README is updated to promise them.

## Quality Practices

- **Honest gaps**: if wiki retrieval does not answer the question, say so. Use code inspection or normal reasoning as a fallback only when appropriate, and distinguish that from wiki-backed guidance.
- **Clarifying questions**: ask the user only when missing information changes the target, scope, risk, or durable wiki meaning. Do not ask for confirmation when a bounded assumption is safe; state the assumption and continue.
- **Source labels**: keep wiki-backed facts, code-verified facts, and inference separate in your reasoning and final response when the distinction matters. Never present inference or stale guidance as retrieved fact.
- **Confidence and staleness**: when packets expose confidence, `last_verified`, `needs_verification`, or `gaps`, use those fields to decide whether to trust, verify, or qualify the guidance.
- **First-run or broken wiki**: if `wiki/` is missing, empty, unreadable, or schema health is the actual problem, route to Initialize or Audit instead of dumping generic commands.
- **Bounded searches**: for broad requests like "find all" or "catalog", state the search strategy or limits. Do not claim exhaustive coverage unless the repository scope and search method support it.
- **Post-write check**: after `wiki_write`, run the smallest useful verification: read/search the touched note, run `wiki_schema_report` for migration/audit work, or run a representative `wiki_search` for retrieval optimization. Report verification failures without blocking unrelated user work.
- **Write-back judgment**: update wiki when the finding is durable and future agents would reasonably need it. If the finding is plausible but unverified, controversial, overly broad, or based mainly on user preference, report it as a candidate and ask before promotion.

## Typed Notes

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

Kinds:

- `rule`: mandatory durable behavior.
- `decision`: architecture, product, or implementation choices.
- `reference`: durable facts, concepts, API shapes, and domain context that are not rules.
- `runbook`: repeatable operational or maintenance procedures.
- `glossary`: names, terms, aliases, and vocabulary.

Shapes:

- `rule`: `Use this when`, `Rule`, `Do`, `Do not`, `Evidence`, `Retrieval hints`.
- `decision`: `Use this when`, `Decision`, `Rationale`, `Consequences`, `Evidence`, `Retrieval hints`.
- `reference`: `Use this when`, `Summary`, `Key facts`, `Evidence`, `Retrieval hints`.
- `runbook`: `Use this when`, `Steps`, `Do not`, `Evidence`, `Retrieval hints`.
- `glossary`: `Terms`, `Aliases`, `Retrieval hints`.

Do not force decisions or references into `Do` / `Do not`. If mandatory behavior and background facts are mixed, split the note or make the rule canonical and move supporting facts into `Evidence`.

## Canonical Homes

Use these as a menu, not a checklist. Create notes only when verified repository evidence supports useful content.

- `index.md` (`reference`): map of active notes and retrieval hints.
- `overview.md` (`reference`): repository purpose, runtime, and entrypoints.
- `architecture.md` (`decision`): major architecture, product, or implementation choices.
- `coding-standards.md` (`rule`): mandatory coding, validation, testing, generated-code, or review rules.
- `development-runbook.md` (`runbook`): install, build, test, run, and verification commands.
- `components/<name>.md` (`reference`): primary modules, bounded contexts, or domains.
- `api.md` or `api/<area>.md` (`reference` or `rule`): public contracts, routes, request/response shapes, or compatibility rules.
- `data.md` or `data/<area>.md` (`reference` or `decision`): data model facts, persistence, migrations, indexing, import/export, or integration contracts.
- `ui-patterns.md` (`rule` or `reference`): shared UI conventions, accessibility, or interaction patterns.
- `operations/<topic>.md` (`runbook`): deployment, configuration, maintenance, observability, or recovery.
- `rules/<topic>.md` (`rule`): focused mandatory placement or behavior rules.
- `glossary.md` (`glossary`): project terms, aliases, acronyms, and naming vocabulary.

## Retrieve

Use for non-trivial implementation/debugging, review, planning, repository analysis, delegated exploration, repository search, wiki-backed Q&A, or broad orientation.

When acting as an explorer/search/orientation sub-agent, start with a narrow wiki search before scanning files. Use packets to choose search terms, likely directories, contracts, and constraints. Then inspect code normally and report both adopted wiki guidance and code reality. Skip wiki retrieval only for tiny literal lookups where the exact file or symbol is already known and no repository convention can affect the answer.

Checklist:

1. If the task is broad or does not name a component, run the orientation pass.
2. Search with 1-2 intent-rich queries for the direct task context: `<task> <component> <contract> <constraint>`.
3. Also query for likely governing guidance when the work may be constrained by repository conventions, decisions, boundaries, contracts, quality expectations, or operational constraints. Keep it task-shaped; do not load broad wiki areas just in case.
4. For concrete work with cross-cutting risk, run one guardrail query.
5. Prefer packet results. Read `kind`, `rule`, `source`, `last_verified`, `confidence`, `needs_verification`, `applies_to`, and `gaps`.
6. Treat current high-confidence packets as enough when they are concrete and in scope.
7. Read full notes only for conflicts, missing hard rules, security/auth, data migrations, infrastructure reliability, explicit exhaustive review, or when a packet points to a hard rule without enough detail.
8. If `last_verified` is missing or old, `needs_verification` is true, or `gaps` mention structure problems, verify against code before relying on it.
9. Say when the wiki lacks the answer; suggest a targeted wiki update only when the gap is durable.

Guardrail query:

1. Use when work may affect shared behavior, public or internal contracts, data flow, security, validation, reliability, tests, configuration, generated artifacts, user-facing behavior, or multiple modules.
2. Search for the component plus the task type and the likely kind of governing guidance.
3. Adopt only directly constraining `rule` and `decision` packets.

Orientation pass:

1. Search for repository-level orientation using the user's goal and any visible project signals.
2. Search one task-shaped query using the user's verb plus likely governing guidance terms for that task.
3. Adopt only the top 1-3 directly relevant packets.
4. After code inspection reveals a concrete slice, run one focused query for that slice.

Budgets:

- Routine task: 1-3 searches, top 1-3 hits, 0-1 full-note reads per slice.
- Cross-cutting task: routine budget plus one guardrail query.
- Broad task: orientation pass, then one focused query after code inspection.
- Search miss: try one focused query or one focused full-note read, then surface the gap.

## Initialize

Use when bootstrapping useful typed wiki starter notes without over-documenting.

Modes:

- `audit-only`: inspect and propose notes without writing.
- `minimal`: create only `index.md` and one high-level `overview.md`.
- `standard`: create index, overview, architecture decisions, coding standards, run/build/test runbook, primary components, and glossary when useful.
- `detailed`: create standard notes plus subsystem references, data/API references, UI patterns, placement rules, operational runbooks, and directly supported known decisions.

Default to `standard` unless mode choice materially affects expected output or repository size.

Workflow:

1. Inspect README, package/project files, build/test config, entrypoints, routes/modules, deployment files, and existing `wiki/`.
2. If notes already exist, run `wiki_schema_report` when available and prefer Migrate unless the user wants additive starter notes.
3. Choose mode and note plan. Prefer fewer canonical notes over many thin notes.
4. Write only verified facts. Put clear inferences in `Evidence` or skip them.
5. Keep notes short: decision-ready answer first, source paths in `Evidence`, search terms in `Retrieval hints`.
6. Write complete notes with `wiki_write` when available.

## Migrate

Use when converting existing notes into concise typed packet sources.

Default path:

1. Run `wiki_schema_report` when available. Use per-note issues, gaps, `kind`, `packet_compiled`, missing sections, duplicate IDs, and broken links as the queue.
2. If unavailable, list notes with `wiki_list`; otherwise inspect `wiki/**/*.md`.
3. Read candidate notes with `wiki_read` or normal file reads.
4. Classify each note as `rule`, `decision`, `reference`, `runbook`, or `glossary`.
5. Report proposed broad changes before writing when migration affects many notes or splits/merges content.
6. Write complete updated notes with `wiki_write` when available.
7. Validate with `wiki_schema_report` and 2-3 representative `wiki_search` queries when MCP tools are available.

Preserve durable facts, source paths, links, and explicit decisions. Remove stale noise, task logs, baseline-search narration, and obsolete TODO lists unless they affect active decisions.

## Maintain

Use when a durable wiki gap exists or retrieval quality is poor.

Shared rules:

- Meet the `AGENTS.md` write-back threshold before writing.
- Update an existing note unless no clear owner exists.
- Choose the narrowest correct `kind`.
- Generalize the invariant; put task-specific examples in `Evidence` unless the specificity is the invariant.
- Set `last_verified` to today's date on every note touched.
- Update index links if a note is created, moved, or renamed.
- Preserve useful user corrections, durable preferences, and repeated error->fix lessons only when they are project-relevant and reusable. Ignore generic acknowledgements.
- If a proposed update would change policy, architecture, ownership, naming, or public behavior, ask for confirmation unless the user explicitly requested the write-back.

Enrich when durable/reusable guidance is missing, stale, conflicting, or repeatedly needed.

Optimize when searches return narrative over rules, mixed concerns, duplicated guidance, stale guidance, weak retrieval hints, or frequent full-note reads:

1. Run 2-3 representative baseline queries.
2. Correct `kind`; split mixed concerns when one packet cannot answer cleanly.
3. Move the decision-ready answer near the top.
4. Add developer query terms to headings or `Retrieval hints`.
5. Remove stale/noisy content that no longer affects active work.
6. Re-run baseline queries and summarize results in the response, not in domain notes unless they affect the note's decision.

## Audit

Use for explicit schema, retrieval, drift, trust, or quality checks.

1. Run `wiki_schema_report` when available.
2. Inspect reported packet gaps, stale verification, duplicate IDs, broken links, missing sections, and uncompiled notes.
3. Run representative `wiki_search` queries for one rule/decision, one reference fact, and one likely developer search phrase.
4. Read full notes only where the report or packet results show ambiguity.
5. Fix trivial typed-note issues with `wiki_write` only when the user asked for fixes or the issue blocks the current task.
6. Report remaining gaps honestly.

## Output

Keep responses compact. State the path used, adopted packet guidance or explicit wiki gap, notes changed if any, and whether MCP tools were used. When the answer relies on code inspection or inference rather than wiki, say so briefly. For normal code tasks, also state why no wiki update was needed, or name the durable candidate that should be promoted later.
