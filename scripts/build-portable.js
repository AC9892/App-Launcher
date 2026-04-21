const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const electronDist = path.join(rootDir, "node_modules", "electron", "dist");
const outputDir = path.join(rootDir, "dist", "AppLauncher-win32-x64");
const appDir = path.join(outputDir, "resources", "app");
const appFiles = [
  "Confg",
  "ADV_EDITOR_CLASSES.md",
  "ADV_MODDING_TUTORIAL.md",
  "index.html",
  "main.js",
  "package.json",
  "preload.js",
  "README.md",
  "renderer.js",
  "src",
  "styles.css"
];

function copyItem(source, target) {
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    fs.cpSync(source, target, {
      recursive: true,
      filter: (item) => {
        const name = path.basename(item).toLowerCase();
        return !name.endsWith(".bak");
      }
    });
    return;
  }

  fs.copyFileSync(source, target);
}

if (!fs.existsSync(electronDist)) {
  throw new Error("Electron is not installed. Run npm install before npm run build:portable.");
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(appDir, { recursive: true });
fs.cpSync(electronDist, outputDir, { recursive: true });

for (const fileName of appFiles) {
  copyItem(path.join(rootDir, fileName), path.join(appDir, fileName));
}

const electronExe = path.join(outputDir, "electron.exe");
const launcherExe = path.join(outputDir, "App Launcher.exe");

if (fs.existsSync(electronExe)) {
  fs.renameSync(electronExe, launcherExe);
}

fs.writeFileSync(path.join(outputDir, ".portable-profile"), "App Launcher portable profile\n");

console.log(`Portable build created at ${outputDir}`);
