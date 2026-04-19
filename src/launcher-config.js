const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const CONFIG_DIR_NAME = "Confg";
const DEFAULT_CONFIG_FILE_NAME = "apps.json";
const DEFAULT_GUIDE_FILE_NAME = "README.md";

function getLauncherPaths(homeRoot) {
  const root = path.resolve(homeRoot);
  const configDir = path.join(root, CONFIG_DIR_NAME);

  return {
    homeRoot: root,
    configDir,
    defaultConfigPath: path.join(configDir, DEFAULT_CONFIG_FILE_NAME),
    guidePath: path.join(configDir, DEFAULT_GUIDE_FILE_NAME)
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

Each file can be either:

\`\`\`json
{
  "apps": [
    {
      "name": "Notepad",
      "kind": "executable",
      "target": "C:\\\\Windows\\\\System32\\\\notepad.exe",
      "iconPath": "C:\\\\Users\\\\bryce\\\\Pictures\\\\notepad.png",
      "description": "Open Notepad"
    },
    {
      "name": "Downloads",
      "kind": "folder",
      "target": "C:\\\\Users\\\\bryce\\\\Downloads",
      "description": "Open Downloads"
    },
    {
      "name": "Workspace Root",
      "kind": "folder",
      "target": "..",
      "description": "Open the Home app folder"
    },
    {
      "name": "ANTC Studio",
      "kind": "command",
      "command": "C:\\\\Program Files\\\\nodejs\\\\node.exe",
      "args": [
        "node_modules\\\\electron\\\\cli.js",
        "."
      ],
      "cwd": "..\\\\..\\\\App",
      "consoleWindow": "hidden",
      "description": "Open the ANTC desktop app"
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

function ensureLauncherConfig(homeRoot) {
  const paths = getLauncherPaths(homeRoot);
  fs.mkdirSync(paths.configDir, { recursive: true });

  if (!fs.existsSync(paths.defaultConfigPath)) {
    fs.writeFileSync(paths.defaultConfigPath, getDefaultAppsFile(), "utf8");
  }

  if (!fs.existsSync(paths.guidePath)) {
    fs.writeFileSync(paths.guidePath, getDefaultGuide(), "utf8");
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

function cleanOptionalText(value) {
  return String(value ?? "").trim();
}

function setOptionalField(target, key, value) {
  const text = cleanOptionalText(value);

  if (text) {
    target[key] = text;
  }
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

function appendLauncherEntry(homeRoot, entry) {
  const paths = ensureLauncherConfig(homeRoot);
  const config = readWritableAppsConfig(paths.defaultConfigPath);
  const writableEntry = buildWritableLauncherEntry(entry);

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
  config.apps[sourceIndex] = writableEntry;
  writeWritableAppsConfig(configPath, config);

  return {
    configPath,
    entry: writableEntry,
    sourceFile: path.basename(configPath),
    sourceIndex
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
    accent: String(entry.accent ?? "").trim(),
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
    accent: String(entry.accent ?? "").trim(),
    sourceFile: path.basename(configFilePath),
    sourceIndex: index
  };
}

function loadLauncherEntries(homeRoot) {
  const paths = ensureLauncherConfig(homeRoot);
  const files = fs
    .readdirSync(paths.configDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".json")
    .map((entry) => path.join(paths.configDir, entry.name))
    .sort((left, right) => left.localeCompare(right));
  const errors = [];
  const entries = [];

  for (const configFilePath of files) {
    try {
      const parsed = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
      const configEntries = readConfigEntries(configFilePath, parsed);

      configEntries.forEach((entry, index) => {
        try {
          const normalizedEntry = normalizeLauncherEntry(entry, configFilePath, index);

          if (normalizedEntry) {
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
    const groupCompare = left.group.localeCompare(right.group);

    if (groupCompare !== 0) {
      return groupCompare;
    }

    return left.name.localeCompare(right.name);
  });

  return {
    configDir: paths.configDir,
    configFiles: files.map((filePath) => path.basename(filePath)),
    guidePath: paths.guidePath,
    entries,
    errors
  };
}

module.exports = {
  appendLauncherEntry,
  ensureLauncherConfig,
  getLauncherPaths,
  loadLauncherEntries,
  normalizeLauncherKind,
  updateLauncherEntry
};
