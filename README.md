# harness

`harness` is a thin runner repository for [`ihorleleka/Project-Rag-Wiki`](https://github.com/ihorleleka/Project-Rag-Wiki).

It does not contain the wiki content itself. Its job is to:

- start the `Project-Rag-Wiki` MCP server in Docker
- mount the consumer repository's `wiki/` folder into that container
- provide local agents skills and editor settings that support that workflow

## Intended placement

This repository is meant to be consumed from another repository, ideally as a git submodule mounted at:

```text
<consumer-repo>/.agents
```

That layout matters because the runner resolves the **parent directory** as the real project root and expects to find:

- `../wiki` as the wiki source
- container and volume names derived from the consumer repo context

In practice, the expected structure is:

```text
<consumer-repo>/
  .agents/            <- this repository
  (agent-related local MCP config assets at repo root)
  wiki/               <- consumer repo wiki content
```

## Important repository layout note

For real use, agent-related folders/files and local MCP configuration assets should be brought up one level higher into the consumer repository root, not left inside this repository.

Why:

- `AGENTS.md` needs to govern work at the consumer repo boundary, not only inside the `.agents` submodule
- `.codex` usually needs to apply to the full consumer repository, not only the runner submodule
- `.vscode` workspace settings are also more useful at the consumer repo root
- the runner script already treats the parent directory as the operating root, so editor and Codex config should match that same boundary

If this repository is added as a submodule, the recommended follow-up is:

1. keep the runner repository in `.agents`
2. move or replicate agent-related local MCP config assets from this repository to the consumer repository root

## What the runner does

The entrypoint is [`run-kb-mcp.js`](/C:/Solutions/harness/run-kb-mcp.js).

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
- Node.js available to run `run-kb-mcp.js`

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
- `KB_WATCH_INTERVAL_SECONDS`

## Suggested setup

Example submodule setup from the consumer repository root:

```bash
git submodule add https://github.com/ihorleleka/harness .agents
```

Then make sure the consumer repo owns:

- agent-related local MCP config assets at repository root
- `wiki/`

and invoke the runner from the `.agents` checkout when wiring MCP tooling.

## Scope

This repository is runner infrastructure around `Project-Rag-Wiki`, not a replacement for it. The core retrieval/indexing behavior lives in the upstream project; this repository provides the surrounding local harness and workflow glue.
