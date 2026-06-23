# Agents

## Skill routing

| trigger | skill |
|---|---|
| non-trivial implementation or debugging | `$retrieve-knowledge` |
| wiki gap, stale note, or conflicting guidance found | `$wiki-maintenance` (enrich path) |
| retrieval quality or structure audit | `$wiki-maintenance` (optimize path) |

Skill files are the workflow source of truth. `AGENTS.md` owns durable repository policy; skills own retrieval/authoring workflow mechanics. Do not duplicate procedures here.

## Wiki evidence gate (mandatory)

Before any code edit on a non-trivial task, run `$retrieve-knowledge` and record:

- query used
- context packet source path(s), snippet source path(s), or explicit gap statement
- `last_verified:` date of source note (or "missing")
- confidence / `needs_verification` when returned
- adopted rule

If this checkpoint cannot be produced, perform wiki search before proceeding.

Prefer compiled context packets over raw wiki prose. Packets are meant to be directly usable session context; avoid recomputing architecture decisions from full notes or source code when a current high-confidence packet already answers the question.

If code reality contradicts wiki guidance, treat the wiki as authoritative only until evidence proves it stale or incomplete. Then update the note in the same session using `$wiki-maintenance`.

## Delivery standard

Every response must state one of:
- which wiki note was updated and why
- why no wiki update was needed

## Stop condition

Stop and return to wiki lookup if work drifts into rediscovering architecture from code while relevant wiki likely exists. Missing wiki consultation for covered domains is a process failure - correct it in the same turn.
Retrieval may be re-entered at any time during the same task. Do it whenever a new subtopic, constraint, unfamiliar component, or implementation decision emerges that should be verified before editing that area.

## Core rules

- Choose the work area from the task before editing.
- Follow architecture and placement rules from the relevant wiki notes.
- Prefer targeted changes within task scope; do not opportunistically modernize unrelated areas.
- Keep wiki note scope explicit: `project-specific` | `platform` | `general`.
- Prefer standard wiki notes structured with `Decision`, `Do`, `Do not`, `Evidence`, and `Retrieval hints` so the MCP image can return decision-ready context packets.
- Treat context packets as MCP-owned derived index records: agents author source notes, the wiki MCP image parses/compiles/ranks packets and reports stale or contradictory evidence.
- Use `wiki_write` for wiki mutation. Do not rely on append-style wiki updates; rewrite the complete note so frontmatter, semantic sections, links, and retrieval hints stay coherent.
- When implementation reveals durable behavior not present in retrieved packets, enrich the wiki in the same session. The system should improve itself as work discovers reusable rules.
- Route changes by purpose: repository-wide durable rules in `AGENTS.md`; living domain knowledge in `wiki/`; workflow mechanics in skill files.
- Do not run frontend builds unless the user explicitly asks.
- Keep this file limited to durable working rules; put evolving knowledge in `wiki/`.
