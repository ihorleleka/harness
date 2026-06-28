#!/usr/bin/env node

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

Examples:
  npx github:ihorleleka/harness install .
  npx github:ihorleleka/harness update C:\\Solutions\\my-project --force
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
  const normalized = path.normalize(relativePath);
  if (path.isAbsolute(normalized) || normalized.startsWith("..") || normalized.includes(`..${path.sep}`)) {
    throw new Error(`agents dir must be a relative path inside the target repo: ${relativePath}`);
  }
  if (normalized.split(/[\\/]+/).length !== 1) {
    throw new Error(
      `agents dir must be a direct child of the target repo because the runner resolves its parent as project root: ${relativePath}`
    );
  }
  return normalized;
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

function run(options) {
  if (!options.command || options.command === "help") {
    printUsage();
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
