const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const {
  appendLauncherEntry,
  ensureLauncherConfig,
  loadLauncherEntries,
  updateLauncherEntry
} = require("../src/launcher-config");

test("home launcher config bootstraps default files", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-launcher-"));
  const paths = ensureLauncherConfig(tempRoot);

  assert.equal(fs.existsSync(paths.configDir), true);
  assert.equal(fs.existsSync(paths.defaultConfigPath), true);
  assert.equal(fs.existsSync(paths.guidePath), true);
  assert.deepEqual(JSON.parse(fs.readFileSync(paths.defaultConfigPath, "utf8")), { apps: [] });
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
            args: ["src\\cli.js", "info", "C:\\Users\\bryce\\Downloads\\file.atl"],
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
  assert.deepEqual(command.args, ["src\\cli.js", "info", "C:\\Users\\bryce\\Downloads\\file.atl"]);
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
    icon: "TL",
    iconPath
  });

  const saved = JSON.parse(fs.readFileSync(result.configPath, "utf8"));
  const launcher = loadLauncherEntries(tempRoot);

  assert.equal(saved.apps.length, 1);
  assert.deepEqual(saved.apps[0], {
    name: "Tool",
    kind: "executable",
    description: "Open Tool",
    group: "Utilities",
    icon: "TL",
    iconPath,
    target
  });
  assert.equal(launcher.errors.length, 0);
  assert.equal(launcher.entries.length, 1);
  assert.equal(launcher.entries[0].name, "Tool");
  assert.equal(launcher.entries[0].target, target);
  assert.equal(launcher.entries[0].iconPath, iconPath);
  assert.equal(launcher.entries[0].iconUrl, pathToFileURL(iconPath).href);
  assert.equal(launcher.entries[0].sourceFile, "apps.json");
  assert.equal(launcher.entries[0].sourceIndex, 0);
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
    keepOpen: false
  });

  const saved = JSON.parse(fs.readFileSync(result.configPath, "utf8"));
  const command = saved.apps[0];

  assert.deepEqual(command, {
    name: "ANTC",
    kind: "command",
    command: "node",
    args: ["node_modules\\electron\\cli.js", "."],
    cwd: "..\\App",
    consoleWindow: "hidden"
  });
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
