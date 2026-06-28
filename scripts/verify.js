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
    ["opencode.json", collectJsonStrings(readJson(path.join(targetRoot, "opencode.json")))],
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

function assertInstall(targetRoot, agentsDir) {
  const packageJson = readJson(path.join(ROOT, "package.json"));
  const marker = readJson(path.join(targetRoot, agentsDir, ".harness-install.json"));

  assert(marker.package === "github:ihorleleka/harness", "install marker package source changed unexpectedly");
  assert(marker.packageName === packageJson.name, "install marker packageName does not match package.json");
  assert(marker.version === packageJson.version, "install marker version does not match package.json");
  assert(marker.agentsDir === agentsDir, "install marker agentsDir does not match install option");

  assert(fs.existsSync(path.join(targetRoot, agentsDir, "skills", "wiki", "SKILL.md")), "managed wiki skill missing");
  assertReferencedJsTargetsExist(targetRoot, agentsDir);
}

function main() {
  prepareScratch(DEFAULT_SMOKE_ROOT);
  run(process.execPath, [path.join(ROOT, "bin", "harness.js"), "install", DEFAULT_SMOKE_ROOT, "--force"]);
  assertInstall(DEFAULT_SMOKE_ROOT, ".agents");
  for (const invalidAgentsDir of [".", "..", "nested/agents", "nested\\agents", "C:agents", "CON", "agents."]) {
    expectFailure(
      process.execPath,
      [path.join(ROOT, "bin", "harness.js"), "install", DEFAULT_SMOKE_ROOT, "--agents-dir", invalidAgentsDir],
      "agents dir must be a portable direct-child directory name"
    );
  }
  const updateWithoutForce = run(process.execPath, [
    path.join(ROOT, "bin", "harness.js"),
    "update",
    DEFAULT_SMOKE_ROOT,
  ]);
  assert(
    updateWithoutForce.stderr.includes("Root-level agent policy and editor MCP configuration may now differ"),
    "update without --force did not warn about stale root assets"
  );

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

  runNpm(["pack", "--dry-run"]);
  console.log("verify: ok");
}

main();
