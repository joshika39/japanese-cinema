const { app, BrowserWindow } = require("electron");
const path = require("path");

const {
    PUBLIC_DIRECTORY,
    writeAssetManifest,
} = require("../node-js/asset-manifest");

let mainWindow;

function createWindow() {
    writeAssetManifest();

    mainWindow = new BrowserWindow({
        width: 800,
        height: 550,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });
    mainWindow.removeMenu();
    mainWindow.maximize();
    mainWindow.setFullScreen(true);
    mainWindow.loadFile(path.join(PUBLIC_DIRECTORY, "index.html"));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
