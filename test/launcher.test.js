const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const {
  appendLauncherEntry,
  deleteLauncherEntry,
  ensureLauncherConfig,
  exportLauncherConfig,
  importLauncherConfig,
  loadLauncherEntries,
  reorderLauncherEntries,
  scanLauncherFolder,
  updateLauncherEntry
} = require("../src/launcher-config");

test("home launcher config bootstraps default files", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-launcher-"));
  const paths = ensureLauncherConfig(tempRoot);

  assert.equal(fs.existsSync(paths.configDir), true);
  assert.equal(fs.existsSync(paths.defaultConfigPath), true);
  assert.equal(fs.existsSync(paths.guidePath), true);
  assert.equal(fs.existsSync(paths.sampleConfigPath), true);
  assert.deepEqual(JSON.parse(fs.readFileSync(paths.defaultConfigPath, "utf8")), { apps: [] });
  assert.equal(JSON.parse(fs.readFileSync(paths.sampleConfigPath, "utf8")).apps.length, 3);
});

test("home launcher loads json entries and resolves relative targets", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-launcher-load-"));
  const configDir = path.join(tempRoot, "Confg");
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(
    path.join(configDir, "apps.json"),
    JSON.stringify(
      {
        apps: [
          {
            name: "Downloads",
            kind: "folder",
            target: "..",
            description: "Open the Home root"
          },
          {
            name: "Site",
            kind: "url",
            target: "https://example.com"
          }
        ]
      },
      null,
      2
    ),
    "utf8"
  );

  const launcher = loadLauncherEntries(tempRoot);

  assert.equal(launcher.errors.length, 0);
  assert.equal(launcher.entries.length, 2);
  assert.equal(
    launcher.entries.find((entry) => entry.kind === "folder").target,
    path.resolve(configDir, "..")
  );
  assert.equal(
    launcher.entries.find((entry) => entry.kind === "url").target,
    "https://example.com"
  );
});

test("home launcher does not load the clean sample config as real apps", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-launcher-sample-"));

  ensureLauncherConfig(tempRoot);
  const launcher = loadLauncherEntries(tempRoot);

  assert.equal(launcher.errors.length, 0);
  assert.equal(launcher.entries.length, 0);
  assert.deepEqual(launcher.configFiles, ["apps.json"]);
});

test("home launcher supports command entries", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-launcher-command-"));
  const configDir = path.join(tempRoot, "Confg");
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(
    path.join(configDir, "commands.json"),
    JSON.stringify(
      {
        apps: [
          {
            name: "ANTC CLI",
            kind: "command",
            command: "node",
            args: ["src\\cli.js", "info", "C:\\Users\\Example\\Downloads\\file.atl"],
            cwd: "..\\..\\App",
            keepOpen: true,
            consoleWindow: "minimized"
          }
        ]
      },
      null,
      2
    ),
    "utf8"
  );

  const launcher = loadLauncherEntries(tempRoot);
  const command = launcher.entries[0];

  assert.equal(launcher.errors.length, 0);
  assert.equal(command.kind, "command");
  assert.equal(command.command, "node");
  assert.deepEqual(command.args, ["src\\cli.js", "info", "C:\\Users\\Example\\Downloads\\file.atl"]);
  assert.equal(command.cwd, path.resolve(configDir, "..\\..\\App"));
  assert.equal(command.keepOpen, true);
  assert.equal(command.consoleWindow, "minimized");
});

test("home launcher appends app entries to the default config", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-launcher-add-"));
  const target = path.join(tempRoot, "tool.exe");
  const iconPath = path.join(tempRoot, "tool.png");

  const result = appendLauncherEntry(tempRoot, {
    name: "Tool",
    kind: "executable",
    target,
    description: "Open Tool",
    group: "Utilities",
    tags: ["work", "tools"],
    icon: "TL",
    iconPath,
    runAsAdmin: true
  });

  const saved = JSON.parse(fs.readFileSync(result.configPath, "utf8"));
  const launcher = loadLauncherEntries(tempRoot);

  assert.equal(saved.apps.length, 1);
  assert.deepEqual(saved.apps[0], {
    name: "Tool",
    kind: "executable",
    description: "Open Tool",
    group: "Utilities",
    tags: ["work", "tools"],
    icon: "TL",
    iconPath,
    runAsAdmin: true,
    target
  });
  assert.equal(launcher.errors.length, 0);
  assert.equal(launcher.entries.length, 1);
  assert.equal(launcher.entries[0].name, "Tool");
  assert.deepEqual(launcher.entries[0].tags, ["work", "tools"]);
  assert.equal(launcher.entries[0].runAsAdmin, true);
  assert.equal(launcher.entries[0].target, target);
  assert.equal(launcher.entries[0].iconPath, iconPath);
  assert.equal(launcher.entries[0].iconUrl, pathToFileURL(iconPath).href);
  assert.equal(launcher.entries[0].sourceFile, "apps.json");
  assert.equal(launcher.entries[0].sourceIndex, 0);
});

test("home launcher reorders entries in the default config", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-launcher-reorder-"));

  appendLauncherEntry(tempRoot, {
    name: "First",
    kind: "url",
    target: "https://first.example"
  });
  appendLauncherEntry(tempRoot, {
    name: "Second",
    kind: "url",
    target: "https://second.example"
  });
  appendLauncherEntry(tempRoot, {
    name: "Third",
    kind: "url",
    target: "https://third.example"
  });

  reorderLauncherEntries(tempRoot, ["apps-3", "apps-1", "apps-2"]);
  const launcher = loadLauncherEntries(tempRoot);

  assert.deepEqual(launcher.entries.map((entry) => entry.name), ["Third", "First", "Second"]);
});

test("home launcher appends command entries to the default config", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-launcher-add-command-"));

  const result = appendLauncherEntry(tempRoot, {
    name: "ANTC",
    kind: "command",
    command: "node",
    args: ["node_modules\\electron\\cli.js", "."],
    cwd: "..\\App",
    consoleWindow: "hidden",
    keepOpen: false,
    runAsAdmin: true
  });

  const saved = JSON.parse(fs.readFileSync(result.configPath, "utf8"));
  const command = saved.apps[0];

  assert.deepEqual(command, {
    name: "ANTC",
    kind: "command",
    command: "node",
    args: ["node_modules\\electron\\cli.js", "."],
    cwd: "..\\App",
    consoleWindow: "hidden",
    runAsAdmin: true
  });

  assert.equal(loadLauncherEntries(tempRoot).entries[0].runAsAdmin, true);
});

test("home launcher updates an existing app entry in its source config", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-launcher-update-"));
  const firstTarget = path.join(tempRoot, "first.exe");
  const secondTarget = path.join(tempRoot, "second.exe");

  appendLauncherEntry(tempRoot, {
    name: "First Tool",
    kind: "executable",
    target: firstTarget
  });

  const loaded = loadLauncherEntries(tempRoot);
  const entry = loaded.entries[0];
  const result = updateLauncherEntry(tempRoot, {
    sourceFile: entry.sourceFile,
    sourceIndex: entry.sourceIndex,
    name: "Second Tool",
    kind: "executable",
    target: secondTarget,
    description: "Updated"
  });
  const reloaded = loadLauncherEntries(tempRoot);

  assert.equal(result.entry.name, "Second Tool");
  assert.equal(reloaded.entries.length, 1);
  assert.equal(reloaded.entries[0].name, "Second Tool");
  assert.equal(reloaded.entries[0].description, "Updated");
  assert.equal(reloaded.entries[0].target, secondTarget);
});

test("home launcher deletes an existing app entry from its source config", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-launcher-delete-"));

  appendLauncherEntry(tempRoot, {
    name: "Keep Tool",
    kind: "executable",
    target: path.join(tempRoot, "keep.exe")
  });
  appendLauncherEntry(tempRoot, {
    name: "Delete Tool",
    kind: "executable",
    target: path.join(tempRoot, "delete.exe")
  });

  const loaded = loadLauncherEntries(tempRoot);
  const entry = loaded.entries.find((item) => item.name === "Delete Tool");
  const result = deleteLauncherEntry(tempRoot, {
    sourceFile: entry.sourceFile,
    sourceIndex: entry.sourceIndex
  });
  const reloaded = loadLauncherEntries(tempRoot);

  assert.equal(result.entry.name, "Delete Tool");
  assert.equal(result.count, 1);
  assert.deepEqual(reloaded.entries.map((item) => item.name), ["Keep Tool"]);
});

test("home launcher warns for missing local paths without blocking load", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-launcher-warnings-"));

  appendLauncherEntry(tempRoot, {
    name: "Missing Tool",
    kind: "executable",
    target: path.join(tempRoot, "missing.exe")
  });

  const launcher = loadLauncherEntries(tempRoot);

  assert.equal(launcher.errors.length, 0);
  assert.equal(launcher.entries.length, 1);
  assert.equal(launcher.warnings.length, 1);
  assert.match(launcher.warnings[0], /missing executable path/);
  assert.deepEqual(launcher.entries[0].warnings, [launcher.warnings[0].replace("apps.json: ", "")]);
});

test("home launcher rejects duplicate app entries", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-launcher-duplicates-"));
  const target = path.join(tempRoot, "tool.exe");

  appendLauncherEntry(tempRoot, {
    name: "Tool",
    kind: "executable",
    target
  });

  assert.throws(
    () =>
      appendLauncherEntry(tempRoot, {
        name: "Tool",
        kind: "file",
        target: path.join(tempRoot, "other.txt")
      }),
    /already exists/
  );

  assert.throws(
    () =>
      appendLauncherEntry(tempRoot, {
        name: "Other Tool",
        kind: "executable",
        target
      }),
    /same executable target/
  );
});

test("home launcher imports and exports launcher config backups", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-launcher-import-export-"));
  const importPath = path.join(tempRoot, "import.json");
  const exportPath = path.join(tempRoot, "export.json");

  appendLauncherEntry(tempRoot, {
    name: "Existing",
    kind: "url",
    target: "https://example.com"
  });
  fs.writeFileSync(
    importPath,
    JSON.stringify(
      {
        apps: [
          {
            name: "Imported",
            kind: "url",
            target: "https://openai.com"
          }
        ]
      },
      null,
      2
    ),
    "utf8"
  );

  const imported = importLauncherConfig(tempRoot, importPath);
  const launcher = loadLauncherEntries(tempRoot);
  const exported = exportLauncherConfig(tempRoot, exportPath);

  assert.equal(imported.count, 1);
  assert.equal(fs.existsSync(imported.backupPath), true);
  assert.equal(launcher.entries.length, 1);
  assert.equal(launcher.entries[0].name, "Imported");
  assert.equal(exported.exportPath, exportPath);
  assert.deepEqual(
    JSON.parse(fs.readFileSync(exportPath, "utf8")),
    JSON.parse(fs.readFileSync(imported.configPath, "utf8"))
  );
});

test("home launcher scans folders for app files and skips duplicates", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-launcher-scan-"));
  const scanRoot = path.join(tempRoot, "scan");
  const toolPath = path.join(scanRoot, "Tool.exe");
  const shortcutPath = path.join(scanRoot, "Docs.lnk");

  fs.mkdirSync(scanRoot, { recursive: true });
  fs.writeFileSync(toolPath, "", "utf8");
  fs.writeFileSync(shortcutPath, "", "utf8");

  const firstScan = scanLauncherFolder(tempRoot, scanRoot);
  const secondScan = scanLauncherFolder(tempRoot, scanRoot);
  const launcher = loadLauncherEntries(tempRoot);

  assert.equal(firstScan.added.length, 2);
  assert.equal(firstScan.skipped, 0);
  assert.equal(secondScan.added.length, 0);
  assert.equal(secondScan.skipped, 2);
  assert.deepEqual(launcher.entries.map((entry) => entry.group), ["Scanned", "Scanned"]);
  assert.deepEqual(launcher.entries[0].tags, ["scanned"]);
});
