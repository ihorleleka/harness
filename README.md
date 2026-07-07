# harness

`harness` installs the local agent configuration needed to use a Docker-backed
`wiki-manager` MCP server from an existing repository.

It gives coding agents a governed, repo-local wiki workflow: retrieve relevant
decisions, contracts, placement rules, runbooks, and capability notes before
editing; then write back durable knowledge when the work reveals something
future sessions should not rediscover.

## What You Get

- Docker-backed `wiki-manager` MCP runner
- repository `AGENTS.md` policy for wiki-backed agent work
- editor MCP configuration for Codex, Claude, OpenCode, and VS Code
- a routed `$wiki` skill for retrieval, initialization, migration, maintenance,
  and audit
- write-back guidance for focused notes, multi-note updates, and schema-report-backed note splitting
- a committed `wiki/` folder owned by the consumer repository
- update wrappers so committed harness files can be refreshed consistently

The package does not ship project knowledge. Your repository owns the wiki
content.

Wiki notes are meant to be committed and shared. Keep examples and evidence
portable: use repository-relative paths such as `src/app.ts`, not local absolute
paths from one developer's machine.

## Install

Run from the consumer repository root:

```bash
docker pull ihorleleka/project-rag-wiki:latest
npx github:ihorleleka/harness install . --force
```

This writes:

```text
<repo>/
  .agents/      managed harness runner and $wiki skill
  AGENTS.md     repository agent policy
  .claude/      Claude MCP configuration
  .codex/       Codex MCP configuration
  .vscode/      VS Code MCP configuration
  opencode.jsonc OpenCode MCP configuration
  wiki/         consumer-owned knowledge base
```

Prerequisites:

- Docker available on `PATH`
- Node.js 18 or newer
- a repository where the harness runner directory can live as a direct child

## Update

Refresh an existing committed install:

```bash
npx github:ihorleleka/harness update . --force
```

or use the installed wrapper:

```bash
.agents\update-harness.cmd --force
```

On macOS or Linux:

```bash
sh ./.agents/update-harness.sh --force
```

Install and update preserve user-added skill directories under
`.agents/skills`, replace only the managed `$wiki` skill, and remove older split
harness skills from previous versions. Existing `AGENTS.md` instructions and
editor MCP configuration are merged by default: the installer updates only the
managed wiki policy section and the `wiki-manager` MCP server entries while
leaving other harnesses, instructions, and MCP servers in place. Non-mergeable
root assets are overwritten only when `--force` is used.

## Check Setup

Inspect the local install without changing files:

```bash
npx github:ihorleleka/harness status .
```

Run local health checks for the harness, Node.js, and Docker CLI:

```bash
npx github:ihorleleka/harness doctor .
```

`doctor` does not pull images, start containers, or contact the network.

## Custom Runner Directory

The default runner directory is `.agents`. You can choose another portable
direct-child directory name:

```bash
npx github:ihorleleka/harness install . --agents-dir harness-agent --force
```

Do not use slashes, drive prefixes, shell metacharacters, Windows-reserved
names, or trailing dots/spaces. The runner must remain a direct child of the
consumer repository because the MCP runner resolves its parent as the project
root.

## Where Behavior Lives

This README is only the package overview. Installed behavior is documented in
the files delivered to each consumer repository:

- `AGENTS.md` for durable repository policy
- `.agents/skills/wiki/SKILL.md` for `$wiki` workflow mechanics
- `wiki/` for project-specific knowledge
