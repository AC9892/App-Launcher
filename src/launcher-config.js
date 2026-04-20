const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const CONFIG_DIR_NAME = "Confg";
const DEFAULT_CONFIG_FILE_NAME = "apps.json";
const DEFAULT_GUIDE_FILE_NAME = "README.md";
const SAMPLE_CONFIG_FILE_NAME = "apps.sample.json";

function getLauncherPaths(homeRoot) {
  const root = path.resolve(homeRoot);
  const configDir = path.join(root, CONFIG_DIR_NAME);

  return {
    homeRoot: root,
    configDir,
    defaultConfigPath: path.join(configDir, DEFAULT_CONFIG_FILE_NAME),
    guidePath: path.join(configDir, DEFAULT_GUIDE_FILE_NAME),
    sampleConfigPath: path.join(configDir, SAMPLE_CONFIG_FILE_NAME)
  };
}

function getDefaultAppsFile() {
  return JSON.stringify(
    {
      apps: []
    },
    null,
    2
  );
}

function getDefaultGuide() {
  return `# Home Launcher Config

Use the Home launcher app's **Add App** button for the easiest setup. It writes new entries to \`apps.json\` in this folder.

Use the **Edit** button on an existing launcher card to update the JSON entry it came from.

The original manual method still works: add one or more \`.json\` files to this folder.

See \`apps.sample.json\` for a clean example that avoids local machine-specific paths.

Each file can be either:

\`\`\`json
{
  "apps": [
    {
      "name": "Notepad",
      "kind": "executable",
      "target": "C:\\\\Windows\\\\System32\\\\notepad.exe",
      "iconPath": "C:\\\\Path\\\\To\\\\notepad.png",
      "description": "Open Notepad"
    },
    {
      "name": "Example Folder",
      "kind": "folder",
      "target": "..",
      "description": "Open a folder"
    },
    {
      "name": "Workspace Root",
      "kind": "folder",
      "target": "..",
      "description": "Open the Home app folder"
    },
    {
      "name": "Example Electron App",
      "kind": "command",
      "command": "C:\\\\Program Files\\\\nodejs\\\\node.exe",
      "args": [
        "node_modules\\\\electron\\\\cli.js",
        "."
      ],
      "cwd": "..\\\\..\\\\App",
      "consoleWindow": "hidden",
      "description": "Open an Electron app"
    },
    {
      "name": "OpenAI",
      "kind": "url",
      "target": "https://openai.com",
      "description": "Open a website"
    }
  ]
}
\`\`\`

Supported \`kind\` values:

- \`executable\`
- \`file\`
- \`folder\`
- \`url\`
- \`command\`

Relative \`file\`, \`folder\`, and \`command.cwd\` targets are resolved from this \`/Home/Confg\` folder.

Optional icon fields:

- \`iconPath\` points to an image file, such as \`.ico\`, \`.png\`, \`.jpg\`, \`.webp\`, \`.gif\`, or \`.svg\`.
- \`icon\` is fallback text shown when no \`iconPath\` is set or the icon image cannot load.
- The app editor's Icon image picker writes \`iconPath\` and overrides the default generated initials.
- If \`iconPath\` is empty, Home tries to use the target file, folder, executable, or absolute command's system icon automatically.

For \`kind: "command"\`:

- \`command\` is the program to run, such as \`node\`, \`npm.cmd\`, or \`powershell\`.
- \`args\` is an array of command arguments.
- \`cwd\` is optional and controls the working directory.
- \`keepOpen: true\` keeps the console window open after the command finishes.
- \`consoleWindow\` can be \`normal\`, \`minimized\`, or \`hidden\`.
`;
}

function getSampleAppsFile() {
  return JSON.stringify(
    {
      apps: [
        {
          name: "Example Website",
          kind: "url",
          target: "https://example.com",
          group: "Examples",
          description: "Open a website"
        },
        {
          name: "Example Folder",
          kind: "folder",
          target: "..",
          group: "Examples",
          description: "Open the Home app folder"
        },
        {
          name: "Example Command",
          kind: "command",
          command: "cmd.exe",
          args: ["/d", "/c", "echo Hello from Home Launcher"],
          keepOpen: true,
          group: "Examples",
          description: "Run a visible sample command"
        }
      ]
    },
    null,
    2
  );
}

function ensureLauncherConfig(homeRoot) {
  const paths = getLauncherPaths(homeRoot);
  fs.mkdirSync(paths.configDir, { recursive: true });

  if (!fs.existsSync(paths.defaultConfigPath)) {
    fs.writeFileSync(paths.defaultConfigPath, getDefaultAppsFile(), "utf8");
  }

  if (!fs.existsSync(paths.guidePath)) {
    fs.writeFileSync(paths.guidePath, getDefaultGuide(), "utf8");
  }

  if (!fs.existsSync(paths.sampleConfigPath)) {
    fs.writeFileSync(paths.sampleConfigPath, `${getSampleAppsFile()}\n`, "utf8");
  }

  return paths;
}

function readWritableAppsConfig(configFilePath) {
  const parsed = JSON.parse(fs.readFileSync(configFilePath, "utf8"));

  if (Array.isArray(parsed)) {
    return {
      data: parsed,
      apps: parsed,
      isArrayRoot: true
    };
  }

  if (parsed && typeof parsed === "object" && Array.isArray(parsed.apps)) {
    return {
      data: parsed,
      apps: parsed.apps,
      isArrayRoot: false
    };
  }

  throw new Error(
    `Config file "${path.basename(configFilePath)}" must contain an array or an object with an "apps" array.`
  );
}

function writeWritableAppsConfig(configFilePath, config) {
  const writableData = config.isArrayRoot ? config.apps : config.data;
  fs.writeFileSync(configFilePath, `${JSON.stringify(writableData, null, 2)}\n`, "utf8");
}

function getBackupTimestamp(date = new Date()) {
  return date
    .toISOString()
    .replaceAll("-", "")
    .replace("T", "-")
    .replaceAll(":", "")
    .slice(0, 15);
}

function cleanOptionalText(value) {
  return String(value ?? "").trim();
}

function setOptionalField(target, key, value) {
  const text = cleanOptionalText(value);

  if (text) {
    target[key] = text;
  }
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanOptionalText(item)).filter(Boolean);
  }

  return cleanOptionalText(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeWritableArgs(value, entryName) {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error(`Entry "${entryName}" field "args" must be an array of strings.`);
  }

  return value.map((item) => String(item)).filter((item) => item.length > 0);
}

function buildWritableLauncherEntry(entry) {
  if (!entry || typeof entry !== "object") {
    throw new Error("Launcher entry must be an object.");
  }

  const name = cleanOptionalText(entry.name);

  if (!name) {
    throw new Error("Launcher entry is missing a name.");
  }

  const kind = normalizeLauncherKind(entry.kind);
  const writableEntry = {
    name,
    kind
  };

  setOptionalField(writableEntry, "description", entry.description);
  setOptionalField(writableEntry, "group", entry.group);
  setOptionalField(writableEntry, "icon", entry.icon);
  setOptionalField(writableEntry, "iconPath", entry.iconPath);
  setOptionalField(writableEntry, "accent", entry.accent);
  const tags = normalizeTags(entry.tags);

  if (tags.length > 0) {
    writableEntry.tags = tags;
  }

  if (entry.runAsAdmin === true) {
    writableEntry.runAsAdmin = true;
  }

  if (kind === "command") {
    const command = cleanOptionalText(entry.command ?? entry.target);

    if (!command) {
      throw new Error(`Entry "${name}" is missing a command.`);
    }

    const args = normalizeWritableArgs(entry.args, name);
    const cwd = cleanOptionalText(entry.cwd);
    const consoleWindow = normalizeConsoleWindow(entry.consoleWindow, { name });

    writableEntry.command = command;

    if (args.length > 0) {
      writableEntry.args = args;
    }

    if (cwd) {
      writableEntry.cwd = cwd;
    }

    if (entry.keepOpen === true) {
      writableEntry.keepOpen = true;
    }

    if (consoleWindow !== "normal") {
      writableEntry.consoleWindow = consoleWindow;
    }

    return writableEntry;
  }

  const target = cleanOptionalText(entry.target);

  if (!target) {
    throw new Error(`Entry "${name}" is missing a target.`);
  }

  writableEntry.target = target;

  return writableEntry;
}

function normalizeDuplicateText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getWritableLaunchKey(entry) {
  if (entry.kind === "command") {
    return normalizeDuplicateText([
      entry.kind,
      entry.command,
      ...(Array.isArray(entry.args) ? entry.args : []),
      entry.cwd ?? ""
    ].join("\u0000"));
  }

  return normalizeDuplicateText(`${entry.kind}\u0000${entry.target ?? ""}`);
}

function assertNoDuplicateLauncherEntry(apps, writableEntry, sourceIndex = -1) {
  const nextName = normalizeDuplicateText(writableEntry.name);
  const nextLaunchKey = getWritableLaunchKey(writableEntry);

  apps.forEach((existingEntry, index) => {
    if (index === sourceIndex || !existingEntry || existingEntry.enabled === false) {
      return;
    }

    const existing = buildWritableLauncherEntry(existingEntry);
    const existingName = normalizeDuplicateText(existing.name);
    const existingLaunchKey = getWritableLaunchKey(existing);

    if (existingName === nextName) {
      throw new Error(`A launcher entry named "${writableEntry.name}" already exists.`);
    }

    if (existingLaunchKey === nextLaunchKey) {
      throw new Error(`A launcher entry already uses the same ${writableEntry.kind} target.`);
    }
  });
}

function appendLauncherEntry(homeRoot, entry) {
  const paths = ensureLauncherConfig(homeRoot);
  const config = readWritableAppsConfig(paths.defaultConfigPath);
  const writableEntry = buildWritableLauncherEntry(entry);

  assertNoDuplicateLauncherEntry(config.apps, writableEntry);
  config.apps.push(writableEntry);
  writeWritableAppsConfig(paths.defaultConfigPath, config);

  return {
    configPath: paths.defaultConfigPath,
    entry: writableEntry,
    count: config.apps.length
  };
}

function resolveEditableConfigFile(homeRoot, sourceFile) {
  const paths = ensureLauncherConfig(homeRoot);
  const fileName = path.basename(String(sourceFile ?? "").trim());

  if (!fileName || path.extname(fileName).toLowerCase() !== ".json") {
    throw new Error("Editable launcher entry is missing a valid source config file.");
  }

  const configPath = path.join(paths.configDir, fileName);

  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file "${fileName}" does not exist.`);
  }

  return configPath;
}

function parseEditableIndex(value) {
  const sourceIndex = Number(value);

  if (!Number.isInteger(sourceIndex) || sourceIndex < 0) {
    throw new Error("Editable launcher entry is missing a valid source index.");
  }

  return sourceIndex;
}

function updateLauncherEntry(homeRoot, payload) {
  const configPath = resolveEditableConfigFile(homeRoot, payload?.sourceFile);
  const sourceIndex = parseEditableIndex(payload?.sourceIndex);
  const config = readWritableAppsConfig(configPath);

  if (sourceIndex >= config.apps.length) {
    throw new Error(`Entry ${sourceIndex + 1} no longer exists in "${path.basename(configPath)}".`);
  }

  const writableEntry = buildWritableLauncherEntry(payload);
  assertNoDuplicateLauncherEntry(config.apps, writableEntry, sourceIndex);
  config.apps[sourceIndex] = writableEntry;
  writeWritableAppsConfig(configPath, config);

  return {
    configPath,
    entry: writableEntry,
    sourceFile: path.basename(configPath),
    sourceIndex
  };
}

function reorderLauncherEntries(homeRoot, orderedIds) {
  const paths = ensureLauncherConfig(homeRoot);
  const config = readWritableAppsConfig(paths.defaultConfigPath);
  const order = new Map(
    (Array.isArray(orderedIds) ? orderedIds : []).map((id, index) => [String(id), index])
  );

  if (order.size === 0) {
    throw new Error("No launcher order was provided.");
  }

  config.apps = config.apps
    .map((entry, index) => ({
      entry,
      index,
      id: String(entry.id ?? `apps-${index + 1}`)
    }))
    .sort((left, right) => {
      const leftOrder = order.has(left.id) ? order.get(left.id) : Number.MAX_SAFE_INTEGER;
      const rightOrder = order.has(right.id) ? order.get(right.id) : Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.index - right.index;
    })
    .map((item) => item.entry);

  if (!config.isArrayRoot) {
    config.data.apps = config.apps;
  }

  writeWritableAppsConfig(paths.defaultConfigPath, config);

  return {
    configPath: paths.defaultConfigPath,
    count: config.apps.length
  };
}

function normalizeLauncherKind(value) {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized === "url" || normalized === "link" || normalized === "web") {
    return "url";
  }

  if (normalized === "folder" || normalized === "directory" || normalized === "dir") {
    return "folder";
  }

  if (normalized === "executable" || normalized === "exe" || normalized === "app") {
    return "executable";
  }

  if (normalized === "file" || normalized === "path" || normalized === "open") {
    return "file";
  }

  if (normalized === "command" || normalized === "cmd" || normalized === "terminal") {
    return "command";
  }

  throw new Error(`Unsupported launcher kind "${value}".`);
}

function readConfigEntries(configFilePath, parsed) {
  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (parsed && typeof parsed === "object" && Array.isArray(parsed.apps)) {
    return parsed.apps;
  }

  throw new Error(
    `Config file "${path.basename(configFilePath)}" must contain an array or an object with an "apps" array.`
  );
}

function buildLauncherIcon(name, icon) {
  const explicit = String(icon ?? "").trim();

  if (explicit) {
    return explicit.slice(0, 3);
  }

  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

function buildIconPathFields(entry, configFilePath) {
  const rawIconPath = String(entry.iconPath ?? "").trim();

  if (!rawIconPath) {
    return {};
  }

  const iconPath = path.isAbsolute(rawIconPath)
    ? path.normalize(rawIconPath)
    : path.resolve(path.dirname(configFilePath), rawIconPath);

  return {
    rawIconPath,
    iconPath,
    iconUrl: pathToFileURL(iconPath).href
  };
}

function normalizeLauncherEntry(entry, configFilePath, index) {
  if (!entry || typeof entry !== "object") {
    throw new Error(`Entry ${index + 1} is not an object.`);
  }

  if (entry.enabled === false) {
    return null;
  }

  const name = String(entry.name ?? "").trim();

  if (!name) {
    throw new Error(`Entry ${index + 1} is missing "name".`);
  }

  const kind = normalizeLauncherKind(entry.kind);
  const rawTarget = String(entry.target ?? "").trim();

  if (kind === "command") {
    return normalizeCommandEntry(entry, configFilePath, index, name);
  }

  if (!rawTarget) {
    throw new Error(`Entry "${name}" is missing "target".`);
  }

  const target =
    kind === "url"
      ? rawTarget
      : path.isAbsolute(rawTarget)
        ? path.normalize(rawTarget)
        : path.resolve(path.dirname(configFilePath), rawTarget);

  return {
    id: String(entry.id ?? `${path.basename(configFilePath, path.extname(configFilePath))}-${index + 1}`),
    name,
    description: String(entry.description ?? "").trim(),
    kind,
    target,
    rawTarget,
    icon: buildLauncherIcon(name, entry.icon),
    ...buildIconPathFields(entry, configFilePath),
    group: String(entry.group ?? "Apps").trim() || "Apps",
    tags: normalizeTags(entry.tags),
    accent: String(entry.accent ?? "").trim(),
    runAsAdmin: entry.runAsAdmin === true,
    sourceFile: path.basename(configFilePath),
    sourceIndex: index
  };
}

function normalizeStringArray(value, fieldName, entryName) {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error(`Entry "${entryName}" field "${fieldName}" must be an array of strings.`);
  }

  return value.map((item) => String(item));
}

function resolveOptionalCwd(cwd, configFilePath) {
  const rawCwd = String(cwd ?? "").trim();

  if (!rawCwd) {
    return path.dirname(configFilePath);
  }

  return path.isAbsolute(rawCwd)
    ? path.normalize(rawCwd)
    : path.resolve(path.dirname(configFilePath), rawCwd);
}

function normalizeConsoleWindow(value, entry) {
  if (entry.hideConsole === true) {
    return "hidden";
  }

  if (entry.minimizeConsole === true) {
    return "minimized";
  }

  const raw = String(value ?? entry.windowState ?? "normal").trim().toLowerCase();

  if (raw === "" || raw === "normal" || raw === "show" || raw === "shown") {
    return "normal";
  }

  if (raw === "min" || raw === "minimize" || raw === "minimized") {
    return "minimized";
  }

  if (raw === "hide" || raw === "hidden" || raw === "silent") {
    return "hidden";
  }

  throw new Error(
    `Entry "${entry.name}" field "consoleWindow" must be "normal", "minimized", or "hidden".`
  );
}

function normalizeCommandEntry(entry, configFilePath, index, name) {
  const command = String(entry.command ?? entry.target ?? "").trim();

  if (!command) {
    throw new Error(`Entry "${name}" is missing "command".`);
  }

  const args = normalizeStringArray(entry.args, "args", name);
  const cwd = resolveOptionalCwd(entry.cwd, configFilePath);
  const consoleWindow = normalizeConsoleWindow(entry.consoleWindow, entry);

  return {
    id: String(entry.id ?? `${path.basename(configFilePath, path.extname(configFilePath))}-${index + 1}`),
    name,
    description: String(entry.description ?? "").trim(),
    kind: "command",
    target: command,
    command,
    args,
    cwd,
    rawCwd: String(entry.cwd ?? "").trim(),
    keepOpen: entry.keepOpen === true || entry.wait === true,
    consoleWindow,
    icon: buildLauncherIcon(name, entry.icon),
    ...buildIconPathFields(entry, configFilePath),
    group: String(entry.group ?? "Apps").trim() || "Apps",
    tags: normalizeTags(entry.tags),
    accent: String(entry.accent ?? "").trim(),
    runAsAdmin: entry.runAsAdmin === true,
    sourceFile: path.basename(configFilePath),
    sourceIndex: index
  };
}

function getMissingPathWarning(entry) {
  if (entry.kind !== "executable" && entry.kind !== "file" && entry.kind !== "folder") {
    return "";
  }

  if (!fs.existsSync(entry.target)) {
    return `Entry "${entry.name}" points to a missing ${entry.kind} path: ${entry.target}`;
  }

  try {
    const stats = fs.statSync(entry.target);

    if (entry.kind === "folder" && !stats.isDirectory()) {
      return `Entry "${entry.name}" expects a folder, but this path is not a folder: ${entry.target}`;
    }

    if ((entry.kind === "file" || entry.kind === "executable") && !stats.isFile()) {
      return `Entry "${entry.name}" expects a file, but this path is not a file: ${entry.target}`;
    }
  } catch (error) {
    return `Entry "${entry.name}" path could not be checked: ${error.message}`;
  }

  return "";
}

function importLauncherConfig(homeRoot, sourcePath) {
  const paths = ensureLauncherConfig(homeRoot);
  const sourceConfigPath = path.resolve(String(sourcePath ?? ""));

  if (!sourceConfigPath || path.extname(sourceConfigPath).toLowerCase() !== ".json") {
    throw new Error("Choose a JSON launcher config file to import.");
  }

  if (!fs.existsSync(sourceConfigPath)) {
    throw new Error(`Import file does not exist: ${sourceConfigPath}`);
  }

  const sourceConfig = readWritableAppsConfig(sourceConfigPath);
  sourceConfig.apps = sourceConfig.apps.map((entry) => buildWritableLauncherEntry(entry));

  if (!sourceConfig.isArrayRoot) {
    sourceConfig.data.apps = sourceConfig.apps;
  }

  const seen = [];

  sourceConfig.apps.forEach((entry) => {
    assertNoDuplicateLauncherEntry(seen, entry);
    seen.push(entry);
  });

  const backupPath = path.join(paths.configDir, `apps.backup-${getBackupTimestamp()}.json.bak`);
  fs.copyFileSync(paths.defaultConfigPath, backupPath);
  writeWritableAppsConfig(paths.defaultConfigPath, sourceConfig);

  return {
    importedPath: sourceConfigPath,
    backupPath,
    configPath: paths.defaultConfigPath,
    count: sourceConfig.apps.length
  };
}

function exportLauncherConfig(homeRoot, destinationPath) {
  const paths = ensureLauncherConfig(homeRoot);
  const targetPath = path.resolve(String(destinationPath ?? ""));

  if (!targetPath || path.extname(targetPath).toLowerCase() !== ".json") {
    throw new Error("Choose a JSON file path for the launcher config export.");
  }

  fs.copyFileSync(paths.defaultConfigPath, targetPath);

  return {
    configPath: paths.defaultConfigPath,
    exportPath: targetPath
  };
}

function isScannableLauncherFile(filePath) {
  return [".exe", ".lnk", ".url", ".bat", ".cmd"].includes(path.extname(filePath).toLowerCase());
}

function collectScannableLauncherFiles(folderPath, depth = 0) {
  if (depth > 2) {
    return [];
  }

  const found = [];

  for (const item of fs.readdirSync(folderPath, { withFileTypes: true })) {
    const itemPath = path.join(folderPath, item.name);

    if (item.isDirectory()) {
      found.push(...collectScannableLauncherFiles(itemPath, depth + 1));
      continue;
    }

    if (item.isFile() && isScannableLauncherFile(itemPath)) {
      found.push(itemPath);
    }
  }

  return found;
}

function scanLauncherFolder(homeRoot, folderPath) {
  const paths = ensureLauncherConfig(homeRoot);
  const scanRoot = path.resolve(String(folderPath ?? ""));

  if (!scanRoot || !fs.existsSync(scanRoot) || !fs.statSync(scanRoot).isDirectory()) {
    throw new Error("Choose an existing folder to scan.");
  }

  const config = readWritableAppsConfig(paths.defaultConfigPath);
  const files = collectScannableLauncherFiles(scanRoot);
  const added = [];
  let skipped = 0;

  for (const filePath of files) {
    const extension = path.extname(filePath).toLowerCase();
    const entry = buildWritableLauncherEntry({
      name: path.basename(filePath, extension),
      kind: extension === ".exe" ? "executable" : "file",
      target: filePath,
      group: "Scanned",
      tags: ["scanned"],
      description: `Scanned from ${scanRoot}`
    });

    try {
      assertNoDuplicateLauncherEntry(config.apps, entry);
      config.apps.push(entry);
      added.push(entry);
    } catch {
      skipped += 1;
    }
  }

  if (added.length > 0) {
    writeWritableAppsConfig(paths.defaultConfigPath, config);
  }

  return {
    folderPath: scanRoot,
    added,
    skipped,
    count: config.apps.length
  };
}

function loadLauncherEntries(homeRoot) {
  const paths = ensureLauncherConfig(homeRoot);
  const files = fs
    .readdirSync(paths.configDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".json")
    .filter((entry) => entry.name.toLowerCase() !== SAMPLE_CONFIG_FILE_NAME)
    .map((entry) => path.join(paths.configDir, entry.name))
    .sort((left, right) => left.localeCompare(right));
  const errors = [];
  const warnings = [];
  const entries = [];

  for (const configFilePath of files) {
    try {
      const parsed = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
      const configEntries = readConfigEntries(configFilePath, parsed);

      configEntries.forEach((entry, index) => {
        try {
          const normalizedEntry = normalizeLauncherEntry(entry, configFilePath, index);

          if (normalizedEntry) {
            const warning = getMissingPathWarning(normalizedEntry);

            if (warning) {
              normalizedEntry.warnings = [warning];
              warnings.push(`${path.basename(configFilePath)}: ${warning}`);
            }

            entries.push(normalizedEntry);
          }
        } catch (error) {
          errors.push(`${path.basename(configFilePath)}: ${error.message}`);
        }
      });
    } catch (error) {
      errors.push(`${path.basename(configFilePath)}: ${error.message}`);
    }
  }

  entries.sort((left, right) => {
    const fileCompare = left.sourceFile.localeCompare(right.sourceFile);

    if (fileCompare !== 0) {
      return fileCompare;
    }

    return left.sourceIndex - right.sourceIndex;
  });

  return {
    configDir: paths.configDir,
    configFiles: files.map((filePath) => path.basename(filePath)),
    guidePath: paths.guidePath,
    entries,
    errors,
    warnings
  };
}

module.exports = {
  appendLauncherEntry,
  ensureLauncherConfig,
  exportLauncherConfig,
  getLauncherPaths,
  importLauncherConfig,
  loadLauncherEntries,
  normalizeLauncherKind,
  reorderLauncherEntries,
  scanLauncherFolder,
  updateLauncherEntry
};
