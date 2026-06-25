---
name: migrate-wiki
description: Migrate existing wiki notes to the current typed note schema. Use when the user asks to migrate, upgrade, convert, normalize, validate, or clean up wiki notes after schema changes, especially adding kind frontmatter and rule/decision/reference/runbook/glossary sections.
---

# Migrate Wiki

Goal: convert existing wiki notes into concise typed packet sources without losing durable knowledge.

## Default Path

Run migration as audit-first:

1. Run `wiki_schema_report` when available. Use its per-note `issues`, `gaps`, `kind`, `packet_compiled`, `missing_sections`, duplicate IDs, and broken links as the migration queue.
2. If `wiki_schema_report` is unavailable, list notes with `wiki_list`; otherwise inspect `wiki/**/*.md`.
3. Read candidate notes with `wiki_read` or normal file reads.
4. Classify each note as `rule`, `decision`, `reference`, `runbook`, or `glossary`.
5. Report the proposed changes before writing when the migration affects many notes or splits/merges content.
6. Write complete updated notes with `wiki_write` when available; otherwise edit files directly and tell the user indexing was not invoked.

For one or two obvious notes, it is acceptable to migrate directly and summarize the change.

## Migration Rules

- Preserve durable facts, source paths, links, and explicit decisions.
- Add `kind:` frontmatter and `last_verified:` only when facts were checked in this session.
- Prefer correcting existing notes over creating new files.
- Split mixed notes only when one packet cannot answer cleanly, such as mandatory rules mixed with broad reference facts.
- Remove stale noise, task logs, baseline-search narration, and obsolete TODO lists unless they affect active decisions.
- Keep TODO-like content only when it represents durable debt, a known limitation, or deferred work future sessions must account for.
- Do not invent architecture decisions from file names alone; verify against code or mark as an explicit gap in the response instead of writing.

## Section Mapping

- Legacy `Decision` plus `Do` / `Do not`: usually `kind: decision` if it explains a choice, or `kind: rule` if it mandates behavior.
- Narrative background: usually `kind: reference` with `Summary` and `Key facts`.
- Command sequences or operational steps: `kind: runbook`.
- Acronyms, aliases, naming conventions: `kind: glossary`.
- Mandatory placement, API, data, migration, startup, or UI workflow invariants: `kind: rule`.

## Validation

After migration, run `wiki_schema_report` again when available. Then run 2-3 representative `wiki_search` queries when MCP tools are available:

- one query for a rule or decision
- one query for a reference fact
- one query using likely developer search terms

The follow-up report should have no avoidable schema errors for migrated notes. Top packet results should expose `kind`, current `last_verified`, useful `rule` headline, relevant typed fields, and no avoidable schema `gaps`.

## Output

Keep output compact: notes migrated, notes split/merged, unresolved gaps, and whether representative searches returned useful packets.
