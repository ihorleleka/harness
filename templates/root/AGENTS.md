# Agents

## Knowledge Governance

This repository uses `$wiki` as the governed project knowledge workflow. Use it for packet-first retrieval, wiki initialization, typed-note migration, note maintenance, retrieval optimization, and schema or trust audits.

Keep responsibilities separated:

- `AGENTS.md` defines durable repository policy for agents.
- `.agents/skills/wiki/SKILL.md` defines workflow mechanics for wiki retrieval and authoring.
- `wiki/` contains project, product, architecture, domain, and operational knowledge.

Keep detailed workflow instructions in the `$wiki` skill. If the wiki and code disagree, verify the implementation and update the wiki only when the write-back criteria below are met.

Wiki notes are committed repository content. Use repository-relative paths for evidence, examples, anchors, and handoffs. Do not write machine-local absolute paths such as drive-rooted Windows paths, home-directory paths, temporary paths, or editor-specific file URIs into wiki notes or durable agent guidance.

## Retrieval Gate

Before non-trivial implementation, debugging, review, planning, repository analysis, codebase orientation, codebase search, symbol or component discovery, or delegated exploration, run `$wiki` retrieval. Tiny literal lookups for an already-known file or symbol may skip retrieval. Retrieve the direct task context and any relevant governing guidance: architecture decisions, boundaries, contracts, quality attributes, placement rules, operational constraints, or reusable patterns.

For delegated work, pass along or restate the retrieved governing guidance that constrains the subtask. Sub-agents should receive the same applicable rules, decisions, contracts, and open questions before narrowing into local file searches. Use a compact handoff: relevant packets or notes, binding rules, contracts, open questions, code anchors, and verification constraints.

Keep retrieval scoped to the task. Prefer compiled packets over full notes. Load full notes only when packet results are incomplete, conflicting, stale, security-sensitive, contract-sensitive, or decision-changing.

Use separate focused searches for separate topics. Do not pack multiple capabilities, components, contracts, or policy areas into one long RAG query just because the server may return results. Prefer one short query per topic, then combine the retrieved packets in reasoning.

If retrieval returns no useful guidance, state the gap plainly. Continue with code inspection when appropriate, but keep wiki-backed facts, code-verified facts, and inference distinct when the distinction affects the outcome.

Ask the user only when missing information changes the target, scope, public behavior, risk profile, or durable meaning of a wiki update. Otherwise proceed with a bounded assumption and state it when material.

## Wiki Notes

Use the typed-note taxonomy and canonical homes defined in the `$wiki` skill. Every note must declare a `kind:` and should keep its structure appropriate to that kind.

Keep references and decisions in their canonical sections rather than rule-style sections. Keep task logs, transient todos, and implementation transcripts out of the wiki unless they document durable debt, active constraints, or known limitations future agents must account for.

Keep notes focused on one retrievable unit of knowledge. Prefer a parent map plus focused child notes when a topic spans distinct capability behavior, component boundaries, request lifecycle, API/message contracts, data or indexing, frontend interaction, backend service behavior, operations, quality rules, or architecture decisions. Split notes according to the size and scope thresholds in the `$wiki` skill before they become broad source inventories. Treat `wiki_schema_report` oversized-note warnings as actionable maintenance signals.

## Capability Specifications

Important delivery units should be reconstructable from the wiki: business capabilities, features, vertical slices, modules, components, bounded contexts, workflows, integrations, services, or the unit boundaries used by the team. Capture these as extended `kind: reference` capability specifications in the homes defined by the `$wiki` skill.

Do not create thin capability specifications. A useful specification must have concrete retrieval triggers, a behavior or contract summary, current implementation anchors, repository-relative evidence paths or symbols, a verification approach, and explicit open questions when coverage is partial. If those are not available with verified evidence, report the missing specification as a follow-up candidate instead of writing a low-signal note.

When planning, implementing, debugging, reviewing, or modifying a capability that lacks reusable reconstruction guidance, capture the smallest useful specification only when the relevant facts are already verified and low effort to document. If a proper specification requires more discovery, ask whether to run a focused documentation pass; otherwise report it as a follow-up candidate without blocking the primary work.

## Write-Back Criteria

Use the `$wiki` maintain path only when the result would help future sessions make correct decisions: architecture rules, decisions, capability specifications, domain facts, repeated implementation patterns, placement conventions, contract behavior, operational constraints, stale or conflicting guidance, or cross-cutting behavior affecting data model, migrations, APIs, startup, import/export, or major user workflows.

Update wiki notes for reusable project knowledge. Skip write-back for one-off task details, cosmetic changes, typo fixes, routine isolated bugs, or outcomes that future sessions would not need to retrieve by name. Do capture a durable invariant, regression risk, contract behavior, or repeated fix pattern when a routine bug reveals one; skip the incident log and preserve the reusable lesson.

For non-trivial work, consider every distinct durable topic discovered during investigation. Update every affected owner note when the evidence supports it. Do not use a single broad architecture note as the only write-back location when verified knowledge belongs in separate capability, component, API, data, UI, runbook, rule, or decision notes.

Treat user corrections, durable preferences, and repeated error-to-fix lessons as write-back candidates only when they are project-relevant, reusable, and sufficiently verified. Ask before writing changes that alter policy, architecture, ownership, naming, public behavior, or product meaning.

After every wiki write, perform the smallest useful verification: read/search the touched note, run a schema report for migration/audit work, or run a representative search when improving retrieval.

## Long-Running Implementation Cadence

For long-running implementation work, keep wiki retrieval active throughout. The initial retrieval before starting is not enough; new topics emerge as work progresses.

Before starting each new major task area, component, integration boundary, data/API contract, build/deployment area, or unfamiliar subsystem, run focused `$wiki` retrieval for that specific topic and any likely governing guidance. Re-query when code inspection reveals a new concrete capability, owner note, placement concern, quality constraint, or operational risk that was not covered by earlier packets.

Do not re-query for tiny literal edits where the relevant owner note was already retrieved and remains clearly applicable. Do re-query when moving from one task area to another, when the task introduces a new slice/component/contract, when retrieved guidance is stale or incomplete, or when implementation choices depend on architecture, placement, data flow, security, operations, tests, or public behavior.

Do not defer all wiki write-back until work is complete. After each major completed task group, runtime spike, architecture decision, reusable contract, build/deployment behavior, integration boundary, or verification pattern, pause briefly and evaluate the write-back criteria above.

Write to the wiki during implementation when verified knowledge would help future sessions continue correctly without rediscovering the same facts. Prefer updating or creating the smallest owner note for the durable topic, then continue implementation. Skip wiki writes for purely local task progress, transient failures, generated output, or facts already captured accurately in an owner note.

For long implementations, repeat this checkpoint periodically instead of proceeding indefinitely through the task list. At minimum, reassess wiki write-back when moving between major task areas or when the completed area established durable contracts, decisions, or runbooks.

## Delivery Standard

Report wiki activity only when it changes the user-visible outcome:

- Name wiki notes that were created, updated, migrated, or audited.
- Mention retrieved guidance only when it materially shaped the answer, constrained the work, or exposed a durable gap.
- Mention durable follow-up candidates when missing guidance should be captured later.

## Operating Rules

- Follow architecture, placement, quality, and contract guidance from relevant wiki notes.
- Prefer targeted changes within task scope; leave unrelated modernization for explicit follow-up work.
- Prefer durable implementation over narrow prompt satisfaction. Avoid shortcuts that only make the current task appear complete while weakening maintainability, testability, security, accessibility, observability, or future extension. When a pragmatic shortcut is appropriate, make the tradeoff explicit and keep it isolated.
- Design changes for reuse at the natural project boundary. Do not over-generalize prematurely, but avoid duplicating behavior or hard-coding assumptions when an existing abstraction, contract, configuration point, or owner module already provides the right home.
- Preserve operational and review quality. Non-trivial changes should leave clear ownership, verification paths, and failure behavior; avoid hidden coupling, implicit global state, brittle test-only behavior, and implementation details that future agents would have to rediscover.
- Prefer correcting the existing owner note over creating narrow duplicate notes, but create or split focused notes when a distinct durable topic lacks a clear owner or the existing note has grown too broad.
- Use examples as evidence unless the example itself is the invariant.
- Keep responses concise by default: changed files, verification, and decision-changing context.
