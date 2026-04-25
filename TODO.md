# App Launcher TODO / Handoff

This file is for project handoff notes only. It is not connected to the launcher UI.

## Current App State

- Version is `1.3.1`.
- Standalone Electron app launcher lives in the project folder.
- App entries load from `Confg/apps.json` and other JSON files in `Confg`.
- Supports launching executables, files, folders, URLs, and commands.
- Supports adding, editing, deleting, pinning, and reordering apps from the UI.
- Supports delete buttons on app cards and in the edit form.
- Supports optional delete confirmation in Settings.
- Supports optional custom icons through `iconPath`.
- Uses `Confg/AppIcon.ico` or `Confg/AppIcon.png` for app/tray/window icon when present.
- Falls back to default/system icons when no custom icon is set.
- Includes Settings with layout/orientation controls.
- Includes a separate Customize UI view for colors, gradients, effects, and Advanced Editors.
- Theme customization is saved locally in browser storage.
- Includes search/filter for larger app lists.
- Includes config import/export backup controls.
- Includes a clean sample config at `Confg/apps.sample.json`.
- Includes a lightweight portable build command.
- Includes drag-and-drop reordering for apps from `apps.json`.
- Includes pinned, recent, and most-used launcher sections.
- Includes launch-on-startup.
- Closing the window always hides to tray; tray menu can reopen or quit.
- `Minimize to tray` hides immediately and does not persist after restart.
- Includes folder scanning to auto-add launcher entries.
- Includes custom font import/reset support.
- Includes tags and tag filtering.
- Includes a Run as administrator toggle for executable and command entries.
- Includes Advanced CSS, HTML, and JavaScript editors with line numbers, syntax colors, pop-outs, imports, and autosave.
- Includes `ADV_MODDING_TUTORIAL.md`.

## Before Publishing

- Keep `Confg/apps.json` empty or machine-neutral in the clean backup.
- Avoid committing `node_modules/`, `dist/`, or `dist-installer/`.
- Avoid committing personal app entries or local machine-specific paths.
- Use the clean backup folder for public GitHub source.
- Keep experimental work in `Applauncher Expo` until it is approved for the main release.
- Copy Expo features into `AppLauncher Bak` only when they are stable enough for GitHub/release builds.

## Project Folders

- `Home`: raw personal working copy.
- `AppLauncher Bak`: clean release/GitHub source.
- `Applauncher Expo`: experimental dev/test build for ideas that may or may not ship.

## Known Notes

- The app does not need Node.js when using a packaged portable build.
- Running from source still needs `npm install` and `npm start`.
- Windows may cache old taskbar/explorer icons until its icon cache refreshes.
- Custom `iconPath` overrides the default/system icon on launcher cards.
- Layout orientation changes live and should not need an app restart.
- Windows installers show an unknown publisher warning unless signed with a trusted certificate.

## Useful Commands

```powershell
npm install
npm start
npm test
npm run build:portable
```

## Next Improvements

- Manual UI testing pass for drag-and-drop ordering, tray behavior, startup registration, font import, folder scanning, delete flows, and advanced editors on the target machine.
- Decide whether drag-and-drop should support non-default JSON files, not only `apps.json`.
- Decide whether folder scanning should recurse deeper than two levels.
- Add a real `.ico` file for the packaged executable icon if needed.
- Decide whether to keep a separate installable build script in the public source.

## Will Add

- Streamer Mode: detect when a recording app is recording, automatically hide personal paths including the `Confg` path, and replace them with text such as `Streamer mode is active`.

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
- Added launch-on-startup.
- Added always-on close-to-tray behavior.
- Added immediate minimize-to-tray behavior with reset-on-restore.
- Added folder scanning to auto-add apps.
- Added custom font import/reset support.
- Added tags and tag filtering.
- Added a Run as administrator toggle for executable and command launchers.
- Added app deletion from cards and the edit form.
- Added delete confirmation setting.
- Added scroll preservation after card deletion.
- Added Advanced Editors for custom CSS, HTML, and JavaScript.
- Added editor imports, pop-outs, pop-out-all, autosave, word wrap, line numbers, and syntax highlighting.
- Added custom GUI confirmation popups.
- Added theme preset custom color persistence.
- Added `Confg/AppIcon.png` / `Confg/AppIcon.ico` runtime icon support.
- Updated package version to `1.3.1`.

## Later Ideas

- Add stronger dangerous-command detection.
- Add a plugin system.
- Add folders, profiles, or another way to organize app groups. This could be built into the launcher or exposed later through plugin support.
- Add a minimal mode or overlay mode.
- Explore an Elgato-style grid layout with box-based launcher tiles.
- Use `Applauncher Expo` for Dev/Test builds and experimental ideas before deciding whether they belong in the main release.
- Add an auto-updater or update notification system.
- Add signed installer packaging.
- Add a generated `.ico` build asset from `Confg/AppIcon.png`.

## Testing Checklist

- Start the app with `npm start`.
- Add an executable app through the UI.
- Add a command app through the UI.
- Edit an existing app and verify `Confg/apps.json` updates correctly.
- Delete an app from its card and from the edit form.
- Test delete confirmation on and off.
- Test custom `iconPath`.
- Test fallback icon behavior with no `iconPath`.
- Search for apps by name, group, kind, path, and description.
- Filter apps by tag.
- Pin and unpin apps.
- Launch apps and verify Recent / Most Used sections update.
- Drag apps from `apps.json` into a new order and reload.
- Scan a folder containing `.exe`, `.lnk`, `.url`, `.bat`, or `.cmd` files.
- Import and reset a custom font.
- Toggle launch-on-startup.
- Close the window and confirm it hides to tray.
- Use `Minimize to tray` and confirm it hides immediately and unchecks after restore.
- Add or edit an executable/command entry with Run as administrator enabled and confirm Windows shows the expected UAC prompt.
- Import and export launcher config.
- Switch vertical/horizontal orientation.
- Open Customize UI, change colors, then reset back to defaults.
- Test custom CSS, HTML, and JavaScript editors.
- Run `npm test`.
- Run `npm run build:portable`.
