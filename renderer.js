const DEFAULT_THEME = {
  preset: "default",
  background: "#07090b",
  surface: "#0f1317",
  card: "#1a2127",
  text: "#ecf1f6",
  accent: "#7aa2ff",
  gradientEnabled: false,
  effect: "none"
};

const THEME_PRESETS = {
  default: DEFAULT_THEME,
  ocean: {
    preset: "ocean",
    background: "#061114",
    surface: "#0d1d22",
    card: "#16313a",
    text: "#e9fbff",
    accent: "#42c7d9",
    gradientEnabled: false,
    effect: "glow"
  },
  ember: {
    preset: "ember",
    background: "#140b08",
    surface: "#21120d",
    card: "#341d12",
    text: "#fff3eb",
    accent: "#ff8a3d",
    gradientEnabled: false,
    effect: "glow"
  },
  forest: {
    preset: "forest",
    background: "#07100b",
    surface: "#101b14",
    card: "#1a2b20",
    text: "#effaf1",
    accent: "#79d98a",
    gradientEnabled: false,
    effect: "grid"
  },
  mono: {
    preset: "mono",
    background: "#090a0b",
    surface: "#141619",
    card: "#24282d",
    text: "#f2f4f6",
    accent: "#b8c4d2",
    gradientEnabled: false,
    effect: "glass"
  }
};

const state = {
  entries: [],
  errors: [],
  configDir: "",
  editingEntry: null,
  theme: { ...DEFAULT_THEME },
  settings: {
    appOrientation: "vertical",
    cardLayout: "horizontal"
  }
};

const elements = {
  launcherView: document.querySelector("#launcher-view"),
  customizeView: document.querySelector("#customize-view"),
  configPath: document.querySelector("#config-path"),
  openConfig: document.querySelector("#open-config"),
  reloadLauncher: document.querySelector("#reload-launcher"),
  toggleAddApp: document.querySelector("#toggle-add-app"),
  toggleCustomize: document.querySelector("#toggle-customize"),
  backToLauncher: document.querySelector("#back-to-launcher"),
  customizePanel: document.querySelector("#customize-panel"),
  themePreset: document.querySelector("#theme-preset"),
  themeEffect: document.querySelector("#theme-effect"),
  themeBackground: document.querySelector("#theme-background"),
  themeSurface: document.querySelector("#theme-surface"),
  themeCard: document.querySelector("#theme-card"),
  themeText: document.querySelector("#theme-text"),
  themeAccent: document.querySelector("#theme-accent"),
  themeGradientEnabled: document.querySelector("#theme-gradient-enabled"),
  resetTheme: document.querySelector("#reset-theme"),
  addAppPanel: document.querySelector("#add-app-panel"),
  addAppTitle: document.querySelector("#add-app-title"),
  addAppHelp: document.querySelector("#add-app-help"),
  appName: document.querySelector("#app-name"),
  appKind: document.querySelector("#app-kind"),
  appGroup: document.querySelector("#app-group"),
  appIcon: document.querySelector("#app-icon"),
  appIconPath: document.querySelector("#app-icon-path"),
  browseIcon: document.querySelector("#browse-icon"),
  appDescription: document.querySelector("#app-description"),
  appTarget: document.querySelector("#app-target"),
  targetLabel: document.querySelector("#target-label"),
  browseTarget: document.querySelector("#browse-target"),
  commandFields: document.querySelector("#command-fields"),
  appArgs: document.querySelector("#app-args"),
  appCwd: document.querySelector("#app-cwd"),
  browseCwd: document.querySelector("#browse-cwd"),
  appConsoleWindow: document.querySelector("#app-console-window"),
  appKeepOpen: document.querySelector("#app-keep-open"),
  saveApp: document.querySelector("#save-app"),
  clearAddApp: document.querySelector("#clear-add-app"),
  cancelEditApp: document.querySelector("#cancel-edit-app"),
  toggleSettings: document.querySelector("#toggle-settings"),
  restartApp: document.querySelector("#restart-app"),
  settingsPanel: document.querySelector("#settings-panel"),
  appOrientation: document.querySelector("#app-orientation"),
  cardLayout: document.querySelector("#card-layout"),
  launcherGroups: document.querySelector("#launcher-groups"),
  launcherEmpty: document.querySelector("#launcher-empty"),
  launcherStatus: document.querySelector("#launcher-status"),
  statusBar: document.querySelector("#status-bar")
};

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function setStatus(message, tone = "idle") {
  elements.statusBar.textContent = message;
  elements.statusBar.className = `status-bar ${tone}`;
}

function renderResult(element, lines) {
  element.innerHTML = lines.map((line) => `<div>${escapeHtml(line)}</div>`).join("");
  element.classList.remove("hidden");
}

function hideResult(element) {
  element.innerHTML = "";
  element.classList.add("hidden");
}

function showLauncherView() {
  elements.customizeView.classList.add("hidden");
  elements.launcherView.classList.remove("hidden");
  setStatus("App Launcher view open.", "idle");
}

function showCustomizeView() {
  elements.launcherView.classList.add("hidden");
  elements.customizeView.classList.remove("hidden");
  setStatus("Customize UI view open.", "idle");
}

function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function normalizeOrientation(value) {
  return value === "vertical" ? "vertical" : "horizontal";
}

function normalizeCardLayout(value) {
  return value === "vertical" ? "vertical" : "horizontal";
}

function normalizeAppKind(value) {
  const kind = String(value ?? "").trim().toLowerCase();
  return ["executable", "file", "folder", "url", "command"].includes(kind) ? kind : "executable";
}

function splitCommandArgs(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function setIfPresent(payload, key, value) {
  const text = String(value ?? "").trim();

  if (text) {
    payload[key] = text;
  }
}

function isHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value ?? "").trim());
}

function normalizeHexColor(value, fallback) {
  const text = String(value ?? "").trim();
  return isHexColor(text) ? text : fallback;
}

function hexToRgba(hex, alpha) {
  const normalized = normalizeHexColor(hex, "#000000").slice(1);
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function normalizeThemeEffect(value) {
  return ["none", "glow", "glass", "grid", "scanlines"].includes(value) ? value : "none";
}

function normalizeThemePreset(value) {
  return Object.prototype.hasOwnProperty.call(THEME_PRESETS, value) ? value : "custom";
}

function normalizeTheme(value) {
  const source = value && typeof value === "object" ? value : {};

  return {
    preset: source.preset === undefined ? DEFAULT_THEME.preset : normalizeThemePreset(source.preset),
    background: normalizeHexColor(source.background, DEFAULT_THEME.background),
    surface: normalizeHexColor(source.surface, DEFAULT_THEME.surface),
    card: normalizeHexColor(source.card, DEFAULT_THEME.card),
    text: normalizeHexColor(source.text, DEFAULT_THEME.text),
    accent: normalizeHexColor(source.accent, DEFAULT_THEME.accent),
    gradientEnabled: source.gradientEnabled === true,
    effect: normalizeThemeEffect(source.effect)
  };
}

function loadTheme() {
  try {
    state.theme = normalizeTheme(JSON.parse(window.localStorage.getItem("homeLauncherTheme") ?? "{}"));
  } catch {
    state.theme = { ...DEFAULT_THEME };
  }
}

function saveTheme() {
  window.localStorage.setItem("homeLauncherTheme", JSON.stringify(state.theme));
}

function getGradientBackground(theme) {
  return [
    `radial-gradient(circle at 18% 12%, ${hexToRgba(theme.accent, 0.24)}, transparent 34%)`,
    `radial-gradient(circle at 82% 0%, ${hexToRgba(theme.card, 0.65)}, transparent 38%)`,
    `linear-gradient(180deg, ${theme.background} 0%, ${theme.surface} 100%)`
  ].join(", ");
}

function updateThemeControls() {
  elements.themePreset.value = state.theme.preset;
  elements.themeEffect.value = state.theme.effect;
  elements.themeBackground.value = state.theme.background;
  elements.themeSurface.value = state.theme.surface;
  elements.themeCard.value = state.theme.card;
  elements.themeText.value = state.theme.text;
  elements.themeAccent.value = state.theme.accent;
  elements.themeGradientEnabled.checked = state.theme.gradientEnabled;
}

function applyTheme() {
  const theme = normalizeTheme(state.theme);
  state.theme = theme;
  const rootStyle = document.documentElement.style;

  rootStyle.setProperty("--bg", theme.background);
  rootStyle.setProperty("--surface", theme.surface);
  rootStyle.setProperty("--surface-soft", theme.surface);
  rootStyle.setProperty("--surface-strong", theme.card);
  rootStyle.setProperty("--text", theme.text);
  rootStyle.setProperty("--accent", theme.accent);
  rootStyle.setProperty("--accent-strong", theme.accent);
  rootStyle.setProperty("--line", hexToRgba(theme.accent, 0.16));
  rootStyle.setProperty("--line-strong", hexToRgba(theme.accent, 0.32));
  rootStyle.setProperty("--page-background", theme.gradientEnabled ? getGradientBackground(theme) : theme.background);
  rootStyle.setProperty("--primary-background", theme.gradientEnabled
    ? `linear-gradient(180deg, ${hexToRgba(theme.accent, 0.68)}, ${hexToRgba(theme.card, 0.88)})`
    : theme.card
  );
  rootStyle.setProperty("--launcher-card-background", theme.gradientEnabled
    ? `linear-gradient(180deg, ${hexToRgba(theme.card, 0.96)}, ${hexToRgba(theme.surface, 0.96)})`
    : theme.card
  );

  for (const effect of ["glow", "glass", "grid", "scanlines"]) {
    document.body.classList.toggle(`effect-${effect}`, theme.effect === effect);
  }

  updateThemeControls();
}

function setThemeFromControls({ customPreset = true } = {}) {
  state.theme = normalizeTheme({
    preset: customPreset ? "custom" : elements.themePreset.value,
    background: elements.themeBackground.value,
    surface: elements.themeSurface.value,
    card: elements.themeCard.value,
    text: elements.themeText.value,
    accent: elements.themeAccent.value,
    gradientEnabled: elements.themeGradientEnabled.checked,
    effect: elements.themeEffect.value
  });
  applyTheme();
  saveTheme();
}

function applyThemePreset(presetName) {
  const preset = THEME_PRESETS[presetName] ?? DEFAULT_THEME;
  state.theme = normalizeTheme({ ...preset });
  applyTheme();
  saveTheme();
  setStatus(`Applied ${elements.themePreset.options[elements.themePreset.selectedIndex].text} theme.`, "success");
}

function resetThemeWithConfirmation() {
  if (!window.confirm("Reset UI colors and effects back to normal?")) {
    setStatus("Theme reset canceled.", "idle");
    return;
  }

  state.theme = { ...DEFAULT_THEME };
  applyTheme();
  saveTheme();
  setStatus("UI colors reset to normal.", "success");
}

function updateAddAppForm() {
  const kind = normalizeAppKind(elements.appKind.value);
  const isCommand = kind === "command";
  const isUrl = kind === "url";
  const isEditing = Boolean(state.editingEntry);
  const labels = {
    executable: "Executable path",
    file: "File path",
    folder: "Folder path",
    url: "Website URL",
    command: "Command"
  };
  const placeholders = {
    executable: "C:\\Windows\\System32\\notepad.exe",
    file: "C:\\Users\\bryce\\Downloads\\file.pdf",
    folder: "C:\\Users\\bryce\\Downloads",
    url: "https://example.com",
    command: "C:\\Program Files\\nodejs\\node.exe"
  };

  elements.targetLabel.textContent = labels[kind];
  elements.appTarget.placeholder = placeholders[kind];
  elements.browseTarget.disabled = isUrl;
  elements.browseTarget.title = isUrl ? "Type website URLs manually." : "";
  elements.commandFields.classList.toggle("hidden", !isCommand);
  elements.addAppTitle.textContent = isEditing ? "Edit App" : "Add App";
  elements.addAppHelp.textContent = isEditing
    ? `Updates this app in ${state.editingEntry.sourceFile}.`
    : "Writes a new launcher entry to `/Home/Confg/apps.json`. Manual JSON configs still work.";
  elements.saveApp.textContent = isEditing ? "Update App" : "Save App";
  elements.clearAddApp.textContent = isEditing ? "Reset Fields" : "Clear";
  elements.cancelEditApp.classList.toggle("hidden", !isEditing);
}

function clearAddAppForm({ keepEditMode = false } = {}) {
  const editingEntry = state.editingEntry;
  elements.addAppPanel.reset();

  if (keepEditMode && editingEntry) {
    populateAddAppForm(editingEntry, { keepPanelState: true });
    return;
  }

  state.editingEntry = null;
  updateAddAppForm();
}

function buildAddAppPayload() {
  const kind = normalizeAppKind(elements.appKind.value);
  const payload = {
    name: elements.appName.value,
    kind
  };

  if (state.editingEntry) {
    payload.sourceFile = state.editingEntry.sourceFile;
    payload.sourceIndex = state.editingEntry.sourceIndex;
  }

  setIfPresent(payload, "description", elements.appDescription.value);
  setIfPresent(payload, "group", elements.appGroup.value);
  setIfPresent(payload, "icon", elements.appIcon.value);
  setIfPresent(payload, "iconPath", elements.appIconPath.value);

  if (kind === "command") {
    payload.command = elements.appTarget.value;
    payload.args = splitCommandArgs(elements.appArgs.value);
    payload.cwd = elements.appCwd.value;
    payload.consoleWindow = elements.appConsoleWindow.value;
    payload.keepOpen = elements.appKeepOpen.checked;
    return payload;
  }

  payload.target = elements.appTarget.value;
  return payload;
}

function populateAddAppForm(entry, options = {}) {
  state.editingEntry = entry;
  elements.appName.value = entry.name ?? "";
  elements.appKind.value = normalizeAppKind(entry.kind);
  elements.appGroup.value = entry.group ?? "";
  elements.appIcon.value = entry.icon ?? "";
  elements.appIconPath.value = entry.rawIconPath ?? entry.iconPath ?? "";
  elements.appDescription.value = entry.description ?? "";
  elements.appTarget.value =
    entry.kind === "command"
      ? entry.command ?? entry.target ?? ""
      : entry.rawTarget ?? entry.target ?? "";
  elements.appArgs.value = Array.isArray(entry.args) ? entry.args.join("\n") : "";
  elements.appCwd.value = entry.rawCwd ?? entry.cwd ?? "";
  elements.appConsoleWindow.value = entry.consoleWindow ?? "normal";
  elements.appKeepOpen.checked = entry.keepOpen === true;

  if (options.keepPanelState !== true) {
    elements.addAppPanel.classList.remove("hidden");
    elements.addAppPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  updateAddAppForm();
}

function loadSettings() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem("homeLauncherSettings") ?? "{}");
    state.settings.appOrientation = normalizeOrientation(parsed.appOrientation ?? "vertical");
    state.settings.cardLayout = normalizeCardLayout(parsed.cardLayout ?? parsed.layoutMode);
  } catch {
    state.settings.appOrientation = "vertical";
    state.settings.cardLayout = "horizontal";
  }
}

function saveSettings() {
  window.localStorage.setItem("homeLauncherSettings", JSON.stringify(state.settings));
}

function applySettings() {
  const appOrientation = normalizeOrientation(state.settings.appOrientation);
  const cardLayout = normalizeCardLayout(state.settings.cardLayout);
  const effectiveCardLayout = appOrientation === "vertical" ? "vertical" : cardLayout;
  state.settings.appOrientation = appOrientation;
  state.settings.cardLayout = cardLayout;
  elements.appOrientation.value = appOrientation;
  elements.cardLayout.value = effectiveCardLayout;
  elements.cardLayout.disabled = appOrientation === "vertical";
  elements.cardLayout.title =
    appOrientation === "vertical"
      ? "Vertical app mode forces the tall launcher layout."
      : "";
  document.body.classList.toggle("app-vertical", appOrientation === "vertical");
  document.body.classList.toggle("app-horizontal", appOrientation === "horizontal");
  document.body.classList.toggle("cards-vertical", effectiveCardLayout === "vertical");
  document.body.classList.toggle("cards-horizontal", effectiveCardLayout === "horizontal");

  if (window.homeLauncher?.setWindowOrientation) {
    window.homeLauncher.setWindowOrientation(appOrientation).catch((error) => {
      setStatus(error.message, "error");
    });
  }
}

function getKindLabel(kind) {
  if (kind === "url") {
    return "url";
  }

  if (kind === "folder") {
    return "folder";
  }

  if (kind === "executable") {
    return "app";
  }

  if (kind === "command") {
    return "command";
  }

  return "file";
}

function groupEntries(entries) {
  const groups = new Map();

  for (const entry of entries) {
    const groupName = entry.group || "Apps";

    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }

    groups.get(groupName).push(entry);
  }

  return Array.from(groups.entries());
}

function buildLauncherCard(entry) {
  const card = document.createElement("div");
  card.className = "launcher-card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Launch ${entry.name}`);

  if (entry.accent) {
    card.style.borderColor = entry.accent;
  }

  const icon = document.createElement("span");
  icon.className = "launcher-card-icon";
  const iconUrl = entry.iconUrl || entry.systemIconUrl;

  if (iconUrl) {
    const iconImage = document.createElement("img");
    iconImage.alt = "";
    iconImage.src = iconUrl;
    iconImage.addEventListener("error", () => {
      iconImage.remove();
      icon.classList.remove("has-image");
      icon.textContent = entry.icon || "AP";
    });
    icon.classList.add("has-image");
    icon.appendChild(iconImage);
  } else {
    icon.textContent = entry.icon || "AP";
  }

  if (entry.accent && !iconUrl) {
    icon.style.background = entry.accent;
    icon.style.color = "#091015";
  }

  const title = document.createElement("strong");
  title.textContent = entry.name;

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "launcher-card-edit";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", (event) => {
    event.stopPropagation();
    populateAddAppForm(entry);
    setStatus(`Editing ${entry.name}.`, "idle");
  });

  const description = document.createElement("p");
  description.textContent = entry.description || `Launch ${entry.name}.`;

  const meta = document.createElement("div");
  meta.className = "launcher-card-meta";

  for (const value of [getKindLabel(entry.kind), entry.sourceFile]) {
    const pill = document.createElement("span");
    pill.className = "launcher-pill";
    pill.textContent = value;
    meta.appendChild(pill);
  }

  card.append(icon, title, editButton, description, meta);
  card.addEventListener("click", async (event) => {
    if (event.target.closest("button")) {
      return;
    }

    await launchEntry(entry);
  });
  card.addEventListener("keydown", async (event) => {
    if (event.target.closest("button")) {
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    await launchEntry(entry);
  });

  return card;
}

function renderLauncher() {
  clearChildren(elements.launcherGroups);
  elements.configPath.textContent = state.configDir || "";
  elements.launcherEmpty.classList.toggle("hidden", state.entries.length > 0);

  for (const [groupName, entries] of groupEntries(state.entries)) {
    const section = document.createElement("section");
    section.className = "launcher-group";

    const header = document.createElement("div");
    header.className = "group-header";

    const titleWrap = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = groupName;
    const sub = document.createElement("p");
    sub.textContent = `${entries.length.toLocaleString()} app${entries.length === 1 ? "" : "s"}`;
    titleWrap.append(title, sub);

    const grid = document.createElement("div");
    grid.className = "launcher-grid";

    for (const entry of entries) {
      grid.appendChild(buildLauncherCard(entry));
    }

    header.appendChild(titleWrap);
    section.append(header, grid);
    elements.launcherGroups.appendChild(section);
  }

  if (state.errors.length > 0) {
    renderResult(elements.launcherStatus, ["Launcher Config Warnings", ...state.errors]);
    return;
  }

  hideResult(elements.launcherStatus);
}

async function loadLauncher(showStatus = false) {
  const result = await window.homeLauncher.load();
  state.entries = Array.isArray(result.entries) ? result.entries : [];
  state.errors = Array.isArray(result.errors) ? result.errors : [];
  state.configDir = result.configDir ?? "";
  renderLauncher();

  if (showStatus) {
    setStatus(
      `Loaded ${state.entries.length.toLocaleString()} launcher app${state.entries.length === 1 ? "" : "s"}.`,
      "success"
    );
  }
}

async function launchEntry(entry) {
  try {
    await window.homeLauncher.openTarget({
      kind: entry.kind,
      target: entry.target,
      command: entry.command,
      args: entry.args,
      cwd: entry.cwd,
      keepOpen: entry.keepOpen,
      consoleWindow: entry.consoleWindow
    });
    setStatus(`Launched ${entry.name}.`, "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function restartWithConfirmation(message) {
  if (!window.confirm(message)) {
    setStatus("Restart canceled.", "idle");
    return false;
  }

  try {
    setStatus("Restarting Home Launcher...", "busy");
    await window.homeLauncher.restart();
    return true;
  } catch (error) {
    setStatus(error.message, "error");
    return false;
  }
}

function registerButtons() {
  elements.openConfig.addEventListener("click", async () => {
    try {
      const configDir = await window.homeLauncher.openConfigFolder();
      state.configDir = configDir ?? state.configDir;
      elements.configPath.textContent = state.configDir;
      setStatus(`Opened ${configDir}.`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.reloadLauncher.addEventListener("click", async () => {
    try {
      setStatus("Reloading launcher apps...", "busy");
      await loadLauncher(true);
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.toggleCustomize.addEventListener("click", () => {
    showCustomizeView();
  });

  elements.backToLauncher.addEventListener("click", showLauncherView);

  elements.themePreset.addEventListener("change", () => {
    if (elements.themePreset.value === "custom") {
      state.theme.preset = "custom";
      applyTheme();
      saveTheme();
      setStatus("Theme preset set to custom.", "idle");
      return;
    }

    applyThemePreset(elements.themePreset.value);
  });

  elements.themeEffect.addEventListener("change", () => {
    setThemeFromControls();
    setStatus(`Effect set to ${elements.themeEffect.options[elements.themeEffect.selectedIndex].text}.`, "success");
  });

  for (const input of [
    elements.themeBackground,
    elements.themeSurface,
    elements.themeCard,
    elements.themeText,
    elements.themeAccent,
    elements.themeGradientEnabled
  ]) {
    input.addEventListener("input", () => {
      setThemeFromControls();
      setStatus("UI theme updated.", "success");
    });
  }

  elements.resetTheme.addEventListener("click", resetThemeWithConfirmation);

  elements.toggleAddApp.addEventListener("click", () => {
    const willOpen = elements.addAppPanel.classList.contains("hidden");

    if (willOpen) {
      clearAddAppForm();
      elements.addAppPanel.classList.remove("hidden");
    } else {
      elements.addAppPanel.classList.add("hidden");
    }

    updateAddAppForm();
  });

  elements.appKind.addEventListener("change", updateAddAppForm);

  elements.browseTarget.addEventListener("click", async () => {
    try {
      const kind = normalizeAppKind(elements.appKind.value);
      const result = await window.homeLauncher.chooseTarget({ kind });

      if (!result) {
        setStatus("Browse canceled.", "idle");
        return;
      }

      elements.appTarget.value = result.path;

      if (!elements.appName.value.trim() && result.suggestedName) {
        elements.appName.value = result.suggestedName;
      }

      setStatus("Target selected.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.browseIcon.addEventListener("click", async () => {
    try {
      const result = await window.homeLauncher.chooseTarget({ kind: "icon" });

      if (!result) {
        setStatus("Browse canceled.", "idle");
        return;
      }

      elements.appIconPath.value = result.path;
      setStatus("Icon image selected.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.browseCwd.addEventListener("click", async () => {
    try {
      const result = await window.homeLauncher.chooseTarget({ kind: "cwd" });

      if (!result) {
        setStatus("Browse canceled.", "idle");
        return;
      }

      elements.appCwd.value = result.path;
      setStatus("Working directory selected.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.clearAddApp.addEventListener("click", () => {
    clearAddAppForm({ keepEditMode: Boolean(state.editingEntry) });
    setStatus(state.editingEntry ? "Edit fields reset." : "Add App form cleared.", "idle");
  });

  elements.cancelEditApp.addEventListener("click", () => {
    clearAddAppForm();
    setStatus("Edit canceled.", "idle");
  });

  elements.addAppPanel.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const isEditing = Boolean(state.editingEntry);
      setStatus(isEditing ? "Updating launcher app..." : "Saving launcher app...", "busy");
      const payload = buildAddAppPayload();
      const result = isEditing
        ? await window.homeLauncher.updateApp(payload)
        : await window.homeLauncher.addApp(payload);
      clearAddAppForm();
      await loadLauncher(false);
      setStatus(
        isEditing
          ? `Updated ${result.entry.name} in ${result.sourceFile}.`
          : `Added ${result.entry.name} to apps.json.`,
        "success"
      );
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.toggleSettings.addEventListener("click", () => {
    elements.settingsPanel.classList.toggle("hidden");
  });

  elements.restartApp.addEventListener("click", async () => {
    await restartWithConfirmation("Restart Home Launcher now?");
  });

  elements.appOrientation.addEventListener("change", () => {
    const nextOrientation = normalizeOrientation(elements.appOrientation.value);

    if (nextOrientation === state.settings.appOrientation) {
      return;
    }

    state.settings.appOrientation = nextOrientation;
    applySettings();
    saveSettings();
    setStatus(`App orientation set to ${nextOrientation}.`, "success");
  });

  elements.cardLayout.addEventListener("change", () => {
    if (state.settings.appOrientation === "vertical") {
      applySettings();
      setStatus("Vertical app mode forces the tall launcher layout.", "idle");
      return;
    }

    state.settings.cardLayout = normalizeCardLayout(elements.cardLayout.value);
    applySettings();
    saveSettings();
    setStatus(`Launcher card layout set to ${state.settings.cardLayout}.`, "success");
  });
}

async function initialize() {
  loadSettings();
  loadTheme();
  applyTheme();
  applySettings();
  showLauncherView();
  updateAddAppForm();
  registerButtons();
  setStatus("Loading launcher apps...", "busy");

  try {
    await loadLauncher(true);
  } catch (error) {
    renderResult(elements.launcherStatus, ["Launcher load error", error.message]);
    setStatus(error.message, "error");
  }
}

initialize();
