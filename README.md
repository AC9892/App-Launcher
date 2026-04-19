# App Launcher


## Run

```bash
npm install
npm start
```

## Config

Launcher entries are loaded from:

- `/AppLauncher-clean-win32-x64/Confg/apps.json`
- any other `.json` files inside `/Home/Confg`

See `/AppLauncher-clean-win32-x64/Confg/README.md` for the file format.

Supported launcher kinds:

- `executable`
- `file`
- `folder`
- `url`
- `command`
