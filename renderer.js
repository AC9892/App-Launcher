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
  warnings: [],
  configDir: "",
  searchQuery: "",
  tagFilter: "",
  editingEntry: null,
  favorites: new Set(),
  launchStats: {},
  draggedEntryId: "",
  iconLoadToken: 0,
  theme: { ...DEFAULT_THEME },
  customTheme: { ...DEFAULT_THEME, preset: "custom" },
  customEffect: {
    enabled: false,
    css: "",
    name: ""
  },
  customCode: {
    htmlEnabled: false,
    html: "",
    htmlName: "",
    jsEnabled: false,
    js: "",
    jsName: ""
  },
  settings: {
    appOrientation: "vertical",
    cardLayout: "horizontal",
    launchOnStartup: false,
    minimizeToTray: false,
    closeToTray: true,
    showConfigPath: true,
    highlightPrimaryButtons: true,
    advancedCustomization: false,
    deleteConfirmation: true,
    customFont: null
  }
};

const elements = {
  launcherView: document.querySelector("#launcher-view"),
  advancedSettingsView: document.querySelector("#advanced-settings-view"),
  customizeView: document.querySelector("#customize-view"),
  advancedEditorsView: document.querySelector("#advanced-editors-view"),
  configPath: document.querySelector("#config-path"),
  openConfig: document.querySelector("#open-config"),
  exportConfig: document.querySelector("#export-config"),
  importConfig: document.querySelector("#import-config"),
  scanFolder: document.querySelector("#scan-folder"),
  reloadLauncher: document.querySelector("#reload-launcher"),
  toggleAddApp: document.querySelector("#toggle-add-app"),
  toggleCustomize: document.querySelector("#toggle-customize"),
  toggleAdvancedEditors: document.querySelector("#toggle-advanced-editors"),
  backToLauncher: document.querySelector("#back-to-launcher"),
  advancedBackToLauncher: document.querySelector("#advanced-back-to-launcher"),
  advancedBackToCustomize: document.querySelector("#advanced-back-to-customize"),
  popoutAllEditors: document.querySelector("#popout-all-editors"),
  advancedLocked: document.querySelector("#advanced-locked"),
  advancedEditorsGrid: document.querySelector("#advanced-editors-grid"),
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
  customEffectEnabled: document.querySelector("#custom-effect-enabled"),
  customEffectLines: document.querySelector("#custom-effect-lines"),
  customEffectHighlight: document.querySelector("#custom-effect-highlight"),
  customEffectCss: document.querySelector("#custom-effect-css"),
  importEffect: document.querySelector("#import-effect"),
  popoutEffect: document.querySelector("#popout-effect"),
  applyCustomEffect: document.querySelector("#apply-custom-effect"),
  clearCustomEffect: document.querySelector("#clear-custom-effect"),
  customCodePanel: document.querySelector("#custom-code-panel"),
  customHtmlEnabled: document.querySelector("#custom-html-enabled"),
  customHtmlLines: document.querySelector("#custom-html-lines"),
  customHtmlHighlight: document.querySelector("#custom-html-highlight"),
  customHtmlCode: document.querySelector("#custom-html-code"),
  importHtml: document.querySelector("#import-html"),
  popoutHtml: document.querySelector("#popout-html"),
  customJsEnabled: document.querySelector("#custom-js-enabled"),
  customJsLines: document.querySelector("#custom-js-lines"),
  customJsHighlight: document.querySelector("#custom-js-highlight"),
  customJsCode: document.querySelector("#custom-js-code"),
  importJs: document.querySelector("#import-js"),
  popoutJs: document.querySelector("#popout-js"),
  applyCustomCode: document.querySelector("#apply-custom-code"),
  clearCustomCode: document.querySelector("#clear-custom-code"),
  customHtmlRoot: document.querySelector("#custom-html-root"),
  addAppPanel: document.querySelector("#add-app-panel"),
  addAppTitle: document.querySelector("#add-app-title"),
  addAppHelp: document.querySelector("#add-app-help"),
  appName: document.querySelector("#app-name"),
  appKind: document.querySelector("#app-kind"),
  appGroup: document.querySelector("#app-group"),
  appTags: document.querySelector("#app-tags"),
  appIcon: document.querySelector("#app-icon"),
  appIconPath: document.querySelector("#app-icon-path"),
  browseIcon: document.querySelector("#browse-icon"),
  appDescription: document.querySelector("#app-description"),
  appTarget: document.querySelector("#app-target"),
  targetLabel: document.querySelector("#target-label"),
  browseTarget: document.querySelector("#browse-target"),
  runAsAdminField: document.querySelector("#run-as-admin-field"),
  appRunAsAdmin: document.querySelector("#app-run-as-admin"),
  commandFields: document.querySelector("#command-fields"),
  appArgs: document.querySelector("#app-args"),
  appCwd: document.querySelector("#app-cwd"),
  browseCwd: document.querySelector("#browse-cwd"),
  appConsoleWindow: document.querySelector("#app-console-window"),
  appKeepOpen: document.querySelector("#app-keep-open"),
  saveApp: document.querySelector("#save-app"),
  clearAddApp: document.querySelector("#clear-add-app"),
  cancelEditApp: document.querySelector("#cancel-edit-app"),
  deleteApp: document.querySelector("#delete-app"),
  toggleSettings: document.querySelector("#toggle-settings"),
  toggleAdvancedSettingsCompact: document.querySelector("#toggle-advanced-settings-compact"),
  advancedSettingsBackToLauncher: document.querySelector("#advanced-settings-back-to-launcher"),
  advancedSettingsOpenCustomize: document.querySelector("#advanced-settings-open-customize"),
  advancedSettingsOpenEditors: document.querySelector("#advanced-settings-open-editors"),
  restartApp: document.querySelector("#restart-app"),
  hideToTray: document.querySelector("#hide-to-tray"),
  importFont: document.querySelector("#import-font"),
  resetFont: document.querySelector("#reset-font"),
  settingsPanel: document.querySelector("#settings-panel"),
  appOrientation: document.querySelector("#app-orientation"),
  cardLayout: document.querySelector("#card-layout"),
  launchOnStartup: document.querySelector("#launch-on-startup"),
  minimizeToTray: document.querySelector("#minimize-to-tray"),
  closeToTray: document.querySelector("#close-to-tray"),
  showConfigPath: document.querySelector("#show-config-path"),
  highlightPrimaryButtons: document.querySelector("#highlight-primary-buttons"),
  advancedCustomization: document.querySelector("#advanced-customization"),
  deleteConfirmation: document.querySelector("#delete-confirmation"),
  appSearch: document.querySelector("#app-search"),
  tagFilter: document.querySelector("#tag-filter"),
  clearSearch: document.querySelector("#clear-search"),
  quickGroups: document.querySelector("#quick-groups"),
  launcherGroups: document.querySelector("#launcher-groups"),
  launcherEmpty: document.querySelector("#launcher-empty"),
  launcherStatus: document.querySelector("#launcher-status"),
  statusBar: document.querySelector("#status-bar"),
  confirmModal: document.querySelector("#confirm-modal"),
  confirmTitle: document.querySelector("#confirm-title"),
  confirmMessage: document.querySelector("#confirm-message"),
  confirmDetail: document.querySelector("#confirm-detail"),
  confirmCancel: document.querySelector("#confirm-cancel"),
  confirmOk: document.querySelector("#confirm-ok")
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

async function resetInstalledUiProfileOnce() {
  if (!window.homeLauncher?.getRuntimeInfo) {
    return;
  }

  try {
    const runtimeInfo = await window.homeLauncher.getRuntimeInfo();

    if (!runtimeInfo?.packaged || runtimeInfo?.portable) {
      return;
    }

    const resetVersion = `installed-ui-reset-${runtimeInfo.version ?? "1.3.1"}`;
    const markerKey = "appLauncherInstalledUiResetVersion";

    if (window.localStorage.getItem(markerKey) === resetVersion) {
      return;
    }

    for (const key of [
      "homeLauncherSettings",
      "homeLauncherTheme",
      "homeLauncherCustomTheme",
      "homeLauncherCustomEffect",
      "homeLauncherCustomCode",
      "homeLauncherFavorites",
      "homeLauncherLaunchStats"
    ]) {
      window.localStorage.removeItem(key);
    }

    window.localStorage.setItem(markerKey, resetVersion);
  } catch (error) {
    console.warn("Installed UI profile reset skipped.", error);
  }
}

function confirmAction({
  title = "Confirm",
  message = "",
  detail = "",
  confirmLabel = "Continue",
  cancelLabel = "Cancel"
} = {}) {
  return new Promise((resolve) => {
    const previousFocus = document.activeElement;

    elements.confirmTitle.textContent = title;
    elements.confirmMessage.textContent = message;
    elements.confirmOk.textContent = confirmLabel;
    elements.confirmCancel.textContent = cancelLabel;
    elements.confirmDetail.textContent = detail;
    elements.confirmDetail.classList.toggle("hidden", !detail);
    elements.confirmModal.classList.remove("hidden");
    elements.confirmOk.focus();

    const cleanup = (value) => {
      elements.confirmModal.classList.add("hidden");
      elements.confirmOk.removeEventListener("click", onConfirm);
      elements.confirmCancel.removeEventListener("click", onCancel);
      elements.confirmModal.removeEventListener("click", onBackdrop);
      document.removeEventListener("keydown", onKeydown);

      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }

      resolve(value);
    };
    const onConfirm = () => cleanup(true);
    const onCancel = () => cleanup(false);
    const onBackdrop = (event) => {
      if (event.target === elements.confirmModal) {
        cleanup(false);
      }
    };
    const onKeydown = (event) => {
      if (event.key === "Escape") {
        cleanup(false);
      }
    };

    elements.confirmOk.addEventListener("click", onConfirm);
    elements.confirmCancel.addEventListener("click", onCancel);
    elements.confirmModal.addEventListener("click", onBackdrop);
    document.addEventListener("keydown", onKeydown);
  });
}

function showLauncherView() {
  elements.advancedSettingsView.classList.add("hidden");
  elements.customizeView.classList.add("hidden");
  elements.advancedEditorsView.classList.add("hidden");
  elements.launcherView.classList.remove("hidden");
  setStatus("App Launcher view open.", "idle");
}

function showAdvancedSettingsView() {
  elements.launcherView.classList.add("hidden");
  elements.customizeView.classList.add("hidden");
  elements.advancedEditorsView.classList.add("hidden");
  elements.advancedSettingsView.classList.remove("hidden");
  setStatus("Advanced Settings view open.", "idle");
}

function showCustomizeView() {
  elements.launcherView.classList.add("hidden");
  elements.advancedSettingsView.classList.add("hidden");
  elements.advancedEditorsView.classList.add("hidden");
  elements.customizeView.classList.remove("hidden");
  setStatus("Customize UI view open.", "idle");
}

function showAdvancedEditorsView() {
  elements.launcherView.classList.add("hidden");
  elements.advancedSettingsView.classList.add("hidden");
  elements.customizeView.classList.add("hidden");
  elements.advancedEditorsView.classList.remove("hidden");
  updateAdvancedEditorLockState();
  setStatus("Advanced Editors view open.", "idle");
}

function updateAdvancedEditorLockState() {
  const unlocked = state.settings.advancedCustomization === true;
  elements.advancedLocked.classList.toggle("hidden", unlocked);
  elements.advancedEditorsGrid.classList.toggle("hidden", !unlocked);
  elements.customCodePanel.classList.toggle("hidden", !unlocked);
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

function splitTags(value) {
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeDuplicateText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getPayloadLaunchKey(payload) {
  if (payload.kind === "command") {
    return normalizeDuplicateText([
      payload.kind,
      payload.command,
      ...(Array.isArray(payload.args) ? payload.args : []),
      payload.cwd ?? ""
    ].join("\u0000"));
  }

  return normalizeDuplicateText(`${payload.kind}\u0000${payload.target ?? ""}`);
}

function getEntryKey(entry) {
  return getPayloadLaunchKey(entry);
}

function getEntryIdentity(entry) {
  return `${entry.sourceFile ?? ""}\u0000${entry.sourceIndex ?? ""}\u0000${entry.id ?? ""}`;
}

function findDuplicateApp(payload) {
  const nextName = normalizeDuplicateText(payload.name);
  const nextLaunchKey = getPayloadLaunchKey(payload);

  return state.entries.find((entry) => {
    const isSameSource =
      state.editingEntry &&
      entry.sourceFile === state.editingEntry.sourceFile &&
      entry.sourceIndex === state.editingEntry.sourceIndex;

    if (isSameSource) {
      return false;
    }

    if (normalizeDuplicateText(entry.name) === nextName) {
      return true;
    }

    return getPayloadLaunchKey(entry) === nextLaunchKey;
  });
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

function buildCommandPreview(entry) {
  const command = String(entry.command ?? entry.target ?? "").trim();
  const args = Array.isArray(entry.args) ? entry.args : [];
  return [command, ...args].map(quoteCommandPart).join(" ");
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

  try {
    state.customTheme = normalizeTheme({
      ...DEFAULT_THEME,
      preset: "custom",
      ...JSON.parse(window.localStorage.getItem("homeLauncherCustomTheme") ?? "{}")
    });
    state.customTheme.preset = "custom";
  } catch {
    state.customTheme = { ...DEFAULT_THEME, preset: "custom" };
  }

  if (state.theme.preset === "custom") {
    state.customTheme = { ...state.theme, preset: "custom" };
  }
}

function saveTheme() {
  window.localStorage.setItem("homeLauncherTheme", JSON.stringify(state.theme));
}

function saveCustomTheme() {
  state.customTheme = normalizeTheme({ ...state.theme, preset: "custom" });
  state.customTheme.preset = "custom";
  window.localStorage.setItem("homeLauncherCustomTheme", JSON.stringify(state.customTheme));
}

function normalizeCustomEffect(value) {
  const source = value && typeof value === "object" ? value : {};

  return {
    enabled: source.enabled === true,
    css: String(source.css ?? ""),
    name: String(source.name ?? "").trim()
  };
}

function loadCustomEffect() {
  try {
    state.customEffect = normalizeCustomEffect(
      JSON.parse(window.localStorage.getItem("homeLauncherCustomEffect") ?? "{}")
    );
  } catch {
    state.customEffect = normalizeCustomEffect({});
  }
}

function saveCustomEffect() {
  window.localStorage.setItem("homeLauncherCustomEffect", JSON.stringify(state.customEffect));
}

function updateCustomEffectControls() {
  elements.customEffectEnabled.checked = state.customEffect.enabled;
  elements.customEffectCss.value = state.customEffect.css;
  syncCodeEditor(elements.customEffectCss, elements.customEffectLines, elements.customEffectHighlight, "css");
}

function applyCustomEffect() {
  let style = document.querySelector("#custom-effect-style");

  if (!state.customEffect.enabled || !state.customEffect.css.trim()) {
    if (style) {
      style.remove();
    }

    updateCustomEffectControls();
    return;
  }

  if (!style) {
    style = document.createElement("style");
    style.id = "custom-effect-style";
    document.head.appendChild(style);
  }

  style.textContent = state.customEffect.css;
  updateCustomEffectControls();
}

function normalizeCustomCode(value) {
  const source = value && typeof value === "object" ? value : {};

  return {
    htmlEnabled: source.htmlEnabled === true,
    html: String(source.html ?? ""),
    htmlName: String(source.htmlName ?? "").trim(),
    jsEnabled: source.jsEnabled === true,
    js: String(source.js ?? ""),
    jsName: String(source.jsName ?? "").trim()
  };
}

function loadCustomCode() {
  try {
    state.customCode = normalizeCustomCode(
      JSON.parse(window.localStorage.getItem("homeLauncherCustomCode") ?? "{}")
    );
  } catch {
    state.customCode = normalizeCustomCode({});
  }
}

function saveCustomCode() {
  window.localStorage.setItem("homeLauncherCustomCode", JSON.stringify(state.customCode));
}

function syncEditorsFromControls() {
  state.customEffect.css = elements.customEffectCss.value;
  state.customCode.html = elements.customHtmlCode.value;
  state.customCode.js = elements.customJsCode.value;
}

function autosaveCustomEditors({ silent = false } = {}) {
  syncEditorsFromControls();
  saveCustomEffect();
  saveCustomCode();

  if (!silent) {
    setStatus("Advanced editors autosaved.", "success");
  }
}

function getLineNumberText(value) {
  const lineCount = Math.max(1, String(value ?? "").split("\n").length);
  return Array.from({ length: lineCount }, (_, index) => String(index + 1)).join("\n");
}

function classifyCodeToken(token, language) {
  if (/^\/\*[\s\S]*\*\/$/.test(token) || /^\/\//.test(token) || /^<!--[\s\S]*-->$/.test(token)) {
    return "comment";
  }

  if (/^["'`]/.test(token)) {
    return "string";
  }

  if (language === "html" && /^<\/?[A-Za-z]/.test(token)) {
    return "tag";
  }

  if (/^#[0-9a-fA-F]{3,8}\b/.test(token)) {
    return "color";
  }

  if (/^\d/.test(token)) {
    return "number";
  }

  if (language === "css") {
    return "property";
  }

  return "keyword";
}

function highlightCode(value, language) {
  const source = String(value ?? "");
  const patterns = {
    css: /\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s)?\b|\b(?:body|html|content|position|fixed|absolute|relative|inset|pointer-events|background|linear-gradient|radial-gradient|rgba|transparent|color|display|grid|flex|border|padding|margin|z-index|opacity|transform|animation|keyframes|filter|box-shadow)\b/g,
    html: /<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
    js: /\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b(?:const|let|var|function|return|if|else|for|while|try|catch|class|new|async|await|true|false|null|undefined|document|window|localStorage|querySelector|addEventListener|setInterval|clearInterval|JSON|String|Array|Object)\b/g
  };
  const pattern = patterns[language] ?? patterns.js;
  let html = "";
  let cursor = 0;

  for (const match of source.matchAll(pattern)) {
    const token = match[0];
    const index = match.index ?? 0;
    html += escapeHtml(source.slice(cursor, index));
    html += `<span class="token-${classifyCodeToken(token, language)}">${escapeHtml(token)}</span>`;
    cursor = index + token.length;
  }

  html += escapeHtml(source.slice(cursor));
  return html || " ";
}

function syncCodeEditor(textarea, lineElement, highlightElement, language) {
  lineElement.textContent = getLineNumberText(textarea.value);
  lineElement.scrollTop = textarea.scrollTop;
  highlightElement.innerHTML = highlightCode(textarea.value, language);
  highlightElement.scrollTop = textarea.scrollTop;
  highlightElement.scrollLeft = textarea.scrollLeft;
}

function setupCodeEditor(textarea, lineElement, highlightElement, language) {
  const sync = () => syncCodeEditor(textarea, lineElement, highlightElement, language);
  textarea.addEventListener("input", sync);
  textarea.addEventListener("scroll", sync);
  sync();
}

function updateAdvancedCodeEditors() {
  syncCodeEditor(elements.customEffectCss, elements.customEffectLines, elements.customEffectHighlight, "css");
  syncCodeEditor(elements.customHtmlCode, elements.customHtmlLines, elements.customHtmlHighlight, "html");
  syncCodeEditor(elements.customJsCode, elements.customJsLines, elements.customJsHighlight, "js");
}

function updateCustomCodeControls() {
  elements.customHtmlEnabled.checked = state.customCode.htmlEnabled;
  elements.customHtmlCode.value = state.customCode.html;
  elements.customJsEnabled.checked = state.customCode.jsEnabled;
  elements.customJsCode.value = state.customCode.js;
  updateAdvancedCodeEditors();
  updateAdvancedEditorLockState();
}

function clearAppliedCustomCode() {
  elements.customHtmlRoot.innerHTML = "";
}

function applyCustomCode({ runJs = true } = {}) {
  clearAppliedCustomCode();

  if (!state.settings.advancedCustomization) {
    updateCustomCodeControls();
    return;
  }

  if (state.customCode.htmlEnabled && state.customCode.html.trim()) {
    elements.customHtmlRoot.innerHTML = state.customCode.html;
  }

  if (runJs && state.customCode.jsEnabled && state.customCode.js.trim()) {
    try {
      Function("window", "document", "homeLauncher", state.customCode.js)(
        window,
        document,
        window.homeLauncher
      );
    } catch (error) {
      setStatus(`Custom JS error: ${error.message}`, "error");
    }
  }

  updateCustomCodeControls();
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

  if (state.theme.preset === "custom") {
    saveCustomTheme();
  }
}

function applyThemePreset(presetName) {
  const preset = THEME_PRESETS[presetName] ?? DEFAULT_THEME;
  state.theme = normalizeTheme({ ...preset });
  applyTheme();
  saveTheme();
  setStatus(`Applied ${elements.themePreset.options[elements.themePreset.selectedIndex].text} theme.`, "success");
}

async function resetThemeWithConfirmation() {
  const confirmed = await confirmAction({
    title: "Reset Colors",
    message: "Reset UI colors and effects back to normal?",
    confirmLabel: "Reset Colors"
  });

  if (!confirmed) {
    setStatus("Theme reset canceled.", "idle");
    return;
  }

  state.theme = { ...DEFAULT_THEME };
  state.customTheme = { ...DEFAULT_THEME, preset: "custom" };
  applyTheme();
  saveTheme();
  window.localStorage.setItem("homeLauncherCustomTheme", JSON.stringify(state.customTheme));
  setStatus("UI colors reset to normal.", "success");
}

function updateAddAppForm() {
  const kind = normalizeAppKind(elements.appKind.value);
  const isCommand = kind === "command";
  const canRunAsAdmin = kind === "command" || kind === "executable";
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
    file: "C:\\Path\\To\\file.pdf",
    folder: "C:\\Path\\To\\Folder",
    url: "https://example.com",
    command: "C:\\Program Files\\nodejs\\node.exe"
  };

  elements.targetLabel.textContent = labels[kind];
  elements.appTarget.placeholder = placeholders[kind];
  elements.browseTarget.disabled = isUrl;
  elements.browseTarget.title = isUrl ? "Type website URLs manually." : "";
  elements.runAsAdminField.classList.toggle("hidden", !canRunAsAdmin);

  if (!canRunAsAdmin) {
    elements.appRunAsAdmin.checked = false;
  }

  elements.commandFields.classList.toggle("hidden", !isCommand);
  elements.addAppTitle.textContent = isEditing ? "Edit App" : "Add App";
  elements.addAppHelp.textContent = isEditing
    ? `Updates this app in ${state.editingEntry.sourceFile}.`
    : "Writes a new launcher entry to `/Home/Confg/apps.json`. Manual JSON configs still work.";
  elements.saveApp.textContent = isEditing ? "Update App" : "Save App";
  elements.clearAddApp.textContent = isEditing ? "Reset Fields" : "Clear";
  elements.cancelEditApp.classList.toggle("hidden", !isEditing);
  elements.deleteApp.classList.toggle("hidden", !isEditing);
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
  payload.tags = splitTags(elements.appTags.value);
  setIfPresent(payload, "icon", elements.appIcon.value);
  setIfPresent(payload, "iconPath", elements.appIconPath.value);
  payload.runAsAdmin = elements.appRunAsAdmin.checked;

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

function getLauncherScrollState() {
  return {
    windowX: window.scrollX,
    windowY: window.scrollY,
    launcherX: elements.launcherView.scrollLeft,
    launcherY: elements.launcherView.scrollTop,
    groups: Array.from(elements.launcherGroups.querySelectorAll(".launcher-grid")).map((grid) => grid.scrollLeft),
    quickGroups: Array.from(elements.quickGroups.querySelectorAll(".launcher-grid")).map((grid) => grid.scrollLeft)
  };
}

function restoreLauncherScrollState(scrollState) {
  if (!scrollState) {
    return;
  }

  const applyScrollState = () => {
    Array.from(elements.launcherGroups.querySelectorAll(".launcher-grid")).forEach((grid, index) => {
      grid.scrollLeft = scrollState.groups[index] ?? 0;
    });
    Array.from(elements.quickGroups.querySelectorAll(".launcher-grid")).forEach((grid, index) => {
      grid.scrollLeft = scrollState.quickGroups[index] ?? 0;
    });
    elements.launcherView.scrollLeft = scrollState.launcherX ?? 0;
    elements.launcherView.scrollTop = scrollState.launcherY ?? 0;
    window.scrollTo(scrollState.windowX, scrollState.windowY);
  };

  requestAnimationFrame(() => {
    applyScrollState();
    requestAnimationFrame(applyScrollState);
    window.setTimeout(applyScrollState, 75);
  });
}

async function deleteEditingApp() {
  const entry = state.editingEntry;
  const scrollState = getLauncherScrollState();

  if (!entry) {
    setStatus("No app is selected for deletion.", "error");
    return;
  }

  if (state.settings.deleteConfirmation) {
    const confirmed = await confirmAction({
      title: "Delete app?",
      message: `Delete ${entry.name} from ${entry.sourceFile}?`,
      detail: "This removes the launcher entry from its config file. It does not delete the actual app, file, or folder.",
      confirmLabel: "Delete App"
    });

    if (!confirmed) {
      setStatus("Delete canceled.", "idle");
      return;
    }
  }

  setStatus(`Deleting ${entry.name}...`, "busy");
  const result = await window.homeLauncher.deleteApp({
    sourceFile: entry.sourceFile,
    sourceIndex: entry.sourceIndex
  });

  clearAddAppForm();
  await loadLauncher(false);
  restoreLauncherScrollState(scrollState);
  setStatus(`Deleted ${result.entry.name ?? entry.name} from ${result.sourceFile}.`, "success");
}

async function deleteLauncherCard(entry) {
  const scrollState = getLauncherScrollState();

  if (state.settings.deleteConfirmation) {
    const confirmed = await confirmAction({
      title: "Delete app?",
      message: `Delete ${entry.name} from ${entry.sourceFile}?`,
      detail: "This removes the launcher entry from its config file. It does not delete the actual app, file, or folder.",
      confirmLabel: "Delete App"
    });

    if (!confirmed) {
      setStatus("Delete canceled.", "idle");
      return;
    }
  }

  setStatus(`Deleting ${entry.name}...`, "busy");
  const result = await window.homeLauncher.deleteApp({
    sourceFile: entry.sourceFile,
    sourceIndex: entry.sourceIndex
  });

  if (
    state.editingEntry &&
    state.editingEntry.sourceFile === entry.sourceFile &&
    state.editingEntry.sourceIndex === entry.sourceIndex
  ) {
    clearAddAppForm();
  }

  await loadLauncher(false);
  restoreLauncherScrollState(scrollState);
  setStatus(`Deleted ${result.entry.name ?? entry.name} from ${result.sourceFile}.`, "success");
}

function populateAddAppForm(entry, options = {}) {
  state.editingEntry = entry;
  elements.appName.value = entry.name ?? "";
  elements.appKind.value = normalizeAppKind(entry.kind);
  elements.appGroup.value = entry.group ?? "";
  elements.appTags.value = Array.isArray(entry.tags) ? entry.tags.join(", ") : "";
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
  elements.appRunAsAdmin.checked = entry.runAsAdmin === true;

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
    state.settings.launchOnStartup = parsed.launchOnStartup === true;
    state.settings.minimizeToTray = false;
    state.settings.closeToTray = parsed.closeToTray !== false;
    state.settings.showConfigPath = parsed.showConfigPath !== false;
    state.settings.highlightPrimaryButtons = parsed.highlightPrimaryButtons !== false;
    state.settings.advancedCustomization = parsed.advancedCustomization === true;
    state.settings.deleteConfirmation = parsed.deleteConfirmation !== false;
    state.settings.customFont = parsed.customFont && typeof parsed.customFont === "object" ? parsed.customFont : null;
  } catch {
    state.settings.appOrientation = "vertical";
    state.settings.cardLayout = "horizontal";
    state.settings.launchOnStartup = false;
    state.settings.minimizeToTray = false;
    state.settings.closeToTray = true;
    state.settings.showConfigPath = true;
    state.settings.highlightPrimaryButtons = true;
    state.settings.advancedCustomization = false;
    state.settings.deleteConfirmation = true;
    state.settings.customFont = null;
  }
}

function saveSettings() {
  const persistedSettings = {
    ...state.settings,
    minimizeToTray: false
  };
  window.localStorage.setItem("homeLauncherSettings", JSON.stringify(persistedSettings));
}

function updateConfigPathVisibility() {
  const showPath = state.settings.showConfigPath === true;
  elements.configPath.textContent = state.configDir || "";
  elements.configPath.classList.toggle("config-path-hidden", !showPath);
  elements.configPath.style.visibility = showPath ? "" : "hidden";
  elements.configPath.style.userSelect = showPath ? "" : "none";
  elements.configPath.style.pointerEvents = showPath ? "" : "none";
}

function applySettings({ syncTray = false, syncWindow = true } = {}) {
  const appOrientation = normalizeOrientation(state.settings.appOrientation);
  const cardLayout = normalizeCardLayout(state.settings.cardLayout);
  const effectiveCardLayout = appOrientation === "vertical" ? "vertical" : cardLayout;
  state.settings.appOrientation = appOrientation;
  state.settings.cardLayout = cardLayout;
  elements.appOrientation.value = appOrientation;
  elements.cardLayout.value = effectiveCardLayout;
  elements.launchOnStartup.checked = state.settings.launchOnStartup;
  elements.minimizeToTray.checked = state.settings.minimizeToTray;
  elements.closeToTray.checked = state.settings.closeToTray;
  elements.showConfigPath.checked = state.settings.showConfigPath;
  elements.highlightPrimaryButtons.checked = state.settings.highlightPrimaryButtons;
  elements.advancedCustomization.checked = state.settings.advancedCustomization;
  elements.deleteConfirmation.checked = state.settings.deleteConfirmation;
  elements.cardLayout.disabled = appOrientation === "vertical";
  elements.cardLayout.title =
    appOrientation === "vertical"
      ? "Vertical app mode forces the tall launcher layout."
      : "";
  document.body.classList.toggle("app-vertical", appOrientation === "vertical");
  document.body.classList.toggle("app-horizontal", appOrientation === "horizontal");
  document.body.classList.toggle("cards-vertical", effectiveCardLayout === "vertical");
  document.body.classList.toggle("cards-horizontal", effectiveCardLayout === "horizontal");
  document.body.classList.toggle("plain-primary-buttons", !state.settings.highlightPrimaryButtons);
  updateConfigPathVisibility();

  if (syncWindow && window.homeLauncher?.setWindowOrientation) {
    window.homeLauncher.setWindowOrientation(appOrientation).catch((error) => {
      setStatus(error.message, "error");
    });
  }

  if (syncTray && window.homeLauncher?.setTray) {
    window.homeLauncher.setTray(state.settings.minimizeToTray).catch((error) => {
      setStatus(error.message, "error");
    });
  }

  if (window.homeLauncher?.setCloseToTray) {
    window.homeLauncher.setCloseToTray(state.settings.closeToTray).catch((error) => {
      setStatus(error.message, "error");
    });
  }

  applyCustomFont();
  applyCustomCode({ runJs: false });
}

function applyCustomFont() {
  let style = document.querySelector("#custom-font-style");

  if (!state.settings.customFont) {
    if (style) {
      style.remove();
    }

    document.documentElement.style.removeProperty("--font-body");
    document.documentElement.style.removeProperty("--font-display");
    return;
  }

  if (!style) {
    style = document.createElement("style");
    style.id = "custom-font-style";
    document.head.appendChild(style);
  }

  const fontName = `HomeCustomFont-${String(state.settings.customFont.name ?? "Imported").replace(/[^a-z0-9_-]/gi, "")}`;
  style.textContent = `@font-face { font-family: "${fontName}"; src: url("${state.settings.customFont.url}"); }`;
  document.documentElement.style.setProperty("--font-body", `"${fontName}", "Aptos", sans-serif`);
  document.documentElement.style.setProperty("--font-display", `"${fontName}", "Bahnschrift", sans-serif`);
}

function loadActivity() {
  try {
    state.favorites = new Set(JSON.parse(window.localStorage.getItem("homeLauncherFavorites") ?? "[]"));
  } catch {
    state.favorites = new Set();
  }

  try {
    state.launchStats = JSON.parse(window.localStorage.getItem("homeLauncherLaunchStats") ?? "{}");
  } catch {
    state.launchStats = {};
  }
}

function saveFavorites() {
  window.localStorage.setItem("homeLauncherFavorites", JSON.stringify(Array.from(state.favorites)));
}

function saveLaunchStats() {
  window.localStorage.setItem("homeLauncherLaunchStats", JSON.stringify(state.launchStats));
}

function recordLaunch(entry) {
  const key = getEntryKey(entry);
  const current = state.launchStats[key] ?? {};
  state.launchStats[key] = {
    count: Number(current.count ?? 0) + 1,
    lastLaunchedAt: Date.now()
  };
  saveLaunchStats();
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

function getSearchText(entry) {
  return [
    entry.name,
    entry.description,
    entry.group,
    entry.kind,
    entry.target,
    entry.command,
    entry.cwd,
    entry.sourceFile,
    Array.isArray(entry.tags) ? entry.tags.join(" ") : "",
    Array.isArray(entry.args) ? entry.args.join(" ") : ""
  ]
    .join(" ")
    .toLowerCase();
}

function getFilteredEntries() {
  const query = state.searchQuery.trim().toLowerCase();
  const tag = state.tagFilter.trim().toLowerCase();
  let entries = state.entries;

  if (tag) {
    entries = entries.filter((entry) =>
      Array.isArray(entry.tags) && entry.tags.some((entryTag) => entryTag.toLowerCase() === tag)
    );
  }

  if (!query) {
    return entries;
  }

  return entries.filter((entry) => getSearchText(entry).includes(query));
}

function updateTagFilterOptions() {
  const selected = elements.tagFilter.value;
  const tags = Array.from(
    new Set(state.entries.flatMap((entry) => Array.isArray(entry.tags) ? entry.tags : []))
  ).sort((left, right) => left.localeCompare(right));

  elements.tagFilter.innerHTML = '<option value="">All tags</option>';

  for (const tag of tags) {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    elements.tagFilter.appendChild(option);
  }

  elements.tagFilter.value = tags.includes(selected) ? selected : "";
  state.tagFilter = elements.tagFilter.value;
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
  card.draggable = entry.sourceFile === "apps.json";
  card.dataset.entryId = entry.id;
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

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "launcher-card-delete";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", async (event) => {
    event.stopPropagation();

    try {
      await deleteLauncherCard(entry);
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  const favoriteButton = document.createElement("button");
  favoriteButton.type = "button";
  favoriteButton.className = "launcher-card-favorite";
  const favoriteKey = getEntryKey(entry);
  favoriteButton.textContent = state.favorites.has(favoriteKey) ? "Pinned" : "Pin";
  favoriteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const scrollState = getLauncherScrollState();

    if (state.favorites.has(favoriteKey)) {
      state.favorites.delete(favoriteKey);
      setStatus(`Unpinned ${entry.name}.`, "idle");
    } else {
      state.favorites.add(favoriteKey);
      setStatus(`Pinned ${entry.name}.`, "success");
    }

    saveFavorites();
    renderLauncher();
    restoreLauncherScrollState(scrollState);
  });

  const description = document.createElement("p");
  description.textContent = entry.description || `Launch ${entry.name}.`;

  const meta = document.createElement("div");
  meta.className = "launcher-card-meta";

  for (const value of [getKindLabel(entry.kind), entry.sourceFile, ...(Array.isArray(entry.tags) ? entry.tags : [])]) {
    const pill = document.createElement("span");
    pill.className = "launcher-pill";
    pill.textContent = value;
    meta.appendChild(pill);
  }

  if (Array.isArray(entry.warnings) && entry.warnings.length > 0) {
    const warningPill = document.createElement("span");
    warningPill.className = "launcher-pill warning-pill";
    warningPill.textContent = "warning";
    warningPill.title = entry.warnings.join("\n");
    meta.appendChild(warningPill);
  }

  const actions = document.createElement("div");
  actions.className = "launcher-card-actions";
  actions.append(favoriteButton, editButton);

  const bottomActions = document.createElement("div");
  bottomActions.className = "launcher-card-bottom-actions";
  bottomActions.append(deleteButton);

  card.append(icon, title, actions, description, meta, bottomActions);
  card.addEventListener("dragstart", (event) => {
    if (!card.draggable) {
      return;
    }

    state.draggedEntryId = entry.id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", entry.id);
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => {
    state.draggedEntryId = "";
    card.classList.remove("dragging");
  });
  card.addEventListener("dragover", (event) => {
    if (!state.draggedEntryId || state.draggedEntryId === entry.id || entry.sourceFile !== "apps.json") {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });
  card.addEventListener("drop", async (event) => {
    event.preventDefault();

    if (!state.draggedEntryId || state.draggedEntryId === entry.id) {
      return;
    }

    await reorderDefaultApps(state.draggedEntryId, entry.id);
  });
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
  clearChildren(elements.quickGroups);
  updateConfigPathVisibility();
  const visibleEntries = getFilteredEntries();
  const hasEntries = state.entries.length > 0;
  elements.launcherEmpty.classList.toggle("hidden", visibleEntries.length > 0);

  if (!hasEntries) {
    elements.launcherEmpty.querySelector("strong").textContent = "No launcher apps configured yet.";
    elements.launcherEmpty.querySelector("p").textContent = "Open `/Home/Confg`, add a JSON file, then reload the launcher.";
  } else if (visibleEntries.length === 0) {
    elements.launcherEmpty.querySelector("strong").textContent = "No apps match this search.";
    elements.launcherEmpty.querySelector("p").textContent = "Clear the search or try a different name, group, kind, path, or description.";
  }

  for (const [groupName, entries] of groupEntries(visibleEntries)) {
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

  const statusLines = [];

  if (state.errors.length > 0) {
    statusLines.push("Launcher Config Errors", ...state.errors);
  }

  if (state.warnings.length > 0) {
    statusLines.push("Launcher Config Warnings", ...state.warnings);
  }

  if (statusLines.length > 0) {
    renderResult(elements.launcherStatus, statusLines);
    return;
  }

  hideResult(elements.launcherStatus);
}

function renderQuickGroups(visibleEntries) {
  const byKey = new Map(visibleEntries.map((entry) => [getEntryKey(entry), entry]));
  const favorites = Array.from(state.favorites)
    .map((key) => byKey.get(key))
    .filter(Boolean)
    .slice(0, 8);
  const recent = visibleEntries
    .filter((entry) => state.launchStats[getEntryKey(entry)]?.lastLaunchedAt)
    .sort((left, right) =>
      state.launchStats[getEntryKey(right)].lastLaunchedAt - state.launchStats[getEntryKey(left)].lastLaunchedAt
    )
    .slice(0, 6);
  const mostUsed = visibleEntries
    .filter((entry) => state.launchStats[getEntryKey(entry)]?.count)
    .sort((left, right) =>
      state.launchStats[getEntryKey(right)].count - state.launchStats[getEntryKey(left)].count
    )
    .slice(0, 6);

  for (const [label, entries] of [
    ["Pinned", favorites],
    ["Recent", recent],
    ["Most Used", mostUsed]
  ]) {
    if (entries.length === 0) {
      continue;
    }

    const section = document.createElement("section");
    section.className = "launcher-group quick-group";
    const header = document.createElement("div");
    header.className = "group-header";
    const titleWrap = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = label;
    const sub = document.createElement("p");
    sub.textContent = `${entries.length.toLocaleString()} app${entries.length === 1 ? "" : "s"}`;
    titleWrap.append(title, sub);
    header.appendChild(titleWrap);
    const grid = document.createElement("div");
    grid.className = "launcher-grid";
    entries.forEach((entry) => grid.appendChild(buildLauncherCard(entry)));
    section.append(header, grid);
    elements.quickGroups.appendChild(section);
  }
}

async function reorderDefaultApps(draggedId, targetId) {
  const defaultEntries = state.entries.filter((entry) => entry.sourceFile === "apps.json");
  const draggedIndex = defaultEntries.findIndex((entry) => entry.id === draggedId);
  const targetIndex = defaultEntries.findIndex((entry) => entry.id === targetId);

  if (draggedIndex < 0 || targetIndex < 0) {
    setStatus("Only apps from apps.json can be reordered.", "error");
    return;
  }

  const [moved] = defaultEntries.splice(draggedIndex, 1);
  defaultEntries.splice(targetIndex, 0, moved);

  try {
    setStatus("Saving app order...", "busy");
    await window.homeLauncher.reorderApps({ orderedIds: defaultEntries.map((entry) => entry.id) });
    await loadLauncher(false);
    setStatus("App order updated.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function loadLauncher(showStatus = false) {
  const loadToken = ++state.iconLoadToken;
  const result = await window.homeLauncher.load();
  state.entries = Array.isArray(result.entries) ? result.entries : [];
  state.errors = Array.isArray(result.errors) ? result.errors : [];
  state.warnings = Array.isArray(result.warnings) ? result.warnings : [];
  state.configDir = result.configDir ?? "";
  updateTagFilterOptions();
  renderLauncher();

  if (showStatus) {
    setStatus(
      `Loaded ${state.entries.length.toLocaleString()} launcher app${state.entries.length === 1 ? "" : "s"}.`,
      "success"
    );
  }

  loadLauncherIcons(loadToken);
}

async function loadLauncherIcons(loadToken) {
  if (!window.homeLauncher?.loadIcons) {
    return;
  }

  const entries = state.entries
    .filter((entry) => !entry.iconUrl && !entry.systemIconUrl)
    .map((entry) => ({
      id: entry.id,
      sourceFile: entry.sourceFile,
      sourceIndex: entry.sourceIndex,
      kind: entry.kind,
      target: entry.target,
      command: entry.command,
      iconUrl: entry.iconUrl
    }));

  if (entries.length === 0) {
    return;
  }

  try {
    const icons = await window.homeLauncher.loadIcons(entries);

    if (loadToken !== state.iconLoadToken || !Array.isArray(icons) || icons.length === 0) {
      return;
    }

    const iconsByEntry = new Map(icons.map((icon) => [getEntryIdentity(icon), icon.systemIconUrl]));
    let changed = false;

    state.entries = state.entries.map((entry) => {
      const systemIconUrl = iconsByEntry.get(getEntryIdentity(entry));

      if (!systemIconUrl || entry.systemIconUrl === systemIconUrl) {
        return entry;
      }

      changed = true;
      return { ...entry, systemIconUrl };
    });

    if (changed) {
      const scrollState = getLauncherScrollState();
      renderLauncher();
      restoreLauncherScrollState(scrollState);
    }
  } catch (error) {
    console.warn("System icon loading failed.", error);
  }
}

async function launchEntry(entry) {
  try {
    if (entry.runAsAdmin === true) {
      const confirmed = await confirmAction({
        title: "Administrator Launch",
        message: `Launch ${entry.name} as administrator? Windows may show a UAC prompt.`,
        confirmLabel: "Launch"
      });

      if (!confirmed) {
        setStatus("Administrator launch canceled.", "idle");
        return;
      }
    }

    if (entry.kind === "command") {
      const preview = buildCommandPreview(entry);
      const cwd = entry.cwd ? `Working directory:\n${entry.cwd}` : "";
      const confirmed = await confirmAction({
        title: "Run Command",
        message: `Run this command for ${entry.name}?`,
        detail: cwd ? `${preview}\n\n${cwd}` : preview,
        confirmLabel: "Run"
      });

      if (!confirmed) {
        setStatus("Command launch canceled.", "idle");
        return;
      }
    }

    await window.homeLauncher.openTarget({
      kind: entry.kind,
      target: entry.target,
      command: entry.command,
      args: entry.args,
      cwd: entry.cwd,
      keepOpen: entry.keepOpen,
      consoleWindow: entry.consoleWindow,
      runAsAdmin: entry.runAsAdmin
    });
    recordLaunch(entry);
    renderLauncher();
    setStatus(`Launched ${entry.name}.`, "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function restartWithConfirmation(message) {
  const confirmed = await confirmAction({
    title: "Restart App",
    message,
    confirmLabel: "Restart"
  });

  if (!confirmed) {
    setStatus("Restart canceled.", "idle");
    return false;
  }

  try {
    setStatus("Restarting App Launcher...", "busy");
    await window.homeLauncher.restart();
    return true;
  } catch (error) {
    setStatus(error.message, "error");
    return false;
  }
}

function registerButtons() {
  if (window.homeLauncher?.onRestoredFromTray) {
    window.homeLauncher.onRestoredFromTray(() => {
      state.settings.minimizeToTray = false;
      elements.minimizeToTray.checked = false;
      saveSettings();
      setStatus("Restored from tray.", "idle");
    });
  }

  elements.openConfig.addEventListener("click", async () => {
    try {
      const configDir = await window.homeLauncher.openConfigFolder();
      state.configDir = configDir ?? state.configDir;
      updateConfigPathVisibility();
      setStatus(`Opened ${configDir}.`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.exportConfig.addEventListener("click", async () => {
    try {
      setStatus("Exporting launcher config...", "busy");
      const result = await window.homeLauncher.exportConfig();

      if (!result) {
        setStatus("Config export canceled.", "idle");
        return;
      }

      setStatus(`Exported config to ${result.exportPath}.`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.importConfig.addEventListener("click", async () => {
    const confirmed = await confirmAction({
      title: "Import Config",
      message: "Import a launcher config and replace apps.json? A backup of the current apps.json will be created first.",
      confirmLabel: "Import"
    });

    if (!confirmed) {
      setStatus("Config import canceled.", "idle");
      return;
    }

    try {
      setStatus("Importing launcher config...", "busy");
      const result = await window.homeLauncher.importConfig();

      if (!result) {
        setStatus("Config import canceled.", "idle");
        return;
      }

      await loadLauncher(false);
      setStatus(`Imported ${result.count.toLocaleString()} app${result.count === 1 ? "" : "s"}. Backup saved to ${result.backupPath}.`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.scanFolder.addEventListener("click", async () => {
    try {
      setStatus("Scanning folder...", "busy");
      const result = await window.homeLauncher.scanFolder();

      if (!result) {
        setStatus("Folder scan canceled.", "idle");
        return;
      }

      await loadLauncher(false);
      setStatus(`Added ${result.added.length.toLocaleString()} app${result.added.length === 1 ? "" : "s"} from scan. Skipped ${result.skipped.toLocaleString()}.`, "success");
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

  elements.appSearch.addEventListener("input", () => {
    state.searchQuery = elements.appSearch.value;
    renderLauncher();
  });

  elements.tagFilter.addEventListener("change", () => {
    state.tagFilter = elements.tagFilter.value;
    renderLauncher();
  });

  elements.clearSearch.addEventListener("click", () => {
    elements.appSearch.value = "";
    elements.tagFilter.value = "";
    state.searchQuery = "";
    state.tagFilter = "";
    renderLauncher();
    setStatus("Filters cleared.", "idle");
  });

  elements.toggleCustomize.addEventListener("click", () => {
    showCustomizeView();
  });

  elements.toggleAdvancedEditors.addEventListener("click", () => {
    showAdvancedEditorsView();
  });

  elements.backToLauncher.addEventListener("click", showLauncherView);
  elements.advancedBackToLauncher.addEventListener("click", showLauncherView);
  elements.advancedBackToCustomize.addEventListener("click", showCustomizeView);
  elements.popoutAllEditors.addEventListener("click", async () => {
    if (!state.settings.advancedCustomization) {
      setStatus("Enable Advanced customization in Settings first.", "error");
      return;
    }

    autosaveCustomEditors({ silent: true });

    try {
      await Promise.all([
        window.homeLauncher.openEditorWindow({ kind: "effect" }),
        window.homeLauncher.openEditorWindow({ kind: "html" }),
        window.homeLauncher.openEditorWindow({ kind: "js" })
      ]);
      setStatus("All advanced editors popped out.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.themePreset.addEventListener("change", () => {
    if (elements.themePreset.value === "custom") {
      state.theme = normalizeTheme({ ...state.customTheme, preset: "custom" });
      applyTheme();
      saveTheme();
      setStatus("Restored custom theme.", "success");
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

  elements.customEffectEnabled.addEventListener("change", () => {
    state.customEffect.enabled = elements.customEffectEnabled.checked;
    state.customEffect.css = elements.customEffectCss.value;
    applyCustomEffect();
    saveCustomEffect();
    setStatus(`Custom effect ${state.customEffect.enabled ? "enabled" : "disabled"}.`, "success");
  });

  elements.customEffectCss.addEventListener("input", () => {
    state.customEffect.css = elements.customEffectCss.value;
    saveCustomEffect();
  });

  elements.applyCustomEffect.addEventListener("click", () => {
    state.customEffect.css = elements.customEffectCss.value;
    state.customEffect.enabled = true;
    applyCustomEffect();
    saveCustomEffect();
    setStatus("Custom effect applied.", "success");
  });

  elements.importEffect.addEventListener("click", async () => {
    try {
      const effect = await window.homeLauncher.chooseEffect();

      if (!effect) {
        setStatus("Effect import canceled.", "idle");
        return;
      }

      state.customEffect = normalizeCustomEffect({
        enabled: true,
        css: effect.css,
        name: effect.name
      });
      applyCustomEffect();
      saveCustomEffect();
      setStatus(`Imported effect ${effect.name}.`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.popoutEffect.addEventListener("click", async () => {
    autosaveCustomEditors({ silent: true });

    try {
      await window.homeLauncher.openEditorWindow({ kind: "effect" });
      setStatus("Custom effect editor popped out.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.clearCustomEffect.addEventListener("click", async () => {
    const confirmed = await confirmAction({
      title: "Clear Custom Effect",
      message: "Remove the saved custom effect CSS?",
      confirmLabel: "Clear Effect"
    });

    if (!confirmed) {
      setStatus("Custom effect clear canceled.", "idle");
      return;
    }

    state.customEffect = normalizeCustomEffect({});
    applyCustomEffect();
    saveCustomEffect();
    setStatus("Custom effect cleared.", "idle");
  });

  elements.customHtmlEnabled.addEventListener("change", () => {
    state.customCode.htmlEnabled = elements.customHtmlEnabled.checked;
    state.customCode.html = elements.customHtmlCode.value;
    applyCustomCode({ runJs: false });
    saveCustomCode();
    setStatus(`Embedded HTML ${state.customCode.htmlEnabled ? "enabled" : "disabled"}.`, "success");
  });

  elements.customHtmlCode.addEventListener("input", () => {
    state.customCode.html = elements.customHtmlCode.value;
    saveCustomCode();
  });

  elements.importHtml.addEventListener("click", async () => {
    try {
      const file = await window.homeLauncher.chooseCustomCode({ kind: "html" });

      if (!file) {
        setStatus("HTML import canceled.", "idle");
        return;
      }

      state.customCode.html = file.code;
      state.customCode.htmlName = file.name;
      state.customCode.htmlEnabled = true;
      applyCustomCode({ runJs: false });
      saveCustomCode();
      setStatus(`Imported HTML ${file.name}.`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.popoutHtml.addEventListener("click", async () => {
    autosaveCustomEditors({ silent: true });

    try {
      await window.homeLauncher.openEditorWindow({ kind: "html" });
      setStatus("HTML editor popped out.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.customJsEnabled.addEventListener("change", async () => {
    const enabled = elements.customJsEnabled.checked;

    if (enabled) {
      const confirmed = await confirmAction({
        title: "Enable Custom JavaScript",
        message: "Custom JavaScript can change the launcher page. Only enable code you trust.",
        confirmLabel: "Enable JS"
      });

      if (!confirmed) {
        elements.customJsEnabled.checked = false;
        setStatus("Custom JS enable canceled.", "idle");
        return;
      }
    }

    state.customCode.jsEnabled = enabled;
    state.customCode.js = elements.customJsCode.value;
    applyCustomCode({ runJs: enabled });
    saveCustomCode();
    setStatus(`Embedded JavaScript ${enabled ? "enabled" : "disabled"}.`, "success");
  });

  elements.customJsCode.addEventListener("input", () => {
    state.customCode.js = elements.customJsCode.value;
    saveCustomCode();
  });

  elements.importJs.addEventListener("click", async () => {
    try {
      const file = await window.homeLauncher.chooseCustomCode({ kind: "js" });

      if (!file) {
        setStatus("JS import canceled.", "idle");
        return;
      }

      state.customCode.js = file.code;
      state.customCode.jsName = file.name;
      state.customCode.jsEnabled = false;
      applyCustomCode({ runJs: false });
      saveCustomCode();
      setStatus(`Imported JS ${file.name}. Review it, then enable JavaScript to run it.`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.popoutJs.addEventListener("click", async () => {
    autosaveCustomEditors({ silent: true });

    try {
      await window.homeLauncher.openEditorWindow({ kind: "js" });
      setStatus("JavaScript editor popped out.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.applyCustomCode.addEventListener("click", async () => {
    state.customCode.html = elements.customHtmlCode.value;
    state.customCode.js = elements.customJsCode.value;
    state.customCode.htmlEnabled = elements.customHtmlEnabled.checked;
    state.customCode.jsEnabled = elements.customJsEnabled.checked;

    if (state.customCode.jsEnabled) {
      const confirmed = await confirmAction({
        title: "Run Custom JavaScript",
        message: "Apply and run the embedded JavaScript now?",
        confirmLabel: "Run JS"
      });

      if (!confirmed) {
        setStatus("Custom embed apply canceled.", "idle");
        return;
      }
    }

    applyCustomCode({ runJs: true });
    saveCustomCode();
    setStatus("Advanced embed applied.", "success");
  });

  elements.clearCustomCode.addEventListener("click", async () => {
    const confirmed = await confirmAction({
      title: "Clear Advanced Embed",
      message: "Remove saved embedded HTML and JavaScript?",
      confirmLabel: "Clear Embed"
    });

    if (!confirmed) {
      setStatus("Advanced embed clear canceled.", "idle");
      return;
    }

    state.customCode = normalizeCustomCode({});
    applyCustomCode({ runJs: false });
    saveCustomCode();
    setStatus("Advanced embed cleared.", "idle");
  });

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

  elements.deleteApp.addEventListener("click", async () => {
    try {
      await deleteEditingApp();
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.addAppPanel.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const isEditing = Boolean(state.editingEntry);
      setStatus(isEditing ? "Updating launcher app..." : "Saving launcher app...", "busy");
      const payload = buildAddAppPayload();
      const duplicate = findDuplicateApp(payload);

      if (duplicate) {
        setStatus(`Duplicate app detected: ${duplicate.name} already exists in ${duplicate.sourceFile}.`, "error");
        return;
      }

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
  elements.toggleAdvancedSettingsCompact.addEventListener("click", showAdvancedSettingsView);
  elements.advancedSettingsBackToLauncher.addEventListener("click", showLauncherView);
  elements.advancedSettingsOpenCustomize.addEventListener("click", showCustomizeView);
  elements.advancedSettingsOpenEditors.addEventListener("click", showAdvancedEditorsView);

  elements.restartApp.addEventListener("click", async () => {
    await restartWithConfirmation("Restart App Launcher now?");
  });

  elements.importFont.addEventListener("click", async () => {
    try {
      const font = await window.homeLauncher.chooseFont();

      if (!font) {
        setStatus("Font import canceled.", "idle");
        return;
      }

      state.settings.customFont = font;
      applyCustomFont();
      saveSettings();
      setStatus(`Imported font ${font.name}.`, "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.resetFont.addEventListener("click", async () => {
    const confirmed = await confirmAction({
      title: "Reset Font",
      message: "Reset the launcher font back to the default?",
      confirmLabel: "Reset Font"
    });

    if (!confirmed) {
      setStatus("Font reset canceled.", "idle");
      return;
    }

    state.settings.customFont = null;
    applyCustomFont();
    saveSettings();
    setStatus("Font reset.", "idle");
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

  elements.launchOnStartup.addEventListener("change", () => {
    state.settings.launchOnStartup = elements.launchOnStartup.checked;
    applySettings({ syncWindow: false });
    saveSettings();
    window.homeLauncher.setLaunchOnStartup(state.settings.launchOnStartup)
      .then(() => {
        setStatus(`Launch on startup ${state.settings.launchOnStartup ? "enabled" : "disabled"}.`, "success");
      })
      .catch((error) => {
        elements.launchOnStartup.checked = !state.settings.launchOnStartup;
        state.settings.launchOnStartup = elements.launchOnStartup.checked;
        saveSettings();
        setStatus(error.message, "error");
      });
  });

  elements.minimizeToTray.addEventListener("change", async () => {
    const enabled = elements.minimizeToTray.checked;
    state.settings.minimizeToTray = enabled;
    applySettings({ syncWindow: false });

    if (!enabled) {
      setStatus("Minimize to tray canceled.", "idle");
      saveSettings();
      return;
    }

    try {
      await window.homeLauncher.hideToTray();
      saveSettings();
    } catch (error) {
      state.settings.minimizeToTray = false;
      elements.minimizeToTray.checked = state.settings.minimizeToTray;
      saveSettings();
      setStatus(error.message, "error");
    }
  });

  elements.hideToTray.addEventListener("click", async () => {
    try {
      state.settings.minimizeToTray = true;
      elements.minimizeToTray.checked = true;
      saveSettings();
      await window.homeLauncher.hideToTray();
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  elements.closeToTray.addEventListener("change", () => {
    state.settings.closeToTray = elements.closeToTray.checked;
    applySettings({ syncWindow: false });
    saveSettings();
    setStatus(
      `Close button ${state.settings.closeToTray ? "will hide to tray" : "will quit the app"}.`,
      "success"
    );
  });

  elements.showConfigPath.addEventListener("change", () => {
    state.settings.showConfigPath = elements.showConfigPath.checked;
    applySettings({ syncWindow: false });
    saveSettings();
    setStatus(`Config path ${state.settings.showConfigPath ? "shown" : "hidden"}.`, "success");
  });

  elements.highlightPrimaryButtons.addEventListener("change", () => {
    state.settings.highlightPrimaryButtons = elements.highlightPrimaryButtons.checked;
    applySettings({ syncWindow: false });
    saveSettings();
    setStatus(
      `Primary button highlights ${state.settings.highlightPrimaryButtons ? "enabled" : "disabled"}.`,
      "success"
    );
  });

  elements.advancedCustomization.addEventListener("change", async () => {
    const enabled = elements.advancedCustomization.checked;

    if (enabled) {
      const confirmed = await confirmAction({
        title: "Enable Advanced Customization",
        message: "Advanced customization unlocks embedded HTML and JavaScript. Only use code you trust.",
        confirmLabel: "Enable Advanced"
      });

      if (!confirmed) {
        elements.advancedCustomization.checked = false;
        setStatus("Advanced customization canceled.", "idle");
        return;
      }
    }

    state.settings.advancedCustomization = enabled;
    applySettings({ syncWindow: false });
    applyCustomCode({ runJs: enabled });
    saveSettings();
    updateAdvancedEditorLockState();
    setStatus(`Advanced customization ${enabled ? "enabled" : "disabled"}.`, "success");
  });

  elements.deleteConfirmation.addEventListener("change", () => {
    state.settings.deleteConfirmation = elements.deleteConfirmation.checked;
    saveSettings();
    setStatus(
      `Delete confirmation ${state.settings.deleteConfirmation ? "enabled" : "disabled"}.`,
      "success"
    );
  });

  elements.cardLayout.addEventListener("change", () => {
    if (state.settings.appOrientation === "vertical") {
      applySettings({ syncWindow: false });
      setStatus("Vertical app mode forces the tall launcher layout.", "idle");
      return;
    }

    state.settings.cardLayout = normalizeCardLayout(elements.cardLayout.value);
    applySettings({ syncWindow: false });
    saveSettings();
    setStatus(`Launcher card layout set to ${state.settings.cardLayout}.`, "success");
  });
}

async function initialize() {
  await resetInstalledUiProfileOnce();
  loadSettings();
  loadActivity();
  loadTheme();
  loadCustomEffect();
  loadCustomCode();
  applyTheme();
  applyCustomEffect();
  applySettings({ syncTray: true });
  applyCustomCode({ runJs: state.settings.advancedCustomization });
  setupCodeEditor(elements.customEffectCss, elements.customEffectLines, elements.customEffectHighlight, "css");
  setupCodeEditor(elements.customHtmlCode, elements.customHtmlLines, elements.customHtmlHighlight, "html");
  setupCodeEditor(elements.customJsCode, elements.customJsLines, elements.customJsHighlight, "js");
  showLauncherView();
  updateAddAppForm();
  registerButtons();
  setInterval(() => {
    if (!elements.advancedEditorsView.classList.contains("hidden")) {
      autosaveCustomEditors({ silent: true });
    }
  }, 5000);
  setStatus("Loading launcher apps...", "busy");

  try {
    await loadLauncher(true);
  } catch (error) {
    renderResult(elements.launcherStatus, ["Launcher load error", error.message]);
    setStatus(error.message, "error");
  }
}

initialize();
  renderQuickGroups(visibleEntries);
