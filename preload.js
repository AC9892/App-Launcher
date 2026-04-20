const { contextBridge, ipcRenderer } = require("electron");

async function invokeHandled(channel, payload) {
  const response = await ipcRenderer.invoke(channel, payload);

  if (response && response.ok === false) {
    throw new Error(response.error);
  }

  return response && Object.prototype.hasOwnProperty.call(response, "value") ? response.value : response;
}

contextBridge.exposeInMainWorld("homeLauncher", {
  load: () => invokeHandled("launcher:load", {}),
  addApp: (payload) => invokeHandled("launcher:add-app", payload),
  updateApp: (payload) => invokeHandled("launcher:update-app", payload),
  chooseTarget: (payload) => invokeHandled("launcher:choose-target", payload),
  exportConfig: () => invokeHandled("launcher:export-config", {}),
  importConfig: () => invokeHandled("launcher:import-config", {}),
  scanFolder: () => invokeHandled("launcher:scan-folder", {}),
  reorderApps: (payload) => invokeHandled("launcher:reorder-apps", payload),
  chooseFont: () => invokeHandled("launcher:choose-font", {}),
  chooseEffect: () => invokeHandled("launcher:choose-effect", {}),
  chooseCustomCode: (payload) => invokeHandled("launcher:choose-custom-code", payload),
  openEditorWindow: (payload) => invokeHandled("launcher:open-editor-window", payload),
  openConfigFolder: () => invokeHandled("launcher:open-config", {}),
  openTarget: (payload) => invokeHandled("launcher:open-target", payload),
  setLaunchOnStartup: (enabled) => invokeHandled("app:set-launch-on-startup", enabled),
  setTray: (enabled) => invokeHandled("app:set-tray", enabled),
  setWindowOrientation: (orientation) => invokeHandled("window:set-orientation", orientation),
  restart: () => invokeHandled("app:restart", {})
});
