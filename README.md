## Will Upload new files tomorrow

# App Launcher



## Run

```bash
npm install
npm start
```

## Portable Build

```bash
npm run build:portable
```

The portable Windows folder is created at `dist/AppLauncher-win32-x64`.

## Config

Launcher entries are loaded from:

- `/Home/Confg/apps.json`
- any other `.json` files inside `/Home/Confg`

See `/Home/Confg/README.md` for the file format.
Use `/Home/Confg/apps.sample.json` as a clean example config.

Supported launcher kinds: 

- `executable`
- `file`
- `folder`
- `url`
- `command`

Optional launcher fields include `description`, `group`, `tags`, `icon`, `iconPath`, and `accent`.
Executable and command entries can also set `runAsAdmin`.

## Features

- Add and edit launcher entries from the UI.
- Import, export, and scan folders into `apps.json`.
- Drag apps from `apps.json` to reorder them.
- Pin apps and track recent / most-used launches locally.
- Filter apps by search text and tags.
- Customize colors, effects, layout, and imported fonts.
- Toggle launch-on-startup and minimize-to-tray in Settings.
- Launch executable and command entries as administrator when enabled.
