# Agents

## Knowledge Governance

This repository uses `$wiki` as the governed project knowledge workflow. Use it for packet-first retrieval, wiki initialization, typed-note migration, note maintenance, retrieval optimization, and schema or trust audits.

Keep responsibilities separated:

- `AGENTS.md` defines durable repository policy for agents.
- `.agents/skills/wiki/SKILL.md` defines workflow mechanics for wiki retrieval and authoring.
- `wiki/` contains project, product, architecture, domain, and operational knowledge.

Keep detailed workflow instructions in the `$wiki` skill. If the wiki and code disagree, verify the implementation and update the wiki only when the write-back criteria below are met.

## Retrieval Gate

Before non-trivial implementation, debugging, review, planning, repository analysis, codebase orientation, or delegated exploration, run `$wiki` retrieval. Retrieve the direct task context and any relevant governing guidance: architecture decisions, boundaries, contracts, quality attributes, placement rules, operational constraints, or reusable patterns.

For delegated work, pass along or restate the retrieved governing guidance that constrains the subtask. Sub-agents should receive the same applicable rules, decisions, contracts, and open questions before narrowing into local file searches.

Keep retrieval scoped to the task. Prefer compiled packets over full notes. Load full notes only when packet results are incomplete, conflicting, stale, security-sensitive, contract-sensitive, or decision-changing.

If retrieval returns no useful guidance, state the gap plainly. Continue with code inspection when appropriate, but keep wiki-backed facts, code-verified facts, and inference distinct when the distinction affects the outcome.

Ask the user only when missing information changes the target, scope, public behavior, risk profile, or durable meaning of a wiki update. Otherwise proceed with a bounded assumption and state it when material.

## Note Taxonomy

Every wiki note must declare `kind:` in frontmatter:

- `rule` for mandatory durable behavior.
- `decision` for architecture, product, or implementation decisions.
- `reference` for durable facts, domain concepts, API shapes, capability context, and other non-mandatory knowledge.
- `runbook` for repeatable operational, development, or maintenance procedures.
- `glossary` for project vocabulary, aliases, acronyms, and naming conventions.

Keep references and decisions in their canonical sections rather than rule-style sections. Keep task logs, transient todos, and implementation transcripts out of the wiki unless they document durable debt, active constraints, or known limitations future agents must account for.

## Capability Specifications

Important delivery units should be reconstructable from the wiki: business capabilities, features, vertical slices, modules, components, bounded contexts, workflows, integrations, services, or the unit boundaries used by the team. Capture these as `kind: reference` capability specifications, typically under `features/<name>.md`, `components/<name>.md`, or `integrations/<name>.md`.

A capability specification should provide a reconstruction-ready overview of:

- purpose, scope, and business value;
- externally visible behavior, actors, workflows, business rules, and edge cases;
- contracts, data/state model, integration points, and compatibility expectations;
- architecture boundaries, ownership, dependencies, extension points, and prohibited coupling;
- quality attributes such as security, authorization, privacy, accessibility, performance, reliability, observability, and auditability;
- acceptance criteria, verification strategy, regression risks, and relevant test/runbook links;
- current implementation anchors, evidence, assumptions, and open questions.

Keep capability specifications portable. Lead with durable intent, behavior, constraints, and interfaces. Label project-specific implementation details as current bindings or evidence rather than universal requirements.

When planning, implementing, debugging, reviewing, or modifying a capability that lacks reusable reconstruction guidance, capture the smallest useful specification only when the relevant facts are already verified and low effort to document. If a proper specification requires more discovery, ask whether to run a focused documentation pass; name the target note, the areas to inspect, and the expected value. When documentation would materially expand the current task, continue the primary work and report the specification as a follow-up candidate.

## Write-Back Criteria

Use the `$wiki` maintain path only when the result would help future sessions make correct decisions: architecture rules, decisions, capability specifications, domain facts, repeated implementation patterns, placement conventions, contract behavior, operational constraints, stale or conflicting guidance, or cross-cutting behavior affecting data model, migrations, APIs, startup, import/export, or major user workflows.

Update wiki notes for reusable project knowledge. Skip write-back for one-off task details, cosmetic changes, typo fixes, routine isolated bugs, or outcomes that future sessions would not need to retrieve by name.

Treat user corrections, durable preferences, and repeated error-to-fix lessons as write-back candidates only when they are project-relevant, reusable, and sufficiently verified. Ask before writing changes that alter policy, architecture, ownership, naming, public behavior, or product meaning.

After every wiki write, perform the smallest useful verification: read/search the touched note, run a schema report for migration/audit work, or run a representative search when improving retrieval.

## Delivery Standard

Report wiki activity only when it changes the user-visible outcome:

- Name wiki notes that were created, updated, migrated, or audited.
- Mention retrieved guidance only when it materially shaped the answer, constrained the work, or exposed a durable gap.
- Mention durable follow-up candidates when missing guidance should be captured later.

## Operating Rules

- Follow architecture, placement, quality, and contract guidance from relevant wiki notes.
- Prefer targeted changes within task scope; leave unrelated modernization for explicit follow-up work.
- Use canonical wiki homes from the `$wiki` skill when creating, migrating, or moving notes.
- Prefer broadening or correcting existing guidance over creating narrow duplicate notes.
- Use examples as evidence unless the example itself is the invariant.
- Keep responses concise by default: changed files, verification, and decision-changing context.
