# Home Launcher Config

Use the Home launcher app's **Add App** button for the easiest setup. It writes new entries to `apps.json` in this folder.

Use the **Edit** button on an existing launcher card to update the JSON entry it came from.

The original manual method still works: add one or more `.json` files to this folder.

Use `apps.sample.json` for a clean example that avoids local machine-specific paths. The sample file is ignored by the live launcher.

Each file can be either:

```json
{
  "apps": [
    {
      "name": "Notepad",
      "kind": "executable",
      "target": "C:\\Windows\\System32\\notepad.exe",
      "tags": ["tools", "windows"],
      "runAsAdmin": false,
      "iconPath": "C:\\Path\\To\\notepad.png",
      "description": "Open Notepad"
    },
    {
      "name": "Project Folder",
      "kind": "folder",
      "target": "..",
      "description": "Open the Home app folder"
    },
    {
      "name": "Example Electron App",
      "kind": "command",
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "node_modules\\electron\\cli.js",
        "."
      ],
      "cwd": "..\\..\\ExampleApp",
      "consoleWindow": "hidden",
      "description": "Open an Electron app"
    },
    {
      "name": "OpenAI",
      "kind": "url",
      "target": "https://openai.com",
      "description": "Open a website"
    }
  ]
}
```

Supported `kind` values:

- `executable`
- `file`
- `folder`
- `url`
- `command`

Relative `file`, `folder`, and `command.cwd` targets are resolved from this `/Home/Confg` folder.

Optional icon fields:

- `iconPath` points to an image file, such as `.ico`, `.png`, `.jpg`, `.webp`, `.gif`, or `.svg`.
- `icon` is fallback text shown when no `iconPath` is set or the icon image cannot load.
- The app editor's Icon image picker writes `iconPath` and overrides the default generated initials.
- If `iconPath` is empty, Home tries to use the target file, folder, executable, or absolute command's system icon automatically.

Optional organization fields:

- `group` controls which launcher group the app appears in.
- `tags` can be an array like `["tools", "work"]` or a comma-separated string. Tags power the tag filter.
- Entries in `apps.json` can be reordered by dragging cards in the UI.

Optional launch fields:

- `runAsAdmin: true` launches executable and command entries through Windows elevation. Windows may show a UAC prompt.

For `kind: "command"`:

- `command` is the program to run, such as `node`, `npm.cmd`, or `powershell`.
- `args` is an array of command arguments.
- `cwd` is optional and controls the working directory.
- `keepOpen: true` keeps the console window open after the command finishes.
- `consoleWindow` can be `normal`, `minimized`, or `hidden`.
