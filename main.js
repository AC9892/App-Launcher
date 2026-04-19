const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { app, BrowserWindow, dialog, ipcMain, Menu, shell } = require("electron");
const {
  appendLauncherEntry,
  ensureLauncherConfig,
  loadLauncherEntries,
  normalizeLauncherKind,
  updateLauncherEntry
} = require("./src/launcher-config");

const HOME_ROOT = path.resolve(__dirname);
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
  window.loadFile(path.join(__dirname, "index.html"));

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

function commandNeedsShell(command) {
  const extension = path.extname(command).toLowerCase();
  return extension === ".cmd" || extension === ".bat";
}

function quotePowerShellString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function launchDetachedWithPowerShell(command, args, cwd, consoleWindow) {
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
    windowStyle
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

  if (!command) {
    throw new Error("Command launcher target is missing.");
  }

  if (consoleWindow === "minimized" && !keepOpen) {
    launchDetachedWithPowerShell(command, args, cwd, consoleWindow);

    return {
      command,
      args,
      cwd,
      keepOpen: false,
      consoleWindow
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
      consoleWindow
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
    consoleWindow
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

  ipcMain.handle("launcher:add-app", (_, payload) =>
    safeHandle(async () => appendLauncherEntry(HOME_ROOT, payload))
  );

  ipcMain.handle("launcher:update-app", (_, payload) =>
    safeHandle(async () => updateLauncherEntry(HOME_ROOT, payload))
  );

  ipcMain.handle("window:set-orientation", (_, orientation) =>
    safeHandle(async () => applyWindowOrientation(orientation))
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
  if (process.platform !== "darwin") {
    app.quit();
  }
});
