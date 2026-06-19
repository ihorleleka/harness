#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const PACKAGE_ROOT = path.resolve(__dirname, "..");
const DEFAULT_AGENTS_DIR = ".agents";
const MARKER_FILE = ".harness-install.json";

const HARNESS_PAYLOAD = [
  "README.md",
  "run-wiki-manager-mcp.js",
  "update-harness.cmd",
  "update-harness.sh",
  "skills",
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

function hasHarnessMarker(agentsRoot) {
  return fs.existsSync(path.join(agentsRoot, MARKER_FILE));
}

function isEmptyDirectory(dir) {
  if (!fs.existsSync(dir)) return true;
  return fs.readdirSync(dir).length === 0;
}

function writeMarker(agentsRoot, options) {
  const marker = {
    package: "github:ihorleleka/harness",
    installedAt: new Date().toISOString(),
    agentsDir: options.agentsDir,
  };
  fs.writeFileSync(
    path.join(agentsRoot, MARKER_FILE),
    `${JSON.stringify(marker, null, 2)}\n`,
    "utf8"
  );
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
  for (const item of HARNESS_PAYLOAD) {
    copyPath(path.join(PACKAGE_ROOT, item), path.join(agentsRoot, item));
  }
  writeMarker(agentsRoot, options);
}

function rewriteAgentsDir(content, agentsDir) {
  if (agentsDir === DEFAULT_AGENTS_DIR) return content;
  const normalized = agentsDir.replace(/\\/g, "/");
  return content.replace(/\.agents/g, normalized);
}

function copyRootPayload(targetRoot, options) {
  if (options.skipRoot) return [];

  const copied = [];
  const sourceRoot = path.join(PACKAGE_ROOT, "expand-to-root");
  const entries = fs.readdirSync(sourceRoot, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceRoot, entry.name);
    const targetPath = path.join(targetRoot, entry.name);

    if (entry.isDirectory()) {
      copied.push(...copyDirectoryWithRewrite(sourcePath, targetPath, options));
    } else if (entry.isFile()) {
      if (fs.existsSync(targetPath) && !options.force) {
        console.warn(`Skipped existing root asset: ${path.relative(targetRoot, targetPath)}`);
        continue;
      }
      const content = fs.readFileSync(sourcePath, "utf8");
      ensureDir(path.dirname(targetPath));
      fs.writeFileSync(targetPath, rewriteAgentsDir(content, options.agentsDir), "utf8");
      copied.push(path.relative(targetRoot, targetPath));
    }
  }

  return copied;
}

function copyDirectoryWithRewrite(source, target, options) {
  const copied = [];
  ensureDir(target);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copied.push(...copyDirectoryWithRewrite(sourcePath, targetPath, options));
    } else if (entry.isFile()) {
      if (fs.existsSync(targetPath) && !options.force) {
        console.warn(`Skipped existing root asset: ${path.relative(options.targetRoot, targetPath)}`);
        continue;
      }
      const content = fs.readFileSync(sourcePath, "utf8");
      ensureDir(path.dirname(targetPath));
      fs.writeFileSync(targetPath, rewriteAgentsDir(content, options.agentsDir), "utf8");
      copied.push(path.relative(options.targetRoot, targetPath));
    }
  }
  return copied;
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
  copyHarnessPayload(agentsRoot, options);
  const rootAssets = copyRootPayload(targetRoot, options);

  console.log(`${options.command === "install" ? "Installed" : "Updated"} harness in ${agentsRoot}`);
  if (rootAssets.length > 0) {
    console.log(`Copied root assets: ${rootAssets.join(", ")}`);
  }
  if (rootAssets.length === 0 && !options.skipRoot) {
    console.log("No root assets copied; existing files were left in place.");
  }
}

try {
  run(parseArgs(process.argv.slice(2)));
} catch (err) {
  console.error(`harness: ${err.message}`);
  process.exit(1);
}
