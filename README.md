# harness

`harness` is a thin runner repository for [`ihorleleka/Project-Rag-Wiki`](https://github.com/ihorleleka/Project-Rag-Wiki).

It does not contain the wiki content itself. Its job is to:

- start the `Project-Rag-Wiki` MCP server in Docker
- mount the consumer repository's `wiki/` folder into that container
- provide local agents skills and editor settings that support that workflow

## Quick setup

Run these commands from the consumer repository root.

First, pull the Docker image used by the wiki MCP server:

```bash
docker pull ihorleleka/project-rag-wiki:latest
```

Then install the harness with npx:

```bash
npx github:ihorleleka/harness install . --force
```

The GitHub ref must contain `package.json` and `bin/harness.js`, so commit and
push harness package changes before using this command from another repository.

Later, refresh the installed harness with:

```bash
npx github:ihorleleka/harness update . --force
```

Or use the committed wrapper script that the installer places under `.agents`:

```bash
.agents\update-harness.cmd --force
```

On macOS or Linux:

```bash
sh ./.agents/update-harness.sh --force
```

## Agent wiki workflow

The installed agent instructions are built around packet-first wiki retrieval.
For non-trivial implementation or debugging, agents should use
`$retrieve-knowledge` before editing and prefer `wiki_search` results where
`record_type` is `packet`.

For wiki lifecycle work, agents use separate skills:

- `$initialize-wiki` - bootstrap a new or empty `wiki/` with selectable depth modes.
- `$migrate-wiki` - convert existing notes to the current typed note schema.
- `$wiki-maintenance` - enrich or optimize individual notes during normal work.

Packets are derived from normal Markdown notes by the MCP server. Agents do not
author generated packet files. They maintain standard wiki notes with:

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

Supported `kind` values are:

- `rule` - mandatory durable behavior agents should follow.
- `decision` - architecture, product, or implementation choices.
- `reference` - durable facts, concepts, API shapes, or domain context that are not rules.
- `runbook` - repeatable operational or maintenance procedures.
- `glossary` - names, terms, aliases, and vocabulary.

Each kind has its own compact note shape:

| kind | sections |
|---|---|
| `rule` | `Use this when`, `Rule`, `Do`, `Do not`, `Evidence`, `Retrieval hints` |
| `decision` | `Use this when`, `Decision`, `Rationale`, `Consequences`, `Evidence`, `Retrieval hints` |
| `reference` | `Use this when`, `Summary`, `Key facts`, `Evidence`, `Retrieval hints` |
| `runbook` | `Use this when`, `Steps`, `Do not`, `Evidence`, `Retrieval hints` |
| `glossary` | `Terms`, `Aliases`, `Retrieval hints` |

Do not force notes into `Do` / `Do not` when they are really references or
decisions. Keep todos out of wiki unless they represent durable debt, known
limitations, or deferred work future sessions must account for.

The wiki MCP surface used by the harness is:

- `wiki_search` - returns decision-ready context packets before raw chunks when packets match
- `wiki_read` - reads a complete Markdown note
- `wiki_list` - lists indexed Markdown notes
- `wiki_schema_report` - audits typed note schema, packet gaps, stale verification, duplicate IDs, and broken wiki links
- `wiki_write` - writes a complete Markdown note and refreshes the index

There is intentionally no append workflow. Agents should read the current note,
merge changes locally, then use `wiki_write` with the complete document. This
keeps frontmatter, semantic sections, links, and retrieval hints coherent enough
for future searches to return useful packets.

During agentic work, retrieval is not a one-time gate. Agents may re-enter
`$retrieve-knowledge` whenever a new component, constraint, data contract,
route, indexing path, auth boundary, or implementation decision appears.

When implementation reveals durable behavior missing from retrieved packets,
agents should use `$wiki-maintenance` in the same session so the wiki evolves
and future sessions receive the guidance directly as packet context.

When implementation reveals durable facts or decisions rather than mandatory
rules, agents should still use `$wiki-maintenance`; the note should be written as
`kind: reference` or `kind: decision` instead of pretending it is a rule.

## Delivery options

### Install with npx

The recommended delivery path is the GitHub-backed npx installer:

```bash
npx github:ihorleleka/harness install . --force
```

The GitHub ref must already contain `package.json` and `bin/harness.js`.

That command copies the runner payload into the target repository and expands the
agent configuration files into the repository root:

```text
<consumer-repo>/
  .agents/            <- copied harness runner payload
  AGENTS.md           <- copied from expand-to-root
  opencode.json       <- copied from expand-to-root
  .claude/
  .codex/
  .vscode/
  wiki/.gitkeep
```

The recommended command uses `--force` so the root assets from `expand-to-root`
are fully refreshed:

```bash
npx github:ihorleleka/harness install . --force
```

Without `--force`, existing root configuration files are left in place.

To refresh an existing installed copy:

```bash
npx github:ihorleleka/harness update . --force
```

The installer also copies update wrappers into the installed harness payload:

```bash
.agents\update-harness.cmd --force
sh ./.agents/update-harness.sh --force
```

Those scripts run `npx github:ihorleleka/harness update ..` from inside `.agents`.
They can be committed to the target repository and used by developers or CI.

The installer also supports a different direct-child folder name:

```bash
npx github:ihorleleka/harness install . --agents-dir harness-agent --force
```

The folder must be a direct child of the consumer repository because the runner
resolves its parent directory as the project root.

### Publishing the npx package

This repository already has the package metadata and CLI entrypoint needed for
public npm publishing:

```json
{
  "name": "@ihorleleka/harness",
  "bin": {
    "harness": "bin/harness.js"
  }
}
```

Before publishing, verify the package contents:

```bash
npm pack --dry-run
```

Then sign in and publish the scoped package publicly:

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

After publishing, consumers may still use the GitHub source directly:

```bash
npx github:ihorleleka/harness install . --force
npx github:ihorleleka/harness update . --force
```

### Updating committed installs

When the harness is installed with `npx`, the generated `.agents` directory and
root config files should usually be committed to the consumer repository. To
update that committed copy later:

```bash
.agents\update-harness.cmd --force
git status
git add .agents AGENTS.md opencode.json .claude .codex .vscode
git commit -m "chore: update harness"
```

On macOS or Linux:

```bash
sh ./.agents/update-harness.sh --force
git status
git add .agents AGENTS.md opencode.json .claude .codex .vscode
git commit -m "chore: update harness"
```

By default, root-level files are not overwritten if they already exist. Use
`--force` when you intentionally want the latest harness root assets to replace
the committed copies:

```bash
.agents\update-harness.cmd --force
```

For automated updates, run the same wrapper in CI on a schedule or manually, then
open a pull request with the resulting diff. The important command is still just:

```bash
npx github:ihorleleka/harness update . --force
```

### Upgrading existing typed-wiki installs

When upgrading a consumer repository from older untyped wiki notes to the typed
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
   a fresh container from the updated image. The old container can otherwise keep
   serving the previous MCP tool surface.

4. Run `$migrate-wiki`. The skill should use `wiki_schema_report` when the
   updated container exposes it, then rewrite complete notes through
   `wiki_write`.

5. Commit the harness update and migrated wiki notes together:

   ```bash
   git status
   git add .agents AGENTS.md opencode.json .claude .codex .vscode wiki
   git commit -m "chore: update wiki harness and migrate wiki schema"
   ```

If `wiki_schema_report` is missing, the consumer repo is still using an older
Project-Rag-Wiki image or an old running container. Pull the image and restart
the service before migrating broad wiki content.

## Intended placement

The harness is meant to be consumed from another repository with its runner
payload mounted at:

```text
<consumer-repo>/.agents
```

That layout matters because the runner resolves the **parent directory** as the real project root and expects to find:

- `../wiki` as the wiki source
- container and volume names derived from the consumer repo context

In practice, the expected structure is:

```text
<consumer-repo>/
  .agents/            <- installed harness runner payload
  AGENTS.md           <- expanded root policy
  opencode.json       <- expanded MCP config
  .claude/            <- expanded local agent config
  .codex/             <- expanded local agent config
  .vscode/            <- expanded local editor/MCP config
  wiki/               <- consumer repo wiki content
```

## Important repository layout note

For real use, agent-related folders/files and local MCP configuration assets
belong in the consumer repository root, not only inside `.agents`.

Why:

- `AGENTS.md` needs to govern work at the consumer repo boundary, not only inside `.agents`
- the rest of the files target different agents and editors, so they need to be
  expanded from `expand-to-root` into the root

The npx installer performs that expansion automatically.

## What the runner does

The entrypoint is [`run-wiki-manager-mcp.js`](/C:/Solutions/harness/run-wiki-manager-mcp.js).

At startup it:

1. resolves the parent of this repository as the working root
2. finds or selects a local TCP port
3. starts `ihorleleka/project-rag-wiki:latest` in Docker
4. mounts the consumer repo `wiki/` into `/workspace/wiki`
5. exposes the MCP endpoint through a small local bridge

If a matching container is already running and healthy, the runner attaches to it instead of starting a second instance.

## Prerequisites

- Docker installed and available on `PATH`
- a consumer repository with a `wiki/` folder
- Node.js available to run `run-wiki-manager-mcp.js`

## Environment variables

The runner supports these environment variables:

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

## Alternative: submodule

The submodule path is available when a project specifically wants Git to track
the harness as a nested repository. The npx installer is the preferred setup for
normal use.

From the consumer repository root:

```bash
git submodule add https://github.com/ihorleleka/harness .agents
xcopy .agents\expand-to-root\* . /E /I /Y
```

On macOS or Linux:

```bash
git submodule add https://github.com/ihorleleka/harness .agents
cp -R .agents/expand-to-root/. .
```

Then commit both the submodule reference and the expanded root assets.

## Scope

This repository is runner infrastructure around `Project-Rag-Wiki`, not a replacement for it. The core retrieval/indexing behavior lives in the upstream project; this repository provides the surr[...]
