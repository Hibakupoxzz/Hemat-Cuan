const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow;
let tray;

// Deteksi mode development (Vite dev server berjalan di port 5173)
const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load URL berdasarkan mode
if (isDev) {
  mainWindow.loadURL('http://localhost:5173');
} else {
  mainWindow.loadFile(
    path.join(app.getAppPath(), 'renderer-dist/index.html')
  );
  // mainWindow.webContents.openDevTools();
}

  // Sembunyikan ke tray saat ditutup (bukan quit)
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png'); // ← pakai file
  const icon = nativeImage.createFromPath(iconPath);

  tray = new Tray(icon);
  tray.setToolTip('Widget Keuangan');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Tampilkan Widget',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Keluar',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Klik icon tray = toggle show/hide
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

function setupIPC() {
  // Lazy-load database (hanya saat IPC dipanggil)
  const database = require('./database');

  ipcMain.handle('get-transaksi', () => {
    return database.getAll();
  });

  ipcMain.handle('get-ringkasan', () => {
    return database.getRingkasan();
  });

  ipcMain.handle('simpan-transaksi', (_event, data) => {
    return database.insert(data);
  });

  ipcMain.handle('hapus-transaksi', (_event, id) => {
    return database.deleteById(id);
  });

  // ─── Pembayaran Prioritas IPC Handlers ─────────────────────────
  ipcMain.handle('get-cicilan', () => {
    return database.getCicilanWithPriority();
  });

  ipcMain.handle('simpan-cicilan', (_event, data) => {
    return database.insertCicilan(data);
  });

  ipcMain.handle('update-cicilan', (_event, id, data) => {
    return database.updateCicilan(id, data);
  });

  ipcMain.handle('hapus-cicilan', (_event, id) => {
    return database.deleteCicilan(id);
  });

  // ─── Tabungan (Savings Goals) IPC Handlers ────────────────────
  ipcMain.handle('get-tabungan', () => {
    return database.getAllTabungan();
  });

  ipcMain.handle('simpan-tabungan', (_event, data) => {
    return database.insertTabungan(data);
  });

  ipcMain.handle('update-tabungan-nominal', (_event, id, jumlah) => {
    return database.updateTabunganNominal(id, jumlah);
  });

  ipcMain.handle('hapus-tabungan', (_event, id) => {
    return database.deleteTabungan(id);
  });

  // ─── Anggaran (Category Budget) IPC Handlers ──────────────────
  ipcMain.handle('get-anggaran', (_event, bulan, tahun) => {
    return database.getAnggaran(bulan, tahun);
  });

  ipcMain.handle('simpan-anggaran', (_event, data) => {
    return database.upsertAnggaran(data);
  });

  ipcMain.handle('hapus-anggaran', (_event, id) => {
    return database.deleteAnggaran(id);
  });

  // ─── Saldo & Pengeluaran Detail IPC Handlers ──────────────────
  ipcMain.handle('get-saldo-per-aset', () => {
    return database.getSaldoPerAset();
  });

  ipcMain.handle('get-pengeluaran-per-kategori', (_event, bulan, tahun) => {
    return database.getPengeluaranPerKategori(bulan, tahun);
  });

  ipcMain.handle('close-window', () => {
    if (mainWindow) {
      mainWindow.hide();
    }
  });

  ipcMain.handle('resize-window', (_event, width, height) => {
    if (mainWindow) {
      mainWindow.setResizable(true);
      mainWindow.setSize(width, height);
      mainWindow.setResizable(false);
    }
  });
}

// ─── App Lifecycle ───────────────────────────────────────────────

app.whenReady().then(() => {
  setupIPC();
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});
