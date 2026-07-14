const { contextBridge, ipcRenderer } = require('electron');

/**
 * ContextBridge API
 * Mengekspos fungsi yang aman untuk dipanggil dari React (renderer process).
 * Akses dari React: window.api.getTransaksi(), dst.
 */
contextBridge.exposeInMainWorld('api', {
  getTransaksi: () => ipcRenderer.invoke('get-transaksi'),
  getRingkasan: () => ipcRenderer.invoke('get-ringkasan'),

  simpanTransaksi: (data) => ipcRenderer.invoke('simpan-transaksi', data),
  hapusTransaksi: (id) => ipcRenderer.invoke('hapus-transaksi', id),

  // ─── Pembayaran Prioritas (Tagihan Rutin) API ─────────────────────
  getCicilan: () => ipcRenderer.invoke('get-cicilan'),
  simpanCicilan: (data) => ipcRenderer.invoke('simpan-cicilan', data),
  updateCicilan: (id, data) => ipcRenderer.invoke('update-cicilan', id, data),
  hapusCicilan: (id) => ipcRenderer.invoke('hapus-cicilan', id),

  // ─── Tabungan (Savings Goals) API ─────────────────────────────────
  getTabungan: () => ipcRenderer.invoke('get-tabungan'),
  simpanTabungan: (data) => ipcRenderer.invoke('simpan-tabungan', data),
  updateTabunganNominal: (id, jumlah) => ipcRenderer.invoke('update-tabungan-nominal', id, jumlah),
  hapusTabungan: (id) => ipcRenderer.invoke('hapus-tabungan', id),

  // ─── Anggaran (Category Budget) API ───────────────────────────────
  getAnggaran: (bulan, tahun) => ipcRenderer.invoke('get-anggaran', bulan, tahun),
  simpanAnggaran: (data) => ipcRenderer.invoke('simpan-anggaran', data),
  hapusAnggaran: (id) => ipcRenderer.invoke('hapus-anggaran', id),

  // ─── Saldo & Pengeluaran Detail API ───────────────────────────────
  getSaldoPerAset: () => ipcRenderer.invoke('get-saldo-per-aset'),
  getPengeluaranPerKategori: (bulan, tahun) => ipcRenderer.invoke('get-pengeluaran-per-kategori', bulan, tahun),

  closeWindow: () => ipcRenderer.invoke('close-window'),
  resizeWindow: (width, height) => ipcRenderer.invoke('resize-window', width, height),
});
