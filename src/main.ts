// Modules to control application life and create native browser windows
import { app, BrowserWindow, Menu, MenuItem } from "electron";

app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

let mainWindow: BrowserWindow;

const menu = new Menu();

menu.append(
    new MenuItem({
        label: "Play/Pause",
        accelerator: "space",
        click: () => {
            mainWindow.webContents.send("playpause");
        },
    }),
);

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        titleBarStyle: "hidden",
        webPreferences: {
            nodeIntegration: true,
        },
    });

    // Menu.setApplicationMenu(menu);
    mainWindow.setMenuBarVisibility(false);

    mainWindow.loadFile("dist/player.html");

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.on("ready", async () => {
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (mainWindow == null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
