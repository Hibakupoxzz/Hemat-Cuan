import { createRoot } from 'react-dom/client';
import App from './App';
import '../style.css';

// Mock API for previewing/debugging in a web browser
if (typeof window !== 'undefined' && !window.api) {
  window.api = {
    getTransaksi: async () => [
      { id: 1, jenis: 'pemasukan', nominal: 5000000, kategori: 'Gaji', aset: 'tunai', prioritas: null, keterangan: 'Gaji Bulanan', tanggal: new Date().toISOString() },
      { id: 2, jenis: 'pengeluaran', nominal: 150000, kategori: 'Makanan', aset: 'tunai', prioritas: 'rendah', keterangan: 'Makan Siang Bersama Teman Kerja', tanggal: new Date().toISOString() },
      { id: 3, jenis: 'pengeluaran', nominal: 2500000, kategori: 'Hiburan', aset: 'kartu', prioritas: 'sedang', keterangan: 'Beli Konsol Game Baru', tanggal: new Date().toISOString() }
    ],
    getRingkasan: async () => ({
      pemasukan: 5000000,
      pengeluaran: 2650000,
      saldo: 2350000
    }),
    getCicilan: async () => [
      { id: 1, nama: 'Tagihan Listrik', nominal: 350000, tanggal_jatuh_tempo: 20, bulan_jatuh_tempo: new Date().getMonth() + 1, tahun_jatuh_tempo: new Date().getFullYear(), kategori: 'Tagihan', keterangan: 'Listrik Rumah', prioritas: 'sedang', sisaHari: 4, labelPrioritas: '4 hari lagi' },
      { id: 2, nama: 'Tagihan Internet', nominal: 400000, tanggal_jatuh_tempo: 25, bulan_jatuh_tempo: new Date().getMonth() + 1, tahun_jatuh_tempo: new Date().getFullYear(), kategori: 'Tagihan', keterangan: 'Biznet Home', prioritas: 'rendah', sisaHari: 9, labelPrioritas: '9 hari lagi' }
    ],
    getTabungan: async () => [
      { id: 1, nama: 'Beli Laptop', target_nominal: 15000000, terkumpul: 8500000, emoji: '💻', created_at: new Date().toISOString() }
    ],
    getAnggaran: async () => [
      { id: 1, kategori: 'Makanan', batas: 2000000, bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear() },
      { id: 2, kategori: 'Hiburan', batas: 3000000, bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear() }
    ],
    getSaldoPerAset: async () => ({
      tunai: 4850000,
      kartu: -2500000,
      'e-wallet': 0
    }),
    getPengeluaranPerKategori: async () => ({
      'Makanan': 150000,
      'Hiburan': 2500000
    }),
    simpanTransaksi: async (data) => console.log('Mock Save Transaksi:', data),
    hapusTransaksi: async (id) => console.log('Mock Delete Transaksi:', id),
    simpanCicilan: async (data) => console.log('Mock Save Cicilan:', data),
    updateCicilan: async (id, data) => console.log('Mock Update Cicilan:', id, data),
    hapusCicilan: async (id) => console.log('Mock Delete Cicilan:', id),
    simpanTabungan: async (data) => console.log('Mock Save Tabungan:', data),
    updateTabunganNominal: async (id, val) => console.log('Mock Update Tabungan Nominal:', id, val),
    hapusTabungan: async (id) => console.log('Mock Delete Tabungan:', id),
    simpanAnggaran: async (data) => console.log('Mock Save Anggaran:', data),
    hapusAnggaran: async (id) => console.log('Mock Delete Anggaran:', id),
    closeWindow: () => console.log('Mock Close Window'),
    resizeWindow: (w, h) => console.log('Mock Resize Window to', w, h)
  };
}

const rootEl = document.getElementById('root');

if (rootEl) {
  createRoot(rootEl).render(<App />);
}

