# App Launcher


## Run

```bash
cd "Downloads\AppLauncher-clean-win32-x64"
```
Or what ever the path is *right click & copy as path or Ctrl + Shift + C
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
