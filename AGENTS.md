# Agents

## Skill routing

| trigger | skill |
|---|---|
| non-trivial implementation or debugging | `retrieve-knowledge` |
| wiki gap, stale note, or conflicting guidance found | `wiki-maintenance` (enrich path) |
| retrieval quality or structure audit | `wiki-maintenance` (optimize path) |

Skill files are the workflow source of truth. `AGENTS.md` owns durable repository policy; skills own retrieval/authoring workflow mechanics. Do not duplicate procedures here.

## Wiki evidence gate (mandatory)

Before any code edit on a non-trivial task, record:

- query used
- snippet source path(s) or explicit gap statement
- `last_verified:` date of source note (or "missing")
- adopted rule

If this checkpoint cannot be produced, perform wiki search before proceeding.

If code reality contradicts wiki guidance, treat wiki as source of truth unless proven stale - then update the note in the same session.

## Delivery standard

Every response must state one of:
- which wiki note was updated and why
- why no wiki update was needed

## Stop condition

Stop and return to wiki lookup if work drifts into rediscovering architecture from code while relevant wiki likely exists. Missing wiki consultation for covered domains is a process failure - correct it in the same turn.
Retrieval may be re-entered during the same task whenever a new subtopic, constraint, or implementation decision emerges that should be verified before editing that area.

## Core rules

- Choose the work area from the task before editing.
- Follow architecture and placement rules from the relevant wiki notes.
- Prefer targeted changes within task scope; do not opportunistically modernize unrelated areas.
- Keep wiki note scope explicit: `project-specific` | `platform` | `general`.
- Route changes by purpose: repository-wide durable rules in `AGENTS.md`; living domain knowledge in `wiki/`; workflow mechanics in skill files.
- Do not run frontend builds unless the user explicitly asks.
- Keep this file limited to durable working rules; put evolving knowledge in `wiki/`.
