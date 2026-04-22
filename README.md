# App Launcher

Version 1.3.1

App Launcher is a standalone Electron launcher for Windows. It loads configurable app cards from JSON files, supports common launch targets, and includes UI customization plus advanced modding tools.

Join discord to get EXPO versions *Test builds for just random stuff
discord.gg/vjHt6w49eY

## Run From Source

```bash
npm install
npm start
```

## Portable Build

```bash
npm run build:portable
```

The portable Windows folder is created at:

```text
dist/AppLauncher-win32-x64
```
this is the build name *added portable
## Config

Launcher entries are loaded from:

- `Confg/apps.json`
- any other `.json` files inside `Confg`

Use `Confg/apps.sample.json` as a clean example config. See `Confg/README.md` for the full file format.

Supported launcher kinds:

- `executable`
- `file`
- `folder`
- `url`
- `command`

Optional launcher fields include `description`, `group`, `tags`, `icon`, `iconPath`, `accent`, and `runAsAdmin`.

## Features

- Add, edit, delete, pin, and reorder launcher entries from the UI.
- Delete apps from each app card or from the edit form.
- Optional delete confirmation in Settings.
- Import, export, and scan folders into `apps.json`.
- Detect duplicate app entries and warn about missing local paths.
- Search apps by name, group, kind, path, description, and tags.
- Track pinned, recent, and most-used apps locally.
- Launch executable and command entries as administrator when enabled.
- Customize colors, effects, gradients, layout, and fonts.
- Advanced CSS, HTML, and JavaScript editors with line numbers, syntax colors, autosave, imports, and pop-out windows.
- Tray support:
  - Closing the window always hides to tray.
  - `Minimize to tray` hides immediately and resets when restored.
  - Tray menu can reopen or quit the app.
- App icon support from `Confg/AppIcon.png` or `Confg/AppIcon.ico`.

## Advanced Modding

See `ADV_MODDING_TUTORIAL.md` for examples.
See `ADV_EDITOR_CLASSES.md` for selectors, body state classes, theme variables, and editor token classes.

## Clean Release Notes

For public releases, keep `Confg/apps.json` empty or machine-neutral. Do not commit `node_modules`, `dist`, or personal app paths.
