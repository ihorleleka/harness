#!/usr/bin/env node

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ARTIFACTS_ROOT = path.join(ROOT, ".artifacts");
const DEFAULT_SMOKE_ROOT = path.join(ARTIFACTS_ROOT, "verify-smoke-default");
const CUSTOM_SMOKE_ROOT = path.join(ARTIFACTS_ROOT, "verify-smoke-custom");
const NPM = process.platform === "win32" ? "npm.cmd" : "npm";

function fail(message) {
  console.error(`verify: ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: "pipe",
    windowsHide: true,
    ...options,
  });

  if (result.status !== 0) {
    process.stdout.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
    if (result.error) {
      console.error(result.error.message);
    }
    fail(`${command} ${args.join(" ")} exited with ${result.status}`);
  }

  return result;
}

function expectFailure(command, args, expectedMessage) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: "pipe",
    windowsHide: true,
  });

  if (result.status === 0) {
    fail(`${command} ${args.join(" ")} succeeded unexpectedly`);
  }

  const output = `${result.stdout || ""}${result.stderr || ""}`;
  assert(
    output.includes(expectedMessage),
    `${command} ${args.join(" ")} failed without expected message: ${expectedMessage}`
  );
}

function runNpm(args) {
  const npmCache = path.join(ARTIFACTS_ROOT, ".npm-cache");
  fs.mkdirSync(npmCache, { recursive: true });
  const options = {
    env: {
      ...process.env,
      npm_config_cache: npmCache,
    },
  };

  if (process.env.npm_execpath) {
    return run(process.execPath, [process.env.npm_execpath, ...args], options);
  }
  return run(NPM, args, options);
}

function prepareScratch(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function collectJsonStrings(value, output = []) {
  if (typeof value === "string") {
    output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectJsonStrings(item, output);
    return output;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectJsonStrings(item, output);
  }
  return output;
}

function collectTomlStrings(file) {
  const content = fs.readFileSync(file, "utf8");
  return [...content.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

function assertReferencedJsTargetsExist(targetRoot, agentsDir) {
  const configFiles = [
    [".claude/settings.local.json", collectJsonStrings(readJson(path.join(targetRoot, ".claude", "settings.local.json")))],
    [".vscode/mcp.json", collectJsonStrings(readJson(path.join(targetRoot, ".vscode", "mcp.json")))],
    ["opencode.jsonc", collectJsonStrings(readJson(path.join(targetRoot, "opencode.jsonc")))],
    [".codex/config.toml", collectTomlStrings(path.join(targetRoot, ".codex", "config.toml"))],
  ];

  const expectedPrefix = `${agentsDir.replace(/\\/g, "/")}/`;
  for (const [configFile, strings] of configFiles) {
    const jsTargets = strings.filter(
      (value) => value.replace(/\\/g, "/").startsWith(expectedPrefix) && value.endsWith(".js")
    );
    assert(jsTargets.length > 0, `${configFile} does not reference a ${expectedPrefix}*.js MCP runner`);

    for (const jsTarget of jsTargets) {
      const resolved = path.join(targetRoot, jsTarget);
      assert(fs.existsSync(resolved), `${configFile} references missing file: ${jsTarget}`);
    }
  }
}

function assertDeliveredSurface(targetRoot, agentsDir) {
  const consumerAgentsPath = path.join(targetRoot, "AGENTS.md");
  const wikiSkillPath = path.join(targetRoot, agentsDir, "skills", "wiki", "SKILL.md");
  assert(fs.existsSync(consumerAgentsPath), "consumer AGENTS.md missing");
  assert(fs.existsSync(wikiSkillPath), "managed wiki skill missing");
}

function assertInstall(targetRoot, agentsDir) {
  const packageJson = readJson(path.join(ROOT, "package.json"));
  const marker = readJson(path.join(targetRoot, agentsDir, ".harness-install.json"));

  assert(marker.package === "github:ihorleleka/harness", "install marker package source changed unexpectedly");
  assert(marker.packageName === packageJson.name, "install marker packageName does not match package.json");
  assert(marker.version === packageJson.version, "install marker version does not match package.json");
  assert(marker.agentsDir === agentsDir, "install marker agentsDir does not match install option");

  assertReferencedJsTargetsExist(targetRoot, agentsDir);
  assertDeliveredSurface(targetRoot, agentsDir);
}

function assertMergedInstall(targetRoot, agentsDir) {
  const agentsPolicy = fs.readFileSync(path.join(targetRoot, "AGENTS.md"), "utf8");
  assert(agentsPolicy.includes("Existing repository instructions"), "existing AGENTS.md content was not preserved");
  assert(agentsPolicy.includes("This repository uses `$wiki` as the governed project knowledge workflow."), "managed AGENTS.md wiki policy missing");

  const vscodeConfig = readJson(path.join(targetRoot, ".vscode", "mcp.json"));
  assert(vscodeConfig.servers["other-harness"], "existing VS Code MCP server was not preserved");
  assert(vscodeConfig.servers["wiki-manager"], "wiki-manager VS Code MCP server was not merged");

  const claudeConfig = readJson(path.join(targetRoot, ".claude", "settings.local.json"));
  assert(claudeConfig.mcpServers["other-harness"], "existing Claude MCP server was not preserved");
  assert(claudeConfig.mcpServers["wiki-manager"], "wiki-manager Claude MCP server was not merged");

  const opencodeConfig = readJson(path.join(targetRoot, "opencode.jsonc"));
  assert(opencodeConfig.mcp["other-harness"], "existing OpenCode MCP server was not preserved");
  assert(opencodeConfig.mcp["wiki-manager"], "wiki-manager OpenCode MCP server was not merged");
  assert(opencodeConfig.instructions.includes("OTHER.md"), "existing OpenCode instructions were not preserved");
  assert(opencodeConfig.instructions.includes("AGENTS.md"), "AGENTS.md instruction was not merged");

  const codexConfig = fs.readFileSync(path.join(targetRoot, ".codex", "config.toml"), "utf8");
  assert(codexConfig.includes("[mcp_servers.other-harness]"), "existing Codex MCP server was not preserved");
  assert(codexConfig.includes("[mcp_servers.wiki-manager]"), "wiki-manager Codex MCP server was not merged");

  assert(fs.existsSync(path.join(targetRoot, agentsDir, "skills", "custom", "SKILL.md")), "custom skill was not preserved");
}

function assertLegacyAgentsPolicyMigrated(targetRoot) {
  const agentsPolicy = fs.readFileSync(path.join(targetRoot, "AGENTS.md"), "utf8");
  const signature = "This repository uses `$wiki` as the governed project knowledge workflow.";
  const occurrences = agentsPolicy.split(signature).length - 1;

  assert(agentsPolicy.includes("# Existing local instructions"), "local instructions before legacy policy were not preserved");
  assert(agentsPolicy.includes("# More local instructions"), "local instructions after legacy policy were not preserved");
  assert(occurrences === 1, "legacy unmarked wiki policy was duplicated instead of migrated");
}

function main() {
  prepareScratch(DEFAULT_SMOKE_ROOT);
  run(process.execPath, [path.join(ROOT, "bin", "harness.js"), "install", DEFAULT_SMOKE_ROOT, "--force"]);
  assertInstall(DEFAULT_SMOKE_ROOT, ".agents");
  const defaultStatus = run(process.execPath, [path.join(ROOT, "bin", "harness.js"), "status", DEFAULT_SMOKE_ROOT]);
  assert(defaultStatus.stdout.includes("Agents dir: .agents"), "status did not report default agents dir");
  assert(defaultStatus.stdout.includes("Install marker: present"), "status did not report install marker");
  for (const invalidAgentsDir of [".", "..", "nested/agents", "nested\\agents", "C:agents", "CON", "agents."]) {
    expectFailure(
      process.execPath,
      [path.join(ROOT, "bin", "harness.js"), "install", DEFAULT_SMOKE_ROOT, "--agents-dir", invalidAgentsDir],
      "agents dir must be a portable direct-child directory name"
    );
  }
  run(process.execPath, [path.join(ROOT, "bin", "harness.js"), "update", DEFAULT_SMOKE_ROOT]);

  const mergeRoot = path.join(ARTIFACTS_ROOT, "verify-smoke-merge");
  prepareScratch(mergeRoot);
  fs.mkdirSync(path.join(mergeRoot, ".agents", "skills", "custom"), { recursive: true });
  fs.writeFileSync(path.join(mergeRoot, ".agents", "skills", "custom", "SKILL.md"), "# Custom\n", "utf8");
  fs.mkdirSync(path.join(mergeRoot, ".vscode"), { recursive: true });
  fs.mkdirSync(path.join(mergeRoot, ".claude"), { recursive: true });
  fs.mkdirSync(path.join(mergeRoot, ".codex"), { recursive: true });
  fs.writeFileSync(path.join(mergeRoot, "AGENTS.md"), "# Existing repository instructions\n", "utf8");
  fs.writeFileSync(
    path.join(mergeRoot, ".vscode", "mcp.json"),
    `${JSON.stringify({ servers: { "other-harness": { command: "node", args: ["other.js"] } } }, null, 2)}\n`,
    "utf8"
  );
  fs.writeFileSync(
    path.join(mergeRoot, ".claude", "settings.local.json"),
    `${JSON.stringify({ mcpServers: { "other-harness": { command: "node", args: ["other.js"] } } }, null, 2)}\n`,
    "utf8"
  );
  fs.writeFileSync(
    path.join(mergeRoot, "opencode.jsonc"),
    '{\n  // Existing harness config\n  "mcp": {\n    "other-harness": { "type": "local", "command": ["node", "other.js"] },\n  },\n  "instructions": ["OTHER.md"],\n}\n',
    "utf8"
  );
  fs.writeFileSync(
    path.join(mergeRoot, ".codex", "config.toml"),
    '[mcp_servers.other-harness]\ncommand = "node"\nargs = ["other.js"]\n',
    "utf8"
  );
  run(process.execPath, [path.join(ROOT, "bin", "harness.js"), "install", mergeRoot]);
  assertInstall(mergeRoot, ".agents");
  assertMergedInstall(mergeRoot, ".agents");

  const legacyAgentsRoot = path.join(ARTIFACTS_ROOT, "verify-smoke-legacy-agents");
  prepareScratch(legacyAgentsRoot);
  const legacyPolicy = fs.readFileSync(path.join(ROOT, "templates", "root", "AGENTS.md"), "utf8");
  fs.writeFileSync(
    path.join(legacyAgentsRoot, "AGENTS.md"),
    `# Existing local instructions\n\n${legacyPolicy.trim()}\n\n# More local instructions\n`,
    "utf8"
  );
  run(process.execPath, [path.join(ROOT, "bin", "harness.js"), "install", legacyAgentsRoot]);
  assertInstall(legacyAgentsRoot, ".agents");
  assertLegacyAgentsPolicyMigrated(legacyAgentsRoot);

  prepareScratch(CUSTOM_SMOKE_ROOT);
  run(process.execPath, [
    path.join(ROOT, "bin", "harness.js"),
    "install",
    CUSTOM_SMOKE_ROOT,
    "--agents-dir",
    "harness-agent",
    "--force",
  ]);
  assertInstall(CUSTOM_SMOKE_ROOT, "harness-agent");
  const customStatus = run(process.execPath, [path.join(ROOT, "bin", "harness.js"), "status", CUSTOM_SMOKE_ROOT]);
  assert(customStatus.stdout.includes("Agents dir: harness-agent"), "status did not discover custom agents dir");

  runNpm(["pack", "--dry-run"]);
  console.log("verify: ok");
}

main();
