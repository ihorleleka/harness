# Wiki Harness

This directory is the managed local runner payload for the repository wiki.

Use the wrapper here to refresh the committed harness files:

```bash
.\update-harness.cmd --force
```

On macOS or Linux:

```bash
sh ./update-harness.sh --force
```

The update preserves user-added skill directories under `skills/`, replaces the
managed `skills/wiki` skill, and removes old split harness skills from earlier
versions.

The MCP entrypoint is `run-wiki-manager.mcp.js`. Repository-level agent policy
and editor MCP configuration live in the repository root.
