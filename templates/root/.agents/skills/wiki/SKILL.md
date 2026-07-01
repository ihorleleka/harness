---
name: wiki
description: Governed wiki-manager workflow for packet-first repository knowledge retrieval, typed wiki authoring, schema migration, maintenance, retrieval optimization, and trust audits. Use before non-trivial implementation, debugging, review, planning, repository analysis, codebase orientation, codebase search, symbol or component discovery, delegated exploration, contract lookup, or answering from repository knowledge; use when wiki content is missing, stale, conflicting, untrusted, or needs provenance verification; use when the user mentions wiki, knowledge base, retrieve knowledge, search wiki, schema report, packets, wiki_search, wiki_read, wiki_write, wiki_list, or wiki_schema_report.
---

# Wiki

Use the configured `wiki-manager` MCP server as the governed knowledge interface for repository `wiki/` content. Typed Markdown notes are the authored source of truth; packets are generated retrieval artifacts.

## Quality Bar

- Retrieval should reduce and focus code inspection, not replace it.
- Wiki writes should make future sessions faster, safer, or more correct.
- Capability specifications should describe behavior, contracts, boundaries, and quality attributes before implementation detail.
- Low-confidence, inferred, or incomplete product facts belong in `Open questions` until verified.

## Routing

Choose the smallest path that satisfies the task:

- **Retrieve**: task-scoped packet retrieval before non-trivial implementation, debugging, review, planning, repository analysis, delegated exploration, codebase orientation, or wiki-backed answers.
- **Initialize**: bootstrap useful typed notes when `wiki/` is missing, empty, unreadable, or intentionally being established.
- **Migrate**: convert existing notes into the current typed-note schema.
- **Maintain**: enrich, correct, split, consolidate, or optimize notes when durable guidance is missing, stale, conflicting, or hard to retrieve.
- **Audit**: assess schema health, retrieval quality, provenance, drift, stale notes, duplicate IDs, broken links, or trustworthiness.

Use native MCP tool calls when available: `wiki_search`, `wiki_read`, `wiki_list`, `wiki_schema_report`, and `wiki_write`. If the tools are absent, use tool discovery before direct file access. If direct file writes are required as a fallback, state that MCP indexing was not invoked.

## Governance Rules

- Prefer `wiki_search` results with `record_type: packet`.
- Treat generated packet files as read-only; author typed Markdown notes.
- Read the current note, merge changes locally, then write the complete Markdown note with `wiki_write`.
- Use repository-relative paths in wiki notes, examples, evidence, anchors, and handoffs. Do not write machine-local absolute paths such as drive-rooted Windows paths, home-directory paths, temporary paths, or editor-specific file URIs into committed wiki content.
- Keep workflow mechanics in this skill, durable agent policy in `AGENTS.md`, and project/domain truth in `wiki/`.
- Create wiki notes for durable, reusable guidance that future sessions should retrieve.
- Keep this workflow limited to retrieval, typed-note authoring, schema migration, maintenance, retrieval optimization, and audits unless repository documentation commits to a broader wiki subsystem.

## Knowledge Quality Standards

- **Traceability**: include repository-relative source paths, code symbols, tests, migrations, tickets, user confirmations, or other evidence for durable claims.
- **Retrieval usefulness**: a useful note should be findable by likely future search terms and return a packet that can guide the next action without forcing a full-note read for routine use.
- **Separation of sources**: distinguish wiki-backed facts, code-verified facts, and inference whenever the distinction affects the answer.
- **Staleness handling**: use packet fields such as `last_verified`, `needs_verification`, `confidence`, and `gaps` to decide whether to trust, qualify, or verify guidance.
- **Honest gaps**: if retrieval does not answer the question, say so. Continue with code inspection only when appropriate, and label inference as inference.
- **Bounded search**: for broad requests, state the search strategy or limits. Claim exhaustive coverage only when the repository scope and search method support it.
- **Query separation**: use one focused `wiki_search` call per distinct topic, capability, component, contract, or policy area. Do not combine unrelated topics into one long query to save calls.
- **Clarification discipline**: ask the user only when missing information changes target, scope, public behavior, risk, or durable wiki meaning. Otherwise proceed with a bounded assumption.
- **Post-write verification**: after `wiki_write`, run the smallest useful verification: read/search the touched note, run `wiki_schema_report` for migration/audit work, or run a representative `wiki_search` when optimizing retrieval.
- **Promotion judgment**: promote knowledge only when future agents would reasonably need it. If the finding is plausible but unverified, controversial, policy-changing, or mainly preference-based, present it as a candidate and ask before writing.

## Typed Notes

Frontmatter:

```yaml
---
id: stable-note-id
kind: reference
scope: project-specific
last_verified: YYYY-MM-DD
status: active
applies_to:
  - domain-or-component
---
```

Supported `kind` values:

- `rule`: mandatory durable behavior agents must follow.
- `decision`: architecture, product, or implementation decisions and their consequences.
- `reference`: durable facts, domain context, API shapes, capability specifications, and other non-mandatory knowledge.
- `runbook`: repeatable development, operational, recovery, or maintenance procedures.
- `glossary`: project vocabulary, aliases, acronyms, and naming conventions.

Canonical shapes:

- `rule`: `Use this when`, `Rule`, `Do`, `Do not`, `Evidence`, `Retrieval hints`.
- `decision`: `Use this when`, `Decision`, `Rationale`, `Consequences`, `Evidence`, `Retrieval hints`.
- `reference`: `Use this when`, `Summary`, `Key facts`, `Evidence`, `Retrieval hints`.
- `runbook`: `Use this when`, `Steps`, `Do not`, `Evidence`, `Retrieval hints`.
- `glossary`: `Terms`, `Aliases`, `Retrieval hints`.

Keep references and decisions in their canonical sections rather than rule-style sections. If mandatory behavior and supporting context are mixed, split the note or keep the rule canonical and move context into `Evidence`.

Capability specifications are an allowed extended `reference` shape. Do not flatten them into generic `Key facts` when the richer sections improve reconstruction, retrieval, or maintenance.

## Capability Specifications

Use a capability specification when a note should allow a future agent to reconstruct a complete delivery unit: business capability, feature, vertical slice, module, component, bounded context, workflow, integration, service, or another unit used by the team for planning and delivery. Use `kind: reference` unless the note primarily records a binding architecture or product decision.

Preferred homes:

- `features/<name>.md` for business or user-facing capabilities, workflows, and vertical slices.
- `components/<name>.md` for technical modules, bounded contexts, services, libraries, domains, and reusable UI/components.
- `integrations/<name>.md` for external systems, protocols, sync flows, and adapter boundaries.
- Existing `api/`, `data/`, `operations/`, and `rules/` notes remain canonical for focused contracts, persistence, runbooks, and mandatory policy. Link to them from the capability specification instead of duplicating large sections.

Recommended sections:

- `Use this when`: names, aliases, user intents, code terms, reconstruction triggers, and search phrases.
- `Summary`: purpose, scope, and business value.
- `Capability contract`: required outcomes, inputs, outputs, externally visible promises, invariants, non-goals, and compatibility expectations.
- `Behavior model`: actors, workflows, business rules, state transitions, edge cases, error handling, and failure behavior.
- `Architecture boundaries`: ownership, dependencies, allowed collaborators, layering, extension points, prohibited coupling, and replacement boundaries.
- `Data and integration contracts`: entities, state, persistence, events, API routes/messages, import/export formats, idempotency, migration concerns, and external system contracts.
- `Interaction model`: UI, API, CLI, background job, notification, integration, or workflow behavior; include accessibility and localization expectations where relevant.
- `Quality attributes`: security, authorization, privacy, compliance, validation, performance, reliability, observability, auditability, and operational constraints.
- `Acceptance and verification`: acceptance criteria, primary scenarios, regression risks, fixtures, test strategy, and verification commands or runbook links.
- `Reconstruction guidance`: implementation sequencing, decomposition hints, reusable design guidance, known variants, and tradeoffs.
- `Evidence`: repository-relative source paths, code symbols, tests, migrations, screenshots, tickets, product notes, or user confirmations.
- `Open questions`: unknowns, assumptions, unresolved decisions, and partial coverage.
- `Retrieval hints`: business vocabulary, code vocabulary, abbreviations, and likely future search terms.

A capability specification is below the quality floor if it lacks concrete retrieval triggers, a behavior or contract summary, current implementation anchors, repository-relative evidence paths or symbols, a verification approach, or explicit open questions for partial coverage. Do not write a low-signal specification only to occupy a canonical home. Report it as a follow-up candidate or ask for a focused documentation pass instead.

Portability rules:

- Capture durable intent, behavior, constraints, interfaces, and quality attributes before implementation detail.
- Label project-specific implementation details as current bindings, examples, or evidence rather than universal requirements.
- Prefer technology-neutral wording unless the behavior depends on a specific platform or framework.
- Reference repository-relative source paths and symbols instead of pasting large code blocks or file inventories.
- Avoid local absolute paths because committed wiki notes must work for every clone location.
- Use `Open questions` or ask the user when missing product behavior affects scope, public behavior, or reconstruction fidelity.

When planning, implementing, debugging, reviewing, or modifying a capability, check whether the wiki has enough reusable reconstruction guidance. If coverage is missing or weak:

- Write or update the smallest useful specification when the relevant facts are already verified and low effort to capture.
- Ask for permission to run a focused documentation pass when a faithful specification requires additional discovery. Name the target note, inspection areas, and expected value.
- Continue the primary task and report the specification as a follow-up candidate when documentation would materially expand scope.

Create specifications only when verified evidence supports useful content.

## Canonical Homes

Use these locations as a menu, not a checklist. Create notes only when verified evidence supports useful content.

- `index.md` (`reference`): active-note map and retrieval hints.
- `overview.md` (`reference`): repository purpose, runtime, entrypoints, and major dependencies.
- `architecture.md` (`decision`): major architecture, product, or implementation decisions.
- `coding-standards.md` (`rule`): mandatory coding, validation, testing, generated-code, or review rules.
- `development-runbook.md` (`runbook`): install, build, test, run, and verification procedures.
- `features/<name>.md` (`reference`): capability specifications for business/user-facing capabilities, workflows, or vertical slices.
- `components/<name>.md` (`reference`): capability specifications or references for modules, bounded contexts, services, libraries, domains, or reusable components.
- `integrations/<name>.md` (`reference` or `decision`): external systems, protocols, sync flows, and adapter boundaries.
- `api.md` or `api/<area>.md` (`reference` or `rule`): public/internal contracts, routes, messages, request/response shapes, and compatibility rules.
- `data.md` or `data/<area>.md` (`reference` or `decision`): data model facts, persistence choices, migrations, indexing, import/export, and integration contracts.
- `ui-patterns.md` (`rule` or `reference`): shared UI conventions, accessibility, interaction patterns, and component placement.
- `operations/<topic>.md` (`runbook`): deployment, configuration, observability, maintenance, recovery, and repeated operational tasks.
- `rules/<topic>.md` (`rule`): focused mandatory behavior, placement, or ownership rules.
- `glossary.md` (`glossary`): terms, aliases, acronyms, and naming vocabulary.

## Retrieve

Use for non-trivial implementation, debugging, review, planning, repository analysis, delegated exploration, sub-agent orientation, codebase search, symbol or component discovery, wiki-backed Q&A, or broad orientation. Tiny literal lookups for an already-known file or symbol may skip retrieval.

Workflow:

1. If the task is broad or does not name a component, run the orientation pass.
2. Split the retrieval need into distinct topics: direct capability/component, relevant contract, governing rule, integration, data flow, operation, or quality constraint.
3. Run separate short `wiki_search` calls for separate topics. Each query should name one primary topic plus the task verb or intent, not a packed list of every term that might matter.
4. Search for governing guidance with separate calls when the work may affect architecture boundaries, contracts, data flow, security, validation, reliability, generated artifacts, tests, configuration, operations, or user-visible behavior.
5. Prefer packet results. Inspect `kind`, `source`, `last_verified`, `confidence`, `needs_verification`, `applies_to`, and `gaps`.
6. Treat current high-confidence packets as sufficient when they are concrete and in scope.
7. Read full notes for conflicts, missing hard rules, security/auth, data migrations, infrastructure reliability, explicit exhaustive review, or packet summaries that lack necessary detail.
8. Verify against code before relying on stale, low-confidence, or structurally incomplete guidance.
9. State wiki gaps plainly and suggest a targeted update only when the gap is durable.
10. For delegated work, carry forward the retrieved rules, decisions, contracts, and open questions that constrain the subtask.

Implementation retrieval checklist:

- New feature or behavior change: search for the target capability and the nearest existing analogous feature.
- Placement and ownership: search for module boundaries, file placement, layering, ownership, and extension points before creating new files or directories.
- Architecture and patterns: search for relevant architecture decisions, reusable patterns, prohibited coupling, and replacement boundaries.
- Contracts and data flow: search separately for API/message contracts, data model, migrations, integrations, compatibility, and import/export behavior when affected.
- Quality rules: search separately for coding standards, validation, testing, security, authorization, privacy, accessibility, performance, reliability, observability, or operations rules that could constrain the change.

Delegation handoff:

- Relevant packets or notes: cite the note IDs, repository-relative paths, or packet sources that matter.
- Binding rules and contracts: restate mandatory constraints and compatibility expectations.
- Open questions: include unresolved wiki gaps or stale guidance that may affect the subtask.
- Code anchors: pass known files, symbols, tests, migrations, routes, or configuration discovered so far.
- Verification constraints: name commands, scenarios, or checks the delegate must preserve or run when practical.

Orientation pass:

1. Search for repository-level orientation using the user's goal and visible project signals.
2. Search one task-shaped query using the user's verb plus likely governing terms.
3. Adopt only the top 1-3 directly relevant packets.
4. After code inspection reveals a concrete capability or component, run one focused query for that unit.

Budgets:

- Routine task: 1-3 focused searches, top 1-3 hits, 0-1 full-note reads per unit.
- Multi-topic task: one focused search per distinct topic, usually 2-4 searches before code inspection.
- Cross-cutting task: routine or multi-topic budget plus separate governing-guidance queries for the affected rule, contract, data, security, operations, or quality area.
- Broad task: orientation pass, then one focused query per concrete capability or component after code inspection.
- Search miss: try one focused query or one focused full-note read, then surface the gap.

## Initialize

Use when bootstrapping a useful typed wiki without over-documenting.

Modes:

- `audit-only`: inspect and propose notes without writing.
- `minimal`: create only `index.md` and one high-level `overview.md`.
- `standard`: create index, overview, architecture decisions, coding standards, development runbook, primary components/capabilities, and glossary only when repository evidence supports authoritative content.
- `detailed`: create standard notes plus subsystem references, data/API references, UI patterns, placement rules, operational runbooks, capability specifications, and directly supported decisions.

Default to `minimal` for a missing or empty wiki unless the user explicitly asks for broader initialization or repository evidence clearly supports `standard`. Use `audit-only` when the repository is large, unfamiliar, sparse, or risky enough that writing starter notes would likely produce generic content. Use `standard` or `detailed` only when the note plan can be backed by concrete source evidence.

Workflow:

1. Inspect README, project files, build/test configuration, entrypoints, routes/modules, deployment files, and existing `wiki/`.
2. If notes already exist, run `wiki_schema_report` when available and prefer Migrate unless the user wants additive starter notes.
3. Choose a note plan. Prefer fewer authoritative notes over many thin notes.
4. Write only verified facts. Put clear inferences in `Evidence` or skip them.
5. Keep notes concise: decision-ready summary first, repository-relative source paths in `Evidence`, search terms in `Retrieval hints`.
6. Include capability specifications only for units whose behavior is concrete enough to guide implementation or reconstruction.
7. Write complete notes with `wiki_write` when available.

## Migrate

Use when converting existing notes into concise typed packet sources.

Workflow:

1. Run `wiki_schema_report` when available. Use per-note issues, gaps, `kind`, `packet_compiled`, missing sections, duplicate IDs, and broken links as the queue.
2. If unavailable, list notes with `wiki_list`; otherwise inspect `wiki/**/*.md`.
3. Read candidate notes with `wiki_read` or normal file reads.
4. Classify each note as `rule`, `decision`, `reference`, `runbook`, or `glossary`.
5. Report proposed broad changes before writing when migration affects many notes or splits/merges content.
6. Preserve durable facts, repository-relative source paths, links, explicit decisions, and active constraints.
7. Remove stale noise, task logs, baseline-search narration, and obsolete todos unless they affect active decisions.
8. Write complete updated notes with `wiki_write` when available.
9. Validate with `wiki_schema_report` and 2-3 representative `wiki_search` queries when MCP tools are available.

## Maintain

Use when a durable wiki gap exists, existing guidance is stale or conflicting, or retrieval quality is poor.

Shared rules:

- Meet the `AGENTS.md` write-back criteria before writing.
- Update an existing note unless no clear owner exists.
- Choose the narrowest correct `kind`.
- Generalize the invariant; put task-specific examples in `Evidence` unless the specificity is the invariant.
- Set `last_verified` to today's date on every touched note.
- Update index links when creating, moving, or renaming notes.
- Preserve user corrections, durable preferences, and repeated error-to-fix lessons only when project-relevant, reusable, and verified enough.
- When a routine bug exposes a reusable invariant, regression risk, contract behavior, or repeated fix pattern, capture that lesson without preserving the incident transcript.
- Ask before writing changes that alter policy, architecture, ownership, naming, product meaning, or public behavior unless the user explicitly requested the write-back.
- For missing capability reconstruction guidance, either write the smallest verified specification, ask for a focused documentation pass, or report a follow-up candidate.

Optimization workflow:

1. Run 2-3 representative baseline queries.
2. Correct `kind`; split mixed concerns when one packet cannot answer cleanly.
3. Move decision-ready content near the top.
4. Add likely search terms to headings or `Retrieval hints`.
5. Remove stale/noisy content that no longer affects active work.
6. Re-run baseline queries and check whether the intended note appears in the top results, whether the packet is decision-ready for routine use without a full-note read, whether stale or low-confidence packets are clearly marked, and whether common developer vocabulary maps to the note.
7. Summarize the retrieval improvement in the response, not inside domain notes unless it changes the note's meaning.

## Audit

Use for explicit schema, retrieval, drift, provenance, trust, or quality checks.

Workflow:

1. Run `wiki_schema_report` when available.
2. Inspect packet gaps, stale verification, duplicate IDs, broken links, missing sections, and uncompiled notes.
3. Run representative `wiki_search` queries for one rule/decision, one reference fact, and one likely developer search phrase.
4. For each representative query, check whether the expected note appears in the top results, whether the packet can guide the next action without a full-note read, whether stale or low-confidence packets are clearly marked, and whether missing guidance is a durable follow-up candidate.
5. Read full notes only where the report or packet results show ambiguity.
6. Fix trivial typed-note issues with `wiki_write` only when the user asked for fixes or the issue blocks the current task.
7. Report remaining gaps, risks, retrieval-quality signals, and recommended follow-up actions.

## Output

Keep responses compact. For explicit wiki work, state the selected path, adopted packet guidance or explicit wiki gap, notes changed if any, and whether MCP tools were used. For normal code tasks, mention wiki retrieval only when it materially shaped the work, exposed a stale/conflicting note, produced a wiki write, or identified a durable follow-up candidate.
