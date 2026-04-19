# Home Launcher

This is a standalone Electron app launcher. It is separate from the ANTC app under `/App`.

## Run

```bash
npm install
npm start
```

## Config

Launcher entries are loaded from:

- `/Home/Confg/apps.json`
- any other `.json` files inside `/Home/Confg`

See `/Home/Confg/README.md` for the file format.

Supported launcher kinds:

- `executable`
- `file`
- `folder`
- `url`
- `command`
