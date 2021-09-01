const { app, BrowserWindow, Menu, Tray, dialog } = require('electron');
const path = require('path');
const ipcMain = require('electron').ipcMain;

let tray = null;
let win = null;
let quiting = false;

app.setAboutPanelOptions({
    applicationName: '20Kural',
    applicationVersion: 'v1.0',
    authors: ['İsa Eken'],
    copyright: 'İsa Eken',
    iconPath: path.join(__dirname, '/icon.png'),
    website: 'https://github.com/isaeken/20kural'
});
app.setName('20Kural');

function createWindow() {
    win = new BrowserWindow({
        width: 400,
        minWidth: 400,
        maxWidth: 400,
        height: 690,
        minHeight: 690,
        maxHeight: 690,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        titleBarStyle: 'hidden',
    });

    win.loadFile('./src/index.html');

    win.on('minimize',function (event) {
        event.preventDefault();
        win.hide();
    });

    win.on('close', function (event) {
        if(!quiting) {
            event.preventDefault();
            win.hide();
        }

        return false;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    tray = new Tray(path.join(__dirname, '/icon.png'));
    tray.setToolTip('20Kural');
    tray.on('click', function (e) {
        win.show();
    });
    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: 'Göster',
            click() {
                win.show();
            }
        },
        {
            label: 'Yardım',
            click() {
                let about = new BrowserWindow({
                    width: 640,
                    height: 420,
                    maximizable: false,
                });
                about.loadFile('./src/about.html');
                about.show();
            }
        },
        {
            label: 'Uygulamayı Kapat',
            click() {
                quiting = true;
                app.quit();
            }
        },
    ]));
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('hide', function () {
    win.hide();
});

ipcMain.on('alert', function () {
    win.show();
    dialog.showMessageBox({
        title: 'Ekrana bakma zamanın doldu.',
        message: 'Ekrana bakma zamanın doldu. Lütfen mola ver.',
    });
});

ipcMain.on('open_at_login', function () {
    const appFolder = path.dirname(process.execPath)
    const updateExe = path.resolve(appFolder, '..', 'Update.exe')
    const exeName = path.basename(process.execPath)

    app.setLoginItemSettings({
        openAtLogin: true,
        path: updateExe,
        args: [
            '--processStart', `"${exeName}"`,
            '--process-start-args', `"--hidden"`
        ]
    })

    dialog.showMessageBox({
        message: 'Uygulama başlangıçta çalıştırılması için ayarlandı.',
    });
});
