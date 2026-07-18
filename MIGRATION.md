# Harness Migration And Rollback

## Upgrade Safely

1. Commit or back up `wiki/`. Markdown is the durable data; `.kb` volumes are
   rebuildable indexes.
2. Run `harness status .` and record the installed harness version, configured
   image, container name, running digest, schema/tool-contract versions, agent
   directory, and KB volume override if present.
3. Install/update a specific harness release, preserving the selected directory:

   ```powershell
   npx github:ihorleleka/harness#<harness-tag> update . --force --agents-dir .agents
   ```

   Replace `.agents` with the directory reported by status. Omitting it when
   multiple markers exist is rejected rather than creating another install.
4. Run `harness pull .`, `harness restart .`, and `harness doctor . --live`.
5. Confirm status reports the expected immutable image digest and `current`
   compatibility before cleaning old containers or volumes.

Install/update merges only harness-managed AGENTS, MCP, and editor settings.
Comments, unrelated servers/settings, and user-added skills remain owned by the
repository.

## Basename Volumes And Existing Indexes

Current resource names include a canonical-path hash, so repositories with the
same basename no longer share containers or KB volumes. An older install may
therefore appear to lose its index after update even though its volume remains.

Use `docker volume ls` and the pre-upgrade status record to identify the exact
old volume. Temporarily set `KB_VOLUME=<old-name>` only when its schema matches
the selected service. Otherwise keep it as rollback state and let the current
pair build a new hashed volume. Rebuilding never deletes Markdown.

The shared model cache volume can normally be reused across repository and
schema migrations. A model change may download additional files but should not
require deleting prior cache content.

## Custom Agent Directories And Duplicate Installs

Status discovers marker files in direct child directories. When more than one
valid marker exists, pass `--agents-dir <name>` explicitly. Update and verify
the chosen install first. Then inspect MCP/editor references and remove the old
managed directory manually only after no client points to it. Never remove a
directory merely because its name resembles `.agents`; it may contain
repository-owned skills.

## Roll Back As A Pair

Use the previous harness tag together with the exact previous MCP digest:

```powershell
$env:KB_IMAGE = "ihorleleka/project-rag-wiki@sha256:<previous-digest>"
npx github:ihorleleka/harness#<previous-harness-tag> update . --force --agents-dir .agents
harness restart .
harness doctor . --live
```

Use the equivalent environment syntax on POSIX. If the older service expects a
different index schema, select the preserved old KB volume or an empty volume;
do not point it at a newer-schema index. Remove `KB_IMAGE` after returning to a
published compatible pair so status again reports the default pinned image.

## Intentional Cleanup

Only after the new pair is healthy, list exact resources with `docker ps -a`
and `docker volume ls`. Remove containers by their recorded names. Remove an old
KB volume only after confirming it is not mounted and its Markdown source is
safe. Model caches are shared and should not be removed as routine migration
cleanup.
