# harness

`harness` installs the local agent and MCP configuration needed to use
[`ihorleleka/Project-Rag-Wiki`](https://github.com/ihorleleka/Project-Rag-Wiki)
from a consumer repository.

The package does not store wiki content. It provides:

- a Docker-backed `wiki-manager` MCP runner
- repository-level agent instructions and editor MCP configuration
- a single routed `$wiki` skill for retrieval, setup, migration, maintenance, and audit
- update wrappers so committed installs can be refreshed consistently

## Installation

Run from the consumer repository root:

```bash
docker pull ihorleleka/project-rag-wiki:latest
npx github:ihorleleka/harness install . --force
```

The GitHub ref must contain `package.json` and `bin/harness.js`; commit and push
harness package changes before installing from another repository.

To refresh an existing committed install:

```bash
npx github:ihorleleka/harness update . --force
```

or use the wrapper installed under `.agents`:

```bash
.agents\update-harness.cmd --force
```

On macOS or Linux:

```bash
sh ./.agents/update-harness.sh --force
```

## Installed Layout

The installer writes a managed runner payload under `.agents` and expands
repository-level configuration into the consumer repository root:

```text
<consumer-repo>/
  .agents/            <- managed harness runner payload
  AGENTS.md           <- repository agent policy
  opencode.json       <- OpenCode MCP configuration
  .claude/            <- local Claude configuration
  .codex/             <- local Codex configuration
  .vscode/            <- VS Code MCP configuration
  wiki/               <- consumer-owned wiki content
```

The source template for root-level assets lives in `templates/root` inside this
package. The managed `$wiki` skill source lives at
`templates/root/.agents/skills/wiki`. The installer copies that skill into the
consumer `.agents/skills` directory without replacing user-added skills. The
installed `.agents/README.md` is intentionally short and consumer-facing; this
root README remains package documentation. The runtime expects `.agents` to be a
direct child of the consumer repository because `run-wiki-manager.mcp.js`
resolves its parent directory as the project root.

The installer supports a custom direct-child runner directory:

```bash
npx github:ihorleleka/harness install . --agents-dir harness-agent --force
```

Each install writes `.harness-install.json` inside the runner directory with the
package name, package version, install timestamp, and selected runner directory.

## Update Behavior

Install and update preserve user-added skill directories under
`.agents/skills`. They replace only the managed `$wiki` skill and explicitly
remove legacy split harness skills:

- `retrieve-knowledge`
- `initialize-wiki`
- `migrate-wiki`
- `wiki-maintenance`

Root-level assets are not overwritten unless `--force` is used. Use `--force`
when you intentionally want the current harness policy and editor configuration
to replace the committed copies.

Recommended committed update flow:

```bash
.agents\update-harness.cmd --force
git status
git add .agents AGENTS.md opencode.json .claude .codex .vscode wiki
git commit -m "chore: update wiki harness"
```

On macOS or Linux:

```bash
sh ./.agents/update-harness.sh --force
git status
git add .agents AGENTS.md opencode.json .claude .codex .vscode wiki
git commit -m "chore: update wiki harness"
```

## Agent Workflow

The installed instructions are built around packet-first retrieval through the
configured `wiki-manager` MCP server. For non-trivial implementation,
debugging, review, planning, repository analysis, delegated exploration, or
ordinary codebase searches, agents should use the `$wiki` retrieve path before
editing or concluding.

Retrieval should cover the direct task context plus any likely governing
guidance that could constrain the work. Keep this relevance-based: query what
might matter for the task instead of loading broad wiki areas by default.

Agents should be explicit about wiki gaps, stale or low-confidence guidance, and
bounded search coverage. If the wiki appears missing, empty, broken, or
untrusted, use the `$wiki` initialize or audit path instead of presenting normal
repository search as wiki-backed guidance.

Agents should ask questions only when missing information changes the target,
scope, risk, or durable meaning of a wiki update. Otherwise they should proceed
with a bounded assumption and distinguish wiki-backed facts, code-verified
facts, and inference when that distinction matters.

Delegated agents and sub-agents use the same retrieve path unless the request is
a tiny literal lookup with an already-known file or symbol. Wiki packets guide
where to search; code inspection remains the source of truth when the wiki is
stale or incomplete.

## Wiki Skill

Lifecycle work uses the routed `$wiki` skill:

- retrieve path - packet-first repository knowledge lookup
- initialize path - bootstrap a new or empty `wiki/`
- migrate path - convert existing notes to the typed note schema
- maintain path - enrich or optimize individual notes
- audit path - inspect schema health, retrieval quality, stale notes, duplicate IDs, and broken links

The `wiki-manager` MCP surface used by the skill is:

- `wiki_search` - returns decision-ready context packets before raw chunks when packets match
- `wiki_read` - reads a complete Markdown note
- `wiki_list` - lists indexed Markdown notes
- `wiki_schema_report` - audits typed note schema, packet gaps, stale verification, duplicate IDs, and broken wiki links
- `wiki_write` - writes a complete Markdown note and refreshes the index

Packets are derived from normal Markdown notes by the MCP server. Agents do not
author generated packet files.

## Typed Notes

Wiki notes use YAML frontmatter and one of five durable knowledge kinds:

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

Supported `kind` values:

- `rule` - mandatory durable behavior agents should follow
- `decision` - architecture, product, or implementation choices
- `reference` - durable facts, concepts, API shapes, or domain context that are not rules
- `runbook` - repeatable operational or maintenance procedures
- `glossary` - names, terms, aliases, and vocabulary

Each kind has a compact note shape:

| kind | sections |
|---|---|
| `rule` | `Use this when`, `Rule`, `Do`, `Do not`, `Evidence`, `Retrieval hints` |
| `decision` | `Use this when`, `Decision`, `Rationale`, `Consequences`, `Evidence`, `Retrieval hints` |
| `reference` | `Use this when`, `Summary`, `Key facts`, `Evidence`, `Retrieval hints` |
| `runbook` | `Use this when`, `Steps`, `Do not`, `Evidence`, `Retrieval hints` |
| `glossary` | `Terms`, `Aliases`, `Retrieval hints` |

Do not force notes into `Do` / `Do not` when they are decisions or references.
Keep todos out of wiki unless they represent durable debt, known limitations, or
deferred work future sessions must account for.

Suggested wiki sections are a menu, not a checklist. The `$wiki` initialize path
uses them when bootstrapping, the migrate path uses them as consolidation
targets, and the maintain path uses them as canonical homes when a durable gap
needs a new note:

- `index.md` (`reference`) - map of active notes and retrieval hints
- `overview.md` (`reference`) - repository purpose, runtime, and entrypoints
- `architecture.md` (`decision`) - major architecture, product, or implementation choices
- `coding-standards.md` (`rule`) - mandatory coding, validation, testing, generated-code, or review rules
- `development-runbook.md` (`runbook`) - install, build, test, run, and verification commands
- `components/<name>.md` (`reference`) - primary modules, bounded contexts, or domains
- `api.md` or `api/<area>.md` (`reference` or `rule`) - public contracts, routes, request/response shapes, or compatibility rules
- `data.md` or `data/<area>.md` (`reference` or `decision`) - data model facts, persistence choices, migrations, indexing, import/export, or integration contracts
- `ui-patterns.md` (`rule` or `reference`) - shared UI conventions, component placement, accessibility, or interaction patterns
- `operations/<topic>.md` (`runbook`) - deployment, configuration, maintenance, observability, recovery, or repeated operational tasks
- `rules/<topic>.md` (`rule`) - focused mandatory placement or behavior rules
- `glossary.md` (`glossary`) - project terms, aliases, acronyms, and naming vocabulary

Create notes only when verified repository evidence supports useful content.
Never create empty placeholders just because a section appears in the menu.

## Write Policy

There is intentionally no append workflow. Agents should read the current note,
merge changes locally, then use `wiki_write` with the complete document. This
keeps frontmatter, semantic sections, links, and retrieval hints coherent enough
for future searches to return useful packets.

After wiki writes, agents should run the smallest useful verification: read or
search the touched note, run `wiki_schema_report` for migration/audit work, or
run a representative `wiki_search` when optimizing retrieval.

When implementation reveals durable behavior, facts, or decisions missing from
retrieved packets, agents should use the `$wiki` maintain path in the same
session so future sessions receive that guidance as packet context. Use
`kind: reference` or `kind: decision` for durable facts or choices that are not
mandatory rules.

Useful user corrections, durable preferences, and repeated error-to-fix lessons
may become write-back candidates when they are project-relevant and reusable.
Agents should ask before promoting broad or policy-changing guidance.

## Runtime

The entrypoint is [`templates/root/.agents/run-wiki-manager.mcp.js`](templates/root/.agents/run-wiki-manager.mcp.js).

At startup it:

1. resolves the parent of `.agents` as the consumer repository root
2. finds or selects a local TCP port
3. starts `ihorleleka/project-rag-wiki:latest` in Docker
4. mounts the consumer repository `wiki/` into `/workspace/wiki`
5. exposes the MCP endpoint through a local stdio bridge

If a matching container is already running and healthy, the runner attaches to
it instead of starting a second instance.

Prerequisites:

- Docker installed and available on `PATH`
- Node.js available to run `.agents/run-wiki-manager.mcp.js`
- a consumer repository with a `wiki/` folder

## Configuration

Environment variables:

- `KB_IMAGE` - Docker image to run. Default: `ihorleleka/project-rag-wiki:latest`
- `KB_PORT` - preferred local port
- `KB_FIND_FREE_PORT` - set to `0` to disable port fallback
- `KB_CONTAINER_NAME` - override generated container name
- `KB_VOLUME` - override KB Docker volume name
- `HF_CACHE_VOLUME` - override Hugging Face cache volume name
- `KB_EMBEDDING_MODEL` - embedding model name
- `KB_CHUNK_SIZE`
- `KB_CHUNK_OVERLAP`
- `KB_TOP_K`
- `KB_MERGE_ADJACENT_WINDOW`
- `KB_STALENESS_DAYS` - age threshold for packet `needs_verification`; default `90`
- `KB_WATCH_INTERVAL_SECONDS`

## Schema Upgrades

When upgrading a consumer repository from older untyped notes to the typed
schema:

1. Update the committed harness copy:

   ```bash
   .agents\update-harness.cmd --force
   ```

   On macOS or Linux:

   ```bash
   sh ./.agents/update-harness.sh --force
   ```

2. Pull the current wiki service image:

   ```bash
   docker pull ihorleleka/project-rag-wiki:latest
   ```

3. If a wiki service container is already running, stop it so the runner starts
   a fresh container from the updated image.

4. Run the `$wiki` migrate path. The skill should use `wiki_schema_report` when
   the updated container exposes it, then rewrite complete notes through
   `wiki_write`.

5. Commit the harness update and migrated wiki notes together.

If `wiki_schema_report` is missing, the consumer repository is still using an
older Project-Rag-Wiki image or an old running container. Pull the image and
restart the service before migrating broad wiki content.

## Verification

Before committing harness changes, run:

```bash
npm run verify
```

This installs the template into scratch repositories, checks generated MCP
runner references, verifies install marker metadata, checks custom
`--agents-dir` rewriting, and runs `npm pack --dry-run`.

## Publishing

Before publishing, verify the package contents:

```bash
npm pack --dry-run
```

Then publish the scoped package publicly:

```bash
npm login
npm publish --access public
```

Scoped npm packages are private by default, so `--access public` is required for
the first public publish. For later releases, bump the version first:

```bash
npm version patch
npm publish --access public
```

Consumers may still install directly from GitHub:

```bash
npx github:ihorleleka/harness install . --force
npx github:ihorleleka/harness update . --force
```

## Scope

This repository is runner and configuration infrastructure around
`Project-Rag-Wiki`. Core retrieval, indexing, packet generation, and schema
reporting live in the upstream wiki service. This package owns the local runner,
install/update flow, agent instructions, skill packaging, and editor MCP
configuration.
