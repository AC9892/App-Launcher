# App Launcher

Version `1.3.1`

App Launcher is a Windows-focused Electron launcher for desktop apps, files, folders, websites, and custom commands. It is designed to be usable as a simple launcher out of the box, but it also supports deeper UI customization, advanced embedded styling/code, and a portable build workflow.

## Repository Layout

- `Home`
  Raw personal working copy. This is where active local debugging and day-to-day changes may happen first. - this is what i use
- `AppLauncher Bak`
  Clean source copy intended for release prep and GitHub. Keep this folder free of personal app entries, personal machine paths, generated runtime state, `node_modules`, and build output.
- `Applauncher Expo`
  Canary or experimental branch for testing ideas before they are accepted into the cleaner main copy.

## What The App Does

App Launcher loads launcher entries from JSON files in `Confg/`, groups them into cards, and lets you launch or manage them from the UI.

Supported launch target types:

- `executable`
- `file`
- `folder`
- `url`
- `command`

Typical use cases:

- launch installed desktop apps
- open project folders and documents
- open websites
- run scripts, CLIs, or Electron apps through command launchers
- organize apps into groups and tags

## Main Features

- Add, edit, delete, pin, and reorder launcher entries in the UI.
- Load launcher cards from `apps.json` and additional JSON files in `Confg/`.
- Import and export config backups.
- Scan folders for `.exe`, `.lnk`, `.url`, `.bat`, and `.cmd` launcher targets.
- Detect duplicate entries before saving.
- Warn about missing local file and folder targets without blocking the rest of the launcher.
- Search across name, description, tags, groups, kind, and path fields.
- Track pinned items, recent launches, and usage stats in local browser storage.
- Launch executable and command entries as administrator when enabled.
- Use custom icon files or fall back to generated initials and Windows system icons.
- Support tray behavior, close-to-tray behavior, and launch-on-startup toggles.
- Support UI customization including colors, gradients, effects, layout, and imported fonts.
- Provide advanced CSS, HTML, and JavaScript editors with autosave and pop-out windows.

## Source Setup

Requirements:

- [Node.js](https://nodejs.org/en/download) `18+`

Install and run:

```bash
npm install
npm start
```

Run tests:

```bash
npm test
```

## Portable Build

Create a portable Windows build:

```bash
npm run build:portable
```

Build output:

```text
dist/AppLauncher-win32-x64
```

The portable build writes a `.portable-profile` marker into the output folder. When that marker exists in a packaged build, the app redirects its Electron `userData` path into a local `UserData` folder beside the executable.

## Configuration

Launcher config files live in:

- `Confg/apps.json`
- any additional `.json` files inside `Confg/`

The launcher bootstraps this folder automatically if required. The clean example config lives in:

- `Confg/apps.sample.json`

Detailed config format documentation is in:

- `Confg/README.md`

Public or GitHub-ready copies should keep `Confg/apps.json` empty or machine-neutral.

## Launcher Entry Fields

Common supported fields include:

- `name`
- `kind`
- `target`
- `description`
- `group`
- `tags`
- `icon`
- `iconPath`
- `accent`
- `runAsAdmin`

Command entries additionally support:

- `command`
- `args`
- `cwd`
- `keepOpen`
- `consoleWindow`

Relative `file`, `folder`, and `command.cwd` values are resolved from the JSON file’s folder under `Confg/`.

## Customization And Advanced Editing

The launcher stores its UI preferences and advanced editor data in browser storage rather than in repository config files. That includes:

- theme colors
- card layout
- tray-related toggles
- imported font selection
- custom effect CSS
- embedded HTML
- embedded JavaScript
- launch stats and pinned state

Advanced editor references:

- `ADV_MODDING_TUTORIAL.md`
- `ADV_EDITOR_CLASSES.md`

These advanced tools are intended for trusted local customization. They are useful for theme work, layout changes, animated effects, and embedded interface extensions.

## Temp Debug Logging

This source copy includes a temp-debug logger in `main.js` for tracking actions that may create temporary directories or runtime artifacts.

Log file:

- `Confg/temp-debug.log`

What it records:

- app startup and shutdown
- window creation
- system icon extraction calls
- native file and save dialogs
- launched child processes

This log is intended for debugging local runtime behavior. It should not be committed with session data. The Bak copy currently keeps the logging feature in code, but the actual log file itself should remain absent from source control.

## Test Temp Folder Cleanup

The test suite creates temporary launcher roots during execution. It has been updated to:

- create test temp folders under a single parent temp directory
- clean those folders after the test run
- remove the shared parent temp directory afterward

This prevents `%TEMP%` from filling up with large numbers of `home-launcher-*` folders during repeated test runs.


- `AppLauncher Bak` is the GitHub-ready source target.
- `Applauncher Expo` is intentionally experimental and should not be treated as the clean release source by default.
- `Home` may contain local debugging additions that are useful during development but should be reviewed before promotion into Bak.
