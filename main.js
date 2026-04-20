const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { spawn } = require("node:child_process");
const { app, BrowserWindow, Tray, dialog, ipcMain, Menu, shell } = require("electron");
const {
  appendLauncherEntry,
  ensureLauncherConfig,
  exportLauncherConfig,
  importLauncherConfig,
  loadLauncherEntries,
  normalizeLauncherKind,
  reorderLauncherEntries,
  scanLauncherFolder,
  updateLauncherEntry
} = require("./src/launcher-config");

const HOME_ROOT = path.resolve(__dirname);
let mainWindow = null;
let tray = null;
let minimizeToTray = false;
const editorWindows = new Map();
const WINDOW_PRESETS = {
  vertical: {
    width: 760,
    height: 700,
    minWidth: 680,
    minHeight: 560
  },
  horizontal: {
    width: 1100,
    height: 620,
    minWidth: 860,
    minHeight: 520
  }
};

const WINDOW_OPTIONS = {
  ...WINDOW_PRESETS.vertical,
  backgroundColor: "#0e1518",
  autoHideMenuBar: true,
  webPreferences: {
    preload: path.join(__dirname, "preload.js"),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: false
  }
};

function createWindow() {
  const window = new BrowserWindow(WINDOW_OPTIONS);
  mainWindow = window;
  window.loadFile(path.join(__dirname, "index.html"));
  window.on("close", (event) => {
    if (!app.isQuitting && minimizeToTray) {
      event.preventDefault();
      window.hide();
    }
  });

  if (process.env.HOME_LAUNCHER_SMOKE_TEST === "1") {
    window.webContents.once("did-finish-load", () => {
      console.log("HOME_LAUNCHER_SMOKE_TEST_OK");
      setTimeout(() => {
        app.quit();
      }, 250);
    });

    window.webContents.once("did-fail-load", (_, errorCode, errorDescription) => {
      console.error(`HOME_LAUNCHER_SMOKE_TEST_FAIL ${errorCode} ${errorDescription}`);
      app.exit(1);
    });
  }

  return window;
}

function showMainWindow() {
  const window = mainWindow && !mainWindow.isDestroyed() ? mainWindow : createWindow();
  window.show();
  window.focus();
}

function getEditorHtml(title, storageKey, fieldKey, languageLabel) {
  const safeTitle = String(title).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
  const safeLanguage = String(languageLabel).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
  const language = languageLabel === "JavaScript" ? "js" : String(languageLabel).toLowerCase();

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${safeTitle}</title>
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        grid-template-rows: auto 1fr auto;
        background: #07090b;
        color: #ecf1f6;
        font-family: "Aptos", "Segoe UI", sans-serif;
      }
      header, footer {
        padding: 10px 12px;
        border-bottom: 1px solid rgba(184, 196, 210, 0.16);
        background: #0f1317;
      }
      footer {
        border-top: 1px solid rgba(184, 196, 210, 0.16);
        border-bottom: 0;
        color: #98a3af;
        font-size: 0.86rem;
      }
      h1 {
        margin: 0;
        font-size: 1rem;
      }
      p {
        margin: 4px 0 0;
        color: #98a3af;
        font-size: 0.86rem;
      }
      .editor-shell {
        display: grid;
        grid-template-columns: 52px minmax(0, 1fr);
        height: 100%;
        min-height: 0;
        overflow: hidden;
      }
      .line-numbers {
        margin: 0;
        padding: 14px 8px;
        border-right: 1px solid rgba(184, 196, 210, 0.16);
        background: rgba(255, 255, 255, 0.025);
        color: #98a3af;
        text-align: right;
        user-select: none;
        overflow: hidden;
        font: 0.9rem/1.45 Consolas, "Cascadia Mono", monospace;
      }
      .code-highlight,
      textarea {
        grid-column: 2;
        grid-row: 1;
        width: 100%;
        height: 100%;
        min-height: 0;
        padding: 14px;
        box-sizing: border-box;
        font: 0.9rem/1.45 Consolas, "Cascadia Mono", monospace;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        tab-size: 2;
      }
      .code-highlight {
        margin: 0;
        overflow: hidden;
        color: #ecf1f6;
        background: #0c1014;
        pointer-events: none;
      }
      textarea {
        position: relative;
        z-index: 1;
        border: 0;
        resize: none;
        outline: none;
        background: transparent;
        color: transparent;
        caret-color: #ecf1f6;
      }
      textarea::selection {
        background: rgba(122, 162, 255, 0.34);
      }
      .token-comment { color: #7e987d; font-style: italic; }
      .token-string { color: #e1bd78; }
      .token-keyword { color: #7aa2ff; font-weight: 700; }
      .token-number { color: #85d8a6; }
      .token-tag { color: #ef8f7a; }
      .token-property { color: #9ccfff; }
      .token-color { color: #c792ea; }
    </style>
  </head>
  <body>
    <header>
      <h1>${safeTitle}</h1>
      <p>${safeLanguage} editor. Autosaves every 2 seconds.</p>
    </header>
    <div class="editor-shell">
      <pre id="line-numbers" class="line-numbers" aria-hidden="true">1</pre>
      <pre id="highlight" class="code-highlight" aria-hidden="true"></pre>
      <textarea id="editor" spellcheck="false" wrap="soft"></textarea>
    </div>
    <footer id="status">Ready.</footer>
    <script>
      const storageKey = ${JSON.stringify(storageKey)};
      const fieldKey = ${JSON.stringify(fieldKey)};
      const language = ${JSON.stringify(language)};
      const editor = document.querySelector("#editor");
      const lineNumbers = document.querySelector("#line-numbers");
      const highlight = document.querySelector("#highlight");
      const status = document.querySelector("#status");
      function escapeHtml(text) {
        return String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      }
      function getLineNumbers(value) {
        const count = Math.max(1, String(value || "").split("\\n").length);
        return Array.from({ length: count }, (_, index) => String(index + 1)).join("\\n");
      }
      function classifyCodeToken(token) {
        if (/^\\/\\*[\\s\\S]*\\*\\/$/.test(token) || /^\\/\\//.test(token) || /^<!--[\\s\\S]*-->$/.test(token)) {
          return "comment";
        }
        if (/^["'\`]/.test(token)) {
          return "string";
        }
        if (language === "html" && /^<\\/?[A-Za-z]/.test(token)) {
          return "tag";
        }
        if (/^#[0-9a-fA-F]{3,8}\\b/.test(token)) {
          return "color";
        }
        if (/^\\d/.test(token)) {
          return "number";
        }
        return language === "css" ? "property" : "keyword";
      }
      function highlightCode(value) {
        const source = String(value || "");
        const patterns = {
          css: /\\/\\*[\\s\\S]*?\\*\\/|"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|#[0-9a-fA-F]{3,8}\\b|\\b\\d+(?:\\.\\d+)?(?:px|rem|em|%|vh|vw|s)?\\b|\\b(?:body|html|content|position|fixed|absolute|relative|inset|pointer-events|background|linear-gradient|radial-gradient|rgba|transparent|color|display|grid|flex|border|padding|margin|z-index|opacity|transform|animation|keyframes|filter|box-shadow)\\b/g,
          html: /<!--[\\s\\S]*?-->|<\\/?[A-Za-z][^>]*>|"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'/g,
          js: /\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*|"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\`(?:\\\\.|[^\`\\\\])*\`|\\b\\d+(?:\\.\\d+)?\\b|\\b(?:const|let|var|function|return|if|else|for|while|try|catch|class|new|async|await|true|false|null|undefined|document|window|localStorage|querySelector|addEventListener|setInterval|clearInterval|JSON|String|Array|Object)\\b/g
        };
        const pattern = patterns[language] || patterns.js;
        let output = "";
        let cursor = 0;
        for (const match of source.matchAll(pattern)) {
          const token = match[0];
          const index = match.index || 0;
          output += escapeHtml(source.slice(cursor, index));
          output += '<span class="token-' + classifyCodeToken(token) + '">' + escapeHtml(token) + '</span>';
          cursor = index + token.length;
        }
        output += escapeHtml(source.slice(cursor));
        return output || " ";
      }
      function syncEditor() {
        lineNumbers.textContent = getLineNumbers(editor.value);
        lineNumbers.scrollTop = editor.scrollTop;
        highlight.innerHTML = highlightCode(editor.value);
        highlight.scrollTop = editor.scrollTop;
        highlight.scrollLeft = editor.scrollLeft;
      }
      function readState() {
        try {
          return JSON.parse(localStorage.getItem(storageKey) || "{}");
        } catch {
          return {};
        }
      }
      function save() {
        const state = readState();
        state[fieldKey] = editor.value;
        localStorage.setItem(storageKey, JSON.stringify(state));
        status.textContent = "Saved " + new Date().toLocaleTimeString();
      }
      editor.value = String(readState()[fieldKey] || "");
      editor.addEventListener("input", () => {
        syncEditor();
        status.textContent = "Unsaved changes...";
      });
      editor.addEventListener("scroll", syncEditor);
      syncEditor();
      setInterval(save, 2000);
      window.addEventListener("beforeunload", save);
    </script>
  </body>
</html>`;
}

function openEditorWindow(payload) {
  const kind = String(payload?.kind ?? "").trim().toLowerCase();
  const configs = {
    effect: {
      title: "Custom Effect CSS",
      storageKey: "homeLauncherCustomEffect",
      fieldKey: "css",
      languageLabel: "CSS"
    },
    html: {
      title: "Embedded HTML",
      storageKey: "homeLauncherCustomCode",
      fieldKey: "html",
      languageLabel: "HTML"
    },
    js: {
      title: "Embedded JavaScript",
      storageKey: "homeLauncherCustomCode",
      fieldKey: "js",
      languageLabel: "JavaScript"
    }
  };
  const config = configs[kind];

  if (!config) {
    throw new Error("Unknown editor type.");
  }

  const existing = editorWindows.get(kind);

  if (existing && !existing.isDestroyed()) {
    existing.focus();
    return { kind, reused: true };
  }

  const editorWindow = new BrowserWindow({
    width: 760,
    height: 620,
    minWidth: 520,
    minHeight: 420,
    title: config.title,
    backgroundColor: "#07090b",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      partition: "persist:home-launcher-editors"
    }
  });

  editorWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(getEditorHtml(
    config.title,
    config.storageKey,
    config.fieldKey,
    config.languageLabel
  ))}`);
  editorWindow.on("closed", () => {
    editorWindows.delete(kind);
  });
  editorWindows.set(kind, editorWindow);

  return { kind, reused: false };
}

function getWindow() {
  return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
}

function normalizeWindowOrientation(value) {
  return value === "horizontal" ? "horizontal" : "vertical";
}

function applyWindowOrientation(value, targetWindow = getWindow()) {
  const orientation = normalizeWindowOrientation(value);
  const preset = WINDOW_PRESETS[orientation];

  if (!targetWindow) {
    return { orientation };
  }

  targetWindow.setMinimumSize(preset.minWidth, preset.minHeight);

  if (!targetWindow.isMaximized() && !targetWindow.isFullScreen()) {
    targetWindow.setSize(preset.width, preset.height, false);
    targetWindow.center();
  }

  return {
    orientation,
    ...preset
  };
}

function quoteCommandPart(value) {
  const text = String(value);

  if (text === "") {
    return "\"\"";
  }

  if (!/[\s"&<>|^]/.test(text)) {
    return text;
  }

  return `"${text.replaceAll("\"", "\"\"")}"`;
}

function buildCommandLine(command, args = []) {
  return [command, ...args].map(quoteCommandPart).join(" ");
}

function buildArgumentLine(args = []) {
  return args.map(quoteCommandPart).join(" ");
}

function getSuggestedLauncherName(targetPath) {
  const parsed = path.parse(targetPath);
  return parsed.name || parsed.base || "New App";
}

function getSystemIconTarget(entry) {
  if (entry.iconUrl) {
    return "";
  }

  if (entry.kind === "command") {
    return path.isAbsolute(entry.command ?? "") ? entry.command : "";
  }

  if (entry.kind === "url") {
    return "";
  }

  return path.isAbsolute(entry.target ?? "") ? entry.target : "";
}

async function addSystemIcons(launcher) {
  const entries = await Promise.all(
    launcher.entries.map(async (entry) => {
      const iconTarget = getSystemIconTarget(entry);

      if (!iconTarget || !fs.existsSync(iconTarget)) {
        return entry;
      }

      try {
        const icon = await app.getFileIcon(iconTarget, { size: "normal" });

        if (icon.isEmpty()) {
          return entry;
        }

        return {
          ...entry,
          systemIconUrl: icon.toDataURL()
        };
      } catch {
        return entry;
      }
    })
  );

  return {
    ...launcher,
    entries
  };
}

async function chooseLauncherTarget(payload) {
  const rawKind = String(payload?.kind ?? "file").trim().toLowerCase();
  const kind = rawKind === "cwd" || rawKind === "icon" ? rawKind : normalizeLauncherKind(rawKind);

  if (kind === "url") {
    throw new Error("URL launcher entries use a typed web address instead of Browse.");
  }

  const openDirectory = kind === "folder" || kind === "cwd";
  const result = await dialog.showOpenDialog(getWindow(), {
    title: kind === "icon" ? "Choose Icon Image" : openDirectory ? "Choose Folder" : "Choose File",
    properties: openDirectory ? ["openDirectory"] : ["openFile"],
    filters:
      kind === "icon"
        ? [
            { name: "Icon Images", extensions: ["ico", "png", "jpg", "jpeg", "webp", "gif", "svg"] },
            { name: "All Files", extensions: ["*"] }
          ]
        : undefined
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const targetPath = result.filePaths[0];

  return {
    path: targetPath,
    suggestedName: getSuggestedLauncherName(targetPath)
  };
}

async function exportConfigBackup() {
  const defaultName = `home-launcher-config-${new Date().toISOString().slice(0, 10)}.json`;
  const result = await dialog.showSaveDialog(getWindow(), {
    title: "Export Launcher Config",
    defaultPath: defaultName,
    filters: [
      { name: "JSON Files", extensions: ["json"] },
      { name: "All Files", extensions: ["*"] }
    ]
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  return exportLauncherConfig(HOME_ROOT, result.filePath);
}

async function importConfigBackup() {
  const result = await dialog.showOpenDialog(getWindow(), {
    title: "Import Launcher Config",
    properties: ["openFile"],
    filters: [
      { name: "JSON Files", extensions: ["json"] },
      { name: "All Files", extensions: ["*"] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return importLauncherConfig(HOME_ROOT, result.filePaths[0]);
}

async function scanLauncherFolderFromDialog() {
  const result = await dialog.showOpenDialog(getWindow(), {
    title: "Scan Folder For Apps",
    properties: ["openDirectory"]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return scanLauncherFolder(HOME_ROOT, result.filePaths[0]);
}

async function chooseFontFile() {
  const result = await dialog.showOpenDialog(getWindow(), {
    title: "Choose Font File",
    properties: ["openFile"],
    filters: [
      { name: "Font Files", extensions: ["ttf", "otf", "woff", "woff2"] },
      { name: "All Files", extensions: ["*"] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const fontPath = result.filePaths[0];

  return {
    path: fontPath,
    url: pathToFileURL(fontPath).href,
    name: path.basename(fontPath, path.extname(fontPath))
  };
}

async function chooseEffectFile() {
  const result = await dialog.showOpenDialog(getWindow(), {
    title: "Import Custom Effect",
    properties: ["openFile"],
    filters: [
      { name: "Effect CSS", extensions: ["css", "txt"] },
      { name: "All Files", extensions: ["*"] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const effectPath = result.filePaths[0];
  const css = fs.readFileSync(effectPath, "utf8");

  return {
    path: effectPath,
    name: path.basename(effectPath),
    css
  };
}

async function chooseCustomCodeFile(kind) {
  const normalizedKind = String(kind ?? "").trim().toLowerCase();
  const isJs = normalizedKind === "js";
  const result = await dialog.showOpenDialog(getWindow(), {
    title: isJs ? "Import Custom JavaScript" : "Import Custom HTML",
    properties: ["openFile"],
    filters: isJs
      ? [
          { name: "JavaScript Files", extensions: ["js", "mjs", "txt"] },
          { name: "All Files", extensions: ["*"] }
        ]
      : [
          { name: "HTML Files", extensions: ["html", "htm", "txt"] },
          { name: "All Files", extensions: ["*"] }
        ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];

  return {
    path: filePath,
    name: path.basename(filePath),
    code: fs.readFileSync(filePath, "utf8")
  };
}

function updateTray(enabled) {
  minimizeToTray = enabled === true;

  if (!minimizeToTray) {
    if (tray) {
      tray.destroy();
      tray = null;
    }

    return { enabled: false };
  }

  if (!tray) {
    const iconPath = path.join(process.resourcesPath || __dirname, "electron.ico");
    tray = new Tray(fs.existsSync(iconPath) ? iconPath : process.execPath);
    tray.setToolTip("Home Launcher");
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: "Open Home Launcher", click: showMainWindow },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]));
    tray.on("click", showMainWindow);
  }

  return { enabled: true };
}

function setLaunchOnStartup(enabled) {
  app.setLoginItemSettings({
    openAtLogin: enabled === true,
    path: process.execPath
  });

  return app.getLoginItemSettings();
}

function commandNeedsShell(command) {
  const extension = path.extname(command).toLowerCase();
  return extension === ".cmd" || extension === ".bat";
}

function quotePowerShellString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function launchDetachedWithPowerShell(command, args, cwd, consoleWindow, runAsAdmin = false) {
  const windowStyle = consoleWindow === "minimized" ? "Minimized" : "Hidden";
  const script = [
    "Start-Process",
    "-FilePath",
    quotePowerShellString(command),
    "-ArgumentList",
    quotePowerShellString(buildArgumentLine(args)),
    "-WorkingDirectory",
    quotePowerShellString(cwd),
    "-WindowStyle",
    windowStyle,
    ...(runAsAdmin ? ["-Verb", "RunAs"] : [])
  ].join(" ");
  const child = spawn(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      script
    ],
    {
      detached: true,
      stdio: "ignore",
      windowsHide: true
    }
  );

  child.unref();
}

function launchCommand(payload) {
  const command = String(payload?.command ?? payload?.target ?? "").trim();
  const args = Array.isArray(payload?.args) ? payload.args.map((arg) => String(arg)) : [];
  const cwd = String(payload?.cwd ?? HOME_ROOT).trim() || HOME_ROOT;
  const keepOpen = payload?.keepOpen === true;
  const consoleWindow = String(payload?.consoleWindow ?? "normal").trim().toLowerCase();
  const runAsAdmin = payload?.runAsAdmin === true;

  if (!command) {
    throw new Error("Command launcher target is missing.");
  }

  if (runAsAdmin) {
    launchDetachedWithPowerShell(command, args, cwd, consoleWindow, true);

    return {
      command,
      args,
      cwd,
      keepOpen: false,
      consoleWindow,
      runAsAdmin
    };
  }

  if (consoleWindow === "minimized" && !keepOpen) {
    launchDetachedWithPowerShell(command, args, cwd, consoleWindow);

    return {
      command,
      args,
      cwd,
      keepOpen: false,
      consoleWindow,
      runAsAdmin
    };
  }

  if (!keepOpen) {
    const child = spawn(command, args, {
      cwd,
      detached: true,
      shell: commandNeedsShell(command),
      stdio: "ignore",
      windowsHide: consoleWindow === "hidden"
    });

    child.unref();

    return {
      command,
      args,
      cwd,
      keepOpen: false,
      consoleWindow,
      runAsAdmin
    };
  }

  const startArgs = [
    "/d",
    "/c",
    "start",
    ""
  ];

  if (consoleWindow === "minimized") {
    startArgs.push("/min");
  }

  startArgs.push("cmd.exe", "/d", keepOpen ? "/k" : "/c", buildCommandLine(command, args));

  const child = spawn(
    "cmd.exe",
    startArgs,
    {
      cwd,
      detached: true,
      stdio: "ignore",
      windowsHide: false
    }
  );

  child.unref();

  return {
    command,
    args,
    cwd,
    keepOpen,
    consoleWindow,
    runAsAdmin
  };
}

function launchElevatedExecutable(target) {
  launchDetachedWithPowerShell(target, [], path.dirname(target), "normal", true);

  return {
    target,
    runAsAdmin: true
  };
}

async function safeHandle(work) {
  try {
    return {
      ok: true,
      value: await work()
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message
    };
  }
}

function registerIpc() {
  ensureLauncherConfig(HOME_ROOT);

  ipcMain.handle("launcher:load", () =>
    safeHandle(async () => addSystemIcons(loadLauncherEntries(HOME_ROOT)))
  );

  ipcMain.handle("launcher:open-config", () =>
    safeHandle(async () => {
      const { configDir } = ensureLauncherConfig(HOME_ROOT);
      const result = await shell.openPath(configDir);

      if (result) {
        throw new Error(result);
      }

      return configDir;
    })
  );

  ipcMain.handle("launcher:open-target", (_, payload) =>
    safeHandle(async () => {
      const kind = String(payload?.kind ?? "").trim().toLowerCase();
      const target = String(payload?.target ?? "").trim();

      if (kind === "command") {
        return launchCommand(payload);
      }

      if (!target) {
        throw new Error("Launcher target is missing.");
      }

      if (payload?.runAsAdmin === true) {
        if (kind !== "executable") {
          throw new Error("Run as administrator is only supported for executable and command launchers.");
        }

        return launchElevatedExecutable(target);
      }

      if (kind === "url") {
        await shell.openExternal(target);
        return { target };
      }

      const result = await shell.openPath(target);

      if (result) {
        throw new Error(result);
      }

      return { target };
    })
  );

  ipcMain.handle("launcher:choose-target", (_, payload) =>
    safeHandle(async () => chooseLauncherTarget(payload))
  );

  ipcMain.handle("launcher:export-config", () =>
    safeHandle(async () => exportConfigBackup())
  );

  ipcMain.handle("launcher:import-config", () =>
    safeHandle(async () => importConfigBackup())
  );

  ipcMain.handle("launcher:scan-folder", () =>
    safeHandle(async () => scanLauncherFolderFromDialog())
  );

  ipcMain.handle("launcher:reorder-apps", (_, payload) =>
    safeHandle(async () => reorderLauncherEntries(HOME_ROOT, payload?.orderedIds))
  );

  ipcMain.handle("launcher:choose-font", () =>
    safeHandle(async () => chooseFontFile())
  );

  ipcMain.handle("launcher:choose-effect", () =>
    safeHandle(async () => chooseEffectFile())
  );

  ipcMain.handle("launcher:choose-custom-code", (_, payload) =>
    safeHandle(async () => chooseCustomCodeFile(payload?.kind))
  );

  ipcMain.handle("launcher:open-editor-window", (_, payload) =>
    safeHandle(async () => openEditorWindow(payload))
  );

  ipcMain.handle("launcher:add-app", (_, payload) =>
    safeHandle(async () => appendLauncherEntry(HOME_ROOT, payload))
  );

  ipcMain.handle("launcher:update-app", (_, payload) =>
    safeHandle(async () => updateLauncherEntry(HOME_ROOT, payload))
  );

  ipcMain.handle("window:set-orientation", (_, orientation) =>
    safeHandle(async () => applyWindowOrientation(orientation))
  );

  ipcMain.handle("app:set-launch-on-startup", (_, enabled) =>
    safeHandle(async () => setLaunchOnStartup(enabled))
  );

  ipcMain.handle("app:set-tray", (_, enabled) =>
    safeHandle(async () => updateTray(enabled))
  );

  ipcMain.handle("app:restart", () =>
    safeHandle(async () => {
      app.relaunch();
      app.exit(0);
      return true;
    })
  );
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  registerIpc();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && !minimizeToTray) {
    app.quit();
  }
});
