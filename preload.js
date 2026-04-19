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
  openConfigFolder: () => invokeHandled("launcher:open-config", {}),
  openTarget: (payload) => invokeHandled("launcher:open-target", payload),
  setWindowOrientation: (orientation) => invokeHandled("window:set-orientation", orientation),
  restart: () => invokeHandled("app:restart", {})
});
