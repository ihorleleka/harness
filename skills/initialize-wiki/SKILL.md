---
name: initialize-wiki
description: Bootstrap a new repository wiki after harness installation, especially when wiki/ is empty or missing useful starter notes. Use when the user asks to initialize, seed, scaffold, or create an initial LLM wiki, and support selectable depth modes from high-level to detailed.
---

# Initialize Wiki

Goal: create a useful typed wiki starter set from the installed repository without over-documenting or inventing facts.

## Modes

- `audit-only`: inspect the repo and propose notes without writing.
- `minimal`: create only `index.md` and one high-level `overview.md`.
- `standard`: create index, overview, architecture decisions, run/build/test runbook, primary components, and glossary when useful.
- `detailed`: create standard notes plus subsystem references, data/API references, placement rules, operational runbooks, and known decisions that are directly supported by code.

Default to `standard` when the user asks to initialize without choosing a mode. Ask only if mode choice materially affects expected output or repository size.

## Workflow

1. Inspect repository shape: README, package/project files, build/test config, app entrypoints, routes/modules, deployment files, and existing `wiki/`.
2. If existing notes are present, run `wiki_schema_report` when available and recommend `$migrate-wiki` unless the user explicitly wants additive starter notes.
3. Choose mode and note plan. Prefer fewer canonical notes over many thin notes.
4. Use typed note shapes from `AGENTS.md`: `rule`, `decision`, `reference`, `runbook`, `glossary`.
5. Write only verified facts. If a fact is inferred, say so in `Evidence` or skip it.
6. Keep each note short: decision-ready answer first, source paths in `Evidence`, search terms in `Retrieval hints`.
7. Use `wiki_write` for complete notes when MCP tools are available. If not, write Markdown files under `wiki/` and tell the user MCP indexing was not invoked.
8. Do not add generated packet files, task logs, implementation transcripts, or broad TODO inventories.

## Starter Notes

Use these as a menu, not a required checklist:

- `index.md` (`reference`): map of active notes and retrieval hints.
- `overview.md` (`reference`): repository purpose, main runtime, important entrypoints.
- `architecture.md` (`decision`): major architectural choices that are evident from code.
- `development-runbook.md` (`runbook`): install, build, test, run, and common verification commands.
- `components/<name>.md` (`reference`): only for primary modules or domains.
- `rules/<topic>.md` (`rule`): only for mandatory placement or behavior rules.
- `glossary.md` (`glossary`): project terms, aliases, and acronyms.

## Quality Bar

- Prefer a useful small wiki over a complete noisy one.
- Split notes only when future searches would naturally use different terms.
- Avoid documenting ordinary framework behavior unless the repo customizes it.
- Mark `last_verified` as today only for notes whose facts were checked in this session.
- Stop expanding when more notes would require speculation or deep exhaustive review outside the selected mode.

## Output

State the selected mode, notes created or planned, and whether MCP `wiki_write` was used. Keep details compact unless the user requested an audit-only plan.
