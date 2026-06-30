#!/usr/bin/env node

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PACKAGE_ROOT = path.resolve(__dirname, "..");
const DEFAULT_AGENTS_DIR = ".agents";
const MARKER_FILE = ".harness-install.json";
let packageMetadata = null;

const LEGACY_SKILL_DIRS = [
  "initialize-wiki",
  "migrate-wiki",
  "retrieve-knowledge",
  "wiki-maintenance",
];

function printUsage() {
  console.log(`Usage:
  harness install [target] [--force] [--agents-dir <dir>] [--skip-root]
  harness update [target] [--force] [--agents-dir <dir>] [--skip-root]
  harness status [target] [--agents-dir <dir>]
  harness doctor [target] [--agents-dir <dir>]

Examples:
  npx github:ihorleleka/harness install .
  npx github:ihorleleka/harness update C:\\Solutions\\my-project --force
  npx github:ihorleleka/harness status .
  npx github:ihorleleka/harness doctor .
  .agents\\update-harness.cmd
  sh ./.agents/update-harness.sh`);
}

function parseArgs(argv) {
  const args = [...argv];
  const command = args.shift();
  const options = {
    command,
    target: ".",
    agentsDir: DEFAULT_AGENTS_DIR,
    agentsDirProvided: false,
    force: false,
    skipRoot: false,
  };

  if (command === "--help" || command === "-h") {
    options.command = "help";
    return options;
  }

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--force") {
      options.force = true;
    } else if (arg === "--skip-root") {
      options.skipRoot = true;
    } else if (arg === "--agents-dir") {
      const value = args.shift();
      if (!value) throw new Error("--agents-dir requires a value");
      options.agentsDir = value;
      options.agentsDirProvided = true;
    } else if (arg === "--help" || arg === "-h") {
      options.command = "help";
    } else if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      options.target = arg;
    }
  }

  return options;
}

function ensureDirectChild(relativePath) {
  const raw = String(relativePath).trim();
  if (!raw) {
    throw new Error("--agents-dir requires a value");
  }

  const normalized = path.normalize(raw);
  const portableNormalized = normalized.replace(/\\/g, "/");
  const hasRoot =
    path.isAbsolute(raw) || path.win32.isAbsolute(raw) || path.posix.isAbsolute(raw);
  const hasSeparator = /[\\/]/.test(raw);
  const hasInvalidWindowsNameChar = /[<>:"|?*\x00-\x1F]/.test(raw);
  const isReservedWindowsName = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i.test(raw);
  const hasInvalidWindowsEnding = /[. ]$/.test(raw);

  if (
    hasRoot ||
    hasSeparator ||
    hasInvalidWindowsNameChar ||
    isReservedWindowsName ||
    hasInvalidWindowsEnding ||
    portableNormalized === "." ||
    portableNormalized === ".."
  ) {
    throw new Error(
      `agents dir must be a portable direct-child directory name inside the target repo: ${relativePath}`
    );
  }

  return portableNormalized;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function removePath(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function copyFile(source, target) {
  ensureDir(path.dirname(target));
  fs.copyFileSync(source, target);
}

function copyDirectory(source, target) {
  ensureDir(target);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      copyFile(sourcePath, targetPath);
    }
  }
}

function copyPath(source, target) {
  const stat = fs.statSync(source);
  removePath(target);
  if (stat.isDirectory()) {
    copyDirectory(source, target);
  } else {
    copyFile(source, target);
  }
}

function copyManagedSkills(agentsRoot) {
  const sourceSkillsRoot = path.join(PACKAGE_ROOT, "templates", "root", ".agents", "skills");
  const targetSkillsRoot = path.join(agentsRoot, "skills");
  ensureDir(targetSkillsRoot);

  for (const entry of fs.readdirSync(sourceSkillsRoot, { withFileTypes: true })) {
    const sourcePath = path.join(sourceSkillsRoot, entry.name);
    const targetPath = path.join(targetSkillsRoot, entry.name);
    copyPath(sourcePath, targetPath);
  }
}

function copyManagedAgentFiles(agentsRoot) {
  const sourceAgentsRoot = path.join(PACKAGE_ROOT, "templates", "root", ".agents");
  for (const entry of fs.readdirSync(sourceAgentsRoot, { withFileTypes: true })) {
    if (entry.isDirectory()) continue;
    copyPath(path.join(sourceAgentsRoot, entry.name), path.join(agentsRoot, entry.name));
  }
}

function hasHarnessMarker(agentsRoot) {
  return fs.existsSync(path.join(agentsRoot, MARKER_FILE));
}

function isEmptyDirectory(dir) {
  if (!fs.existsSync(dir)) return true;
  return fs.readdirSync(dir).length === 0;
}

function readPackageMetadata() {
  if (packageMetadata !== null) return packageMetadata;
  const manifestPath = path.join(PACKAGE_ROOT, "package.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  packageMetadata = {
    name: manifest.name,
    version: manifest.version,
  };
  return packageMetadata;
}

function writeMarker(agentsRoot, options) {
  const metadata = readPackageMetadata();
  const marker = {
    package: "github:ihorleleka/harness",
    packageName: metadata.name,
    version: metadata.version,
    installedAt: new Date().toISOString(),
    agentsDir: options.agentsDir,
  };
  fs.writeFileSync(
    path.join(agentsRoot, MARKER_FILE),
    `${JSON.stringify(marker, null, 2)}\n`,
    "utf8"
  );
}

function removeLegacySkillDirs(agentsRoot) {
  const skillsRoot = path.join(agentsRoot, "skills");
  const removed = [];
  for (const skillName of LEGACY_SKILL_DIRS) {
    const skillPath = path.join(skillsRoot, skillName);
    if (!fs.existsSync(skillPath)) continue;
    removePath(skillPath);
    removed.push(path.relative(agentsRoot, skillPath));
  }
  return removed;
}

function copyHarnessPayload(agentsRoot, options) {
  const canWriteExisting =
    options.force || hasHarnessMarker(agentsRoot) || isEmptyDirectory(agentsRoot);
  if (!canWriteExisting) {
    throw new Error(
      `${agentsRoot} already exists and was not installed by harness. Re-run with --force to replace managed files.`
    );
  }

  ensureDir(agentsRoot);
  const removedLegacySkills = removeLegacySkillDirs(agentsRoot);
  copyManagedAgentFiles(agentsRoot);
  copyManagedSkills(agentsRoot);
  removedLegacySkills.push(...removeLegacySkillDirs(agentsRoot));
  writeMarker(agentsRoot, options);
  return removedLegacySkills;
}

function rewriteAgentsDir(content, agentsDir) {
  if (agentsDir === DEFAULT_AGENTS_DIR) return content;
  const normalized = agentsDir.replace(/\\/g, "/");
  return content.replace(/\.agents/g, normalized);
}

function copyRootPayload(targetRoot, options) {
  if (options.skipRoot) return { copied: [], skipped: [] };

  const result = { copied: [], skipped: [] };
  const sourceRoot = path.join(PACKAGE_ROOT, "templates", "root");
  const entries = fs.readdirSync(sourceRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === ".agents") {
      continue;
    }
    const sourcePath = path.join(sourceRoot, entry.name);
    const targetPath = path.join(targetRoot, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryWithRewrite(sourcePath, targetPath, options, result);
    } else if (entry.isFile()) {
      if (fs.existsSync(targetPath) && !options.force) {
        recordSkippedRootAsset(targetRoot, targetPath, result);
        continue;
      }
      const content = fs.readFileSync(sourcePath, "utf8");
      ensureDir(path.dirname(targetPath));
      fs.writeFileSync(targetPath, rewriteAgentsDir(content, options.agentsDir), "utf8");
      result.copied.push(path.relative(targetRoot, targetPath));
    }
  }

  return result;
}

function recordSkippedRootAsset(targetRoot, targetPath, result) {
  const relativePath = path.relative(targetRoot, targetPath);
  result.skipped.push(relativePath);
  console.warn(`Skipped existing root asset: ${relativePath}`);
}

function copyDirectoryWithRewrite(source, target, options, result) {
  ensureDir(target);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDirectoryWithRewrite(sourcePath, targetPath, options, result);
    } else if (entry.isFile()) {
      if (fs.existsSync(targetPath) && !options.force) {
        recordSkippedRootAsset(options.targetRoot, targetPath, result);
        continue;
      }
      const content = fs.readFileSync(sourcePath, "utf8");
      ensureDir(path.dirname(targetPath));
      fs.writeFileSync(targetPath, rewriteAgentsDir(content, options.agentsDir), "utf8");
      result.copied.push(path.relative(options.targetRoot, targetPath));
    }
  }
}

function readJsonSafe(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function collectTemplateFiles(sourceRoot, prefix = "") {
  const files = [];
  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    if (prefix === "" && entry.name === ".agents") continue;
    const sourcePath = path.join(sourceRoot, entry.name);
    const relativePath = prefix ? path.join(prefix, entry.name) : entry.name;
    if (entry.isDirectory()) {
      files.push(...collectTemplateFiles(sourcePath, relativePath));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }
  return files;
}

function discoverAgentsDir(targetRoot, requestedAgentsDir, wasProvided) {
  const requestedRoot = path.join(targetRoot, requestedAgentsDir);
  if (wasProvided || fs.existsSync(path.join(requestedRoot, MARKER_FILE))) {
    return requestedAgentsDir;
  }

  const candidates = [];
  for (const entry of fs.readdirSync(targetRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const markerPath = path.join(targetRoot, entry.name, MARKER_FILE);
    if (fs.existsSync(markerPath)) candidates.push(entry.name);
  }

  if (candidates.length === 1) return candidates[0];
  return requestedAgentsDir;
}

function describeMarker(agentsRoot) {
  const markerPath = path.join(agentsRoot, MARKER_FILE);
  if (!fs.existsSync(markerPath)) {
    return { exists: false, marker: null };
  }
  return { exists: true, marker: readJsonSafe(markerPath) };
}

function compareRootAssets(targetRoot, agentsDir) {
  const sourceRoot = path.join(PACKAGE_ROOT, "templates", "root");
  const files = collectTemplateFiles(sourceRoot);
  const result = {
    current: [],
    changed: [],
    missing: [],
  };

  for (const relativePath of files) {
    const sourcePath = path.join(sourceRoot, relativePath);
    const targetPath = path.join(targetRoot, relativePath);
    if (!fs.existsSync(targetPath)) {
      result.missing.push(relativePath);
      continue;
    }
    const expected = rewriteAgentsDir(fs.readFileSync(sourcePath, "utf8"), agentsDir);
    const actual = fs.readFileSync(targetPath, "utf8");
    if (actual === expected) {
      result.current.push(relativePath);
    } else {
      result.changed.push(relativePath);
    }
  }

  return result;
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

function checkMcpReferences(targetRoot, agentsDir) {
  const configFiles = [
    [".claude/settings.local.json", () => collectJsonStrings(readJsonSafe(path.join(targetRoot, ".claude", "settings.local.json")))],
    [".vscode/mcp.json", () => collectJsonStrings(readJsonSafe(path.join(targetRoot, ".vscode", "mcp.json")))],
    ["opencode.json", () => collectJsonStrings(readJsonSafe(path.join(targetRoot, "opencode.json")))],
    [".codex/config.toml", () => collectTomlStrings(path.join(targetRoot, ".codex", "config.toml"))],
  ];

  const expectedPrefix = `${agentsDir.replace(/\\/g, "/")}/`;
  const result = {
    ok: [],
    missing: [],
    invalid: [],
  };

  for (const [configFile, readStrings] of configFiles) {
    const configPath = path.join(targetRoot, configFile);
    if (!fs.existsSync(configPath)) {
      result.missing.push(configFile);
      continue;
    }

    let strings;
    try {
      strings = readStrings() || [];
    } catch {
      result.invalid.push(`${configFile}: unreadable or invalid`);
      continue;
    }

    const jsTargets = strings.filter((value) => {
      const normalized = value.replace(/\\/g, "/");
      return normalized.startsWith(expectedPrefix) && normalized.endsWith(".js");
    });

    if (jsTargets.length === 0) {
      result.invalid.push(`${configFile}: no ${expectedPrefix}*.js runner reference`);
      continue;
    }

    const missingTargets = jsTargets.filter((jsTarget) => !fs.existsSync(path.join(targetRoot, jsTarget)));
    if (missingTargets.length > 0) {
      result.invalid.push(`${configFile}: missing ${missingTargets.join(", ")}`);
      continue;
    }

    result.ok.push(configFile);
  }

  return result;
}

function commandWorks(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "pipe",
    windowsHide: true,
  });
  return {
    ok: result.status === 0,
    output: `${result.stdout || ""}${result.stderr || ""}`.trim(),
    error: result.error ? result.error.message : "",
  };
}

function printList(label, items) {
  if (items.length === 0) return;
  console.log(`${label}: ${items.join(", ")}`);
}

function getInstallState(options) {
  options.agentsDir = ensureDirectChild(options.agentsDir);
  const targetRoot = path.resolve(process.cwd(), options.target);
  if (!fs.existsSync(targetRoot) || !fs.statSync(targetRoot).isDirectory()) {
    throw new Error(`Target directory does not exist: ${targetRoot}`);
  }

  const agentsDir = discoverAgentsDir(targetRoot, options.agentsDir, options.agentsDirProvided);
  const agentsRoot = path.join(targetRoot, agentsDir);
  const markerState = describeMarker(agentsRoot);
  return {
    targetRoot,
    agentsDir,
    agentsRoot,
    markerState,
  };
}

function runStatus(options) {
  const { targetRoot, agentsDir, agentsRoot, markerState } = getInstallState(options);
  const marker = markerState.marker;
  const metadata = readPackageMetadata();
  const rootAssets = compareRootAssets(targetRoot, agentsDir);
  const mcpRefs = checkMcpReferences(targetRoot, agentsDir);
  const runnerPath = path.join(agentsRoot, "run-wiki-manager.mcp.js");
  const skillPath = path.join(agentsRoot, "skills", "wiki", "SKILL.md");
  const wikiPath = path.join(targetRoot, "wiki");

  console.log(`Harness status for ${targetRoot}`);
  console.log(`Package: ${metadata.name}@${metadata.version}`);
  console.log(`Agents dir: ${agentsDir}`);
  console.log(`Install marker: ${markerState.exists ? "present" : "missing"}`);
  if (marker) {
    console.log(`Installed package: ${marker.packageName || "unknown"}@${marker.version || "unknown"}`);
    console.log(`Installed at: ${marker.installedAt || "unknown"}`);
  } else if (markerState.exists) {
    console.log("Install marker detail: unreadable");
  }
  console.log(`Runner: ${fs.existsSync(runnerPath) ? "present" : "missing"}`);
  console.log(`Managed wiki skill: ${fs.existsSync(skillPath) ? "present" : "missing"}`);
  console.log(`Wiki directory: ${fs.existsSync(wikiPath) ? "present" : "missing"}`);
  console.log(
    `Root assets: ${rootAssets.current.length} current, ${rootAssets.changed.length} changed, ${rootAssets.missing.length} missing`
  );
  printList("Changed root assets", rootAssets.changed);
  printList("Missing root assets", rootAssets.missing);
  console.log(
    `MCP configs: ${mcpRefs.ok.length} ok, ${mcpRefs.missing.length} missing, ${mcpRefs.invalid.length} invalid`
  );
  printList("Missing MCP configs", mcpRefs.missing);
  printList("Invalid MCP configs", mcpRefs.invalid);
}

function runDoctor(options) {
  const { targetRoot, agentsDir, agentsRoot, markerState } = getInstallState(options);
  const checks = [];
  const addCheck = (ok, label, detail = "") => checks.push({ ok, label, detail });
  const rootAssets = compareRootAssets(targetRoot, agentsDir);
  const mcpRefs = checkMcpReferences(targetRoot, agentsDir);
  const nodeCheck = commandWorks(process.execPath, ["--version"]);
  const dockerCheck = commandWorks("docker", ["--version"]);

  addCheck(markerState.exists && Boolean(markerState.marker), "install marker is present and readable");
  addCheck(fs.existsSync(path.join(agentsRoot, "run-wiki-manager.mcp.js")), "MCP runner is present");
  addCheck(fs.existsSync(path.join(agentsRoot, "skills", "wiki", "SKILL.md")), "managed wiki skill is present");
  addCheck(fs.existsSync(path.join(targetRoot, "wiki")), "wiki directory is present");
  addCheck(rootAssets.missing.length === 0, "root assets are present", rootAssets.missing.join(", "));
  addCheck(mcpRefs.invalid.length === 0, "MCP config runner references resolve", mcpRefs.invalid.join("; "));
  addCheck(nodeCheck.ok, "Node.js is available", nodeCheck.output || nodeCheck.error);
  addCheck(dockerCheck.ok, "Docker CLI is available", dockerCheck.output || dockerCheck.error);

  console.log(`Harness doctor for ${targetRoot}`);
  for (const check of checks) {
    const prefix = check.ok ? "[ok]" : "[fail]";
    console.log(`${prefix} ${check.label}${check.detail ? ` - ${check.detail}` : ""}`);
  }

  if (rootAssets.changed.length > 0) {
    console.log(`[info] root assets changed from template - ${rootAssets.changed.join(", ")}`);
  }
  if (mcpRefs.missing.length > 0) {
    console.log(`[info] optional MCP configs missing - ${mcpRefs.missing.join(", ")}`);
  }

  const failed = checks.filter((check) => !check.ok);
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

function run(options) {
  if (!options.command || options.command === "help") {
    printUsage();
    return;
  }
  if (options.command === "status") {
    runStatus(options);
    return;
  }
  if (options.command === "doctor") {
    runDoctor(options);
    return;
  }
  if (options.command !== "install" && options.command !== "update") {
    throw new Error(`Unknown command: ${options.command}`);
  }

  options.agentsDir = ensureDirectChild(options.agentsDir);
  const targetRoot = path.resolve(process.cwd(), options.target);
  if (!fs.existsSync(targetRoot) || !fs.statSync(targetRoot).isDirectory()) {
    throw new Error(`Target directory does not exist: ${targetRoot}`);
  }
  options.targetRoot = targetRoot;

  const agentsRoot = path.join(targetRoot, options.agentsDir);
  const removedLegacySkills = copyHarnessPayload(agentsRoot, options);
  const rootAssets = copyRootPayload(targetRoot, options);

  console.log(`${options.command === "install" ? "Installed" : "Updated"} harness in ${agentsRoot}`);
  if (removedLegacySkills.length > 0) {
    console.log(`Removed legacy skills: ${removedLegacySkills.join(", ")}`);
  }
  if (rootAssets.copied.length > 0) {
    console.log(`Copied root assets: ${rootAssets.copied.join(", ")}`);
  }
  if (rootAssets.skipped.length > 0) {
    console.warn(
      `Skipped ${rootAssets.skipped.length} existing root asset(s) because --force was not set.`
    );
    console.warn(
      "Root-level agent policy and editor MCP configuration may now differ from the managed harness template; re-run with --force to refresh committed root assets."
    );
  }
  if (rootAssets.copied.length === 0 && rootAssets.skipped.length === 0 && !options.skipRoot) {
    console.log("No root assets copied; existing files were left in place.");
  }
}

try {
  run(parseArgs(process.argv.slice(2)));
} catch (err) {
  console.error(`harness: ${err.message}`);
  process.exit(1);
}
