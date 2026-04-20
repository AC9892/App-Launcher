# Home App TODO / Handoff

This file is for project handoff notes only. It is not connected to the launcher UI.

## Current App State

- Standalone Electron app launcher lives in `Home/`.
- App entries are loaded from `Home/Confg/apps.json`.
- Supports launching executables, files, folders, URLs, and commands.
- Supports adding apps from the UI while still keeping manual JSON editing available.
- Supports editing existing app entries from the UI.
- Supports optional custom icons through `iconPath`.
- Falls back to default/system icons when no custom icon is set.
- Includes Settings with layout/orientation controls.
- Includes a separate Customize UI view for colors, gradients, and effects.
- Theme customization is saved locally in browser storage.
- Includes search/filter for larger app lists.
- Includes config import/export backup controls.
- Includes a clean sample config at `Home/Confg/apps.sample.json`.
- Includes a lightweight portable build command.
- Includes drag-and-drop reordering for apps from `apps.json`.
- Includes pinned, recent, and most-used launcher sections.
- Includes optional launch-on-startup and minimize-to-tray settings.
- Includes folder scanning to auto-add launcher entries.
- Includes custom font import/reset support.
- Includes tags and tag filtering.
- Includes a Run as administrator toggle for executable and command entries.

## Before Moving To A New Thread

- Keep this file updated with anything unfinished.
- Mention that `Home/Confg/apps.json` may contain local machine-specific app paths.
- Use `AppLauncher/` for the clean GitHub-ready copy.
- Avoid committing `node_modules/`.
- Avoid committing personal `Confg/apps.json` entries unless intentionally sharing examples.

## Known Notes

- The app does not need Node.js when using a packaged portable build.
- Running from source still needs `npm install` and `npm start`.
- System icons can be cached by Windows, so old icons may persist until Explorer/taskbar cache refreshes.
- Custom `iconPath` overrides the default/system icon.
- Layout orientation changes live and should not need an app restart.

## Useful Commands

```powershell
npm install
npm start
npm test
npm run build:portable
```

Run commands from:

```text
C:\Users\bryce\Documents\WebBased\App Launcher\Home
```

## Next Improvements

- Manual UI testing pass for drag-and-drop ordering, tray behavior, startup registration, font import, and folder scanning on the target machine.
- Decide whether drag-and-drop should support non-default JSON files, not only `apps.json`.
- Decide whether folder scanning should recurse deeper than two levels.

## Completed Improvements

- Added import/export buttons for launcher config backups.
- Added validation warnings for missing executable/file/folder paths.
- Added duplicate app detection in the app editor and config writer.
- Added a command preview confirmation before launching `kind: "command"` entries.
- Added search/filter for larger app lists.
- Added a lightweight portable release creation script.
- Added a clean sample config file separate from the user's real config.
- Added drag-and-drop app reordering for entries in `apps.json`.
- Added pinned, recent, and most-used launcher sections.
- Added optional launch-on-startup and minimize-to-tray settings.
- Added folder scanning to auto-add apps.
- Added custom font import/reset support.
- Added tags and tag filtering.
- Added a Run as administrator toggle for executable and command launchers.

## Later Ideas

- Add stronger dangerous-command detection.
- Add a plugin system.

## Testing Checklist

- Start the app with `npm start`.
- Add an executable app through the UI.
- Add a command app through the UI.
- Edit an existing app and verify `Home/Confg/apps.json` updates correctly.
- Test custom `iconPath`.
- Test fallback icon behavior with no `iconPath`.
- Search for apps by name, group, kind, path, and description.
- Filter apps by tag.
- Pin and unpin apps.
- Launch apps and verify Recent / Most Used sections update.
- Drag apps from `apps.json` into a new order and reload.
- Scan a folder containing `.exe`, `.lnk`, `.url`, `.bat`, or `.cmd` files.
- Import and reset a custom font.
- Toggle launch-on-startup and minimize-to-tray.
- Add or edit an executable/command entry with Run as administrator enabled and confirm Windows shows the expected UAC prompt.
- Import and export launcher config.
- Switch vertical/horizontal orientation.
- Open Customize UI, change colors, then reset back to defaults.
- Run `npm test`.
- Run `npm run build:portable`.
