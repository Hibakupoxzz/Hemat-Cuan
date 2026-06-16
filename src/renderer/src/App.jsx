import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  ChevronLeft, 
  MoreHorizontal, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  CreditCard, 
  Banknote,
  Trash2,
  Minimize2,
  Maximize2,
  CalendarClock,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Edit3,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Lightbulb,
  BarChart3,
  Award,
  Percent,
  PiggyBank,
  Target,
  Eye,
  EyeOff,
  Users,
  Receipt,
  Coins,
  Sparkles,
  DollarSign,
  Minus
} from 'lucide-react';

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const EMOJI_OPTIONS = ['🐷', '🎯', '💰', '🏠', '🎓', '📱', '✈️', '🎮', '🛒', '💎', '🚗', '📚'];

export default function App() {
  const [view, setView] = useState('dashboard');
  const [transaksiList, setTransaksiList] = useState([]);
  const [ringkasan, setRingkasan] = useState({ pemasukan: 0, pengeluaran: 0, saldo: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [pembayaranList, setPembayaranList] = useState([]);
  const [showPembayaranForm, setShowPembayaranForm] = useState(false);
  const [editingPembayaran, setEditingPembayaran] = useState(null);

  const DEFAULT_KATEGORI = ['Umum', 'Makanan', 'Transportasi', 'Kesehatan', 'Belanja', 'Hiburan', 'Gaji', 'Bonus', 'Investasi'];
  const [customKategori, setCustomKategori] = useState([]);
  const [showAddKategori, setShowAddKategori] = useState(false);
  const [newKategori, setNewKategori] = useState('');
  const allKategori = [...DEFAULT_KATEGORI, ...customKategori];

  // Form State - Transaksi
  const [formData, setFormData] = useState({
    nominal: '',
    keterangan: '',
    aset: 'tunai',
    prioritas: 'rendah',
    kategori: 'Umum',
    pajak: ''
  });

  // Form State - Pembayaran Prioritas (full date: tanggal, bulan, tahun)
  const now = new Date();
  const [pembayaranForm, setPembayaranForm] = useState({
    nama: '',
    nominal: '',
    tanggal_jatuh_tempo: '',
    bulan_jatuh_tempo: String(now.getMonth() + 1),
    tahun_jatuh_tempo: String(now.getFullYear()),
    kategori: 'Tagihan',
    keterangan: ''
  });

  // ─── NEW STATE: Tabungan (Savings Goals) ─────────────────────────
  const [tabunganList, setTabunganList] = useState([]);
  const [showTabunganForm, setShowTabunganForm] = useState(false);
  const [tabunganForm, setTabunganForm] = useState({
    nama: '', target_nominal: '', emoji: '🐷'
  });
  const [showIsiTabungan, setShowIsiTabungan] = useState(null); // id tabungan
  const [isiTabunganNominal, setIsiTabunganNominal] = useState('');

  // ─── NEW STATE: Anggaran (Category Budget) ───────────────────────
  const [anggaranList, setAnggaranList] = useState([]);
  const [pengeluaranPerKategori, setPengeluaranPerKategori] = useState({});
  const [showAnggaranForm, setShowAnggaranForm] = useState(false);
  const [anggaranForm, setAnggaranForm] = useState({ kategori: 'Makanan', batas: '' });

  // ─── NEW STATE: Saldo per Aset ───────────────────────────────────
  const [saldoPerAset, setSaldoPerAset] = useState({ tunai: 0, kartu: 0, 'e-wallet': 0 });

  // ─── NEW STATE: Simple Mode ──────────────────────────────────────
  const [simpleMode, setSimpleMode] = useState(() => {
    try { return localStorage.getItem('simpleMode') === 'true'; } catch { return false; }
  });

  // ─── NEW STATE: Split Bill ───────────────────────────────────────
  const [showSplitBill, setShowSplitBill] = useState(false);
  const [splitBillData, setSplitBillData] = useState({ total: '', jumlahOrang: '2' });

  useEffect(() => {
    fetchData();
  }, []);

  // Update window size based on view mode
  useEffect(() => {
    if (window.api && window.api.resizeWindow) {
      if (view === 'mini') {
        window.api.resizeWindow(240, 310);
      } else {
        window.api.resizeWindow(1000, 700);
      }
    }
  }, [view]);

  // Persist simple mode
  useEffect(() => {
    try { localStorage.setItem('simpleMode', simpleMode); } catch {}
  }, [simpleMode]);

  const fetchData = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const [trxData, sumData, pembayaranData, tabunganData, anggaranData, saldoAset, pengeluaranKat] = await Promise.all([
        window.api.getTransaksi(),
        window.api.getRingkasan(),
        window.api.getCicilan(),
        window.api.getTabungan(),
        window.api.getAnggaran(currentMonth, currentYear),
        window.api.getSaldoPerAset(),
        window.api.getPengeluaranPerKategori(currentMonth, currentYear),
      ]);
      setTransaksiList(trxData);
      setRingkasan(sumData);
      setPembayaranList(pembayaranData);
      setTabunganList(tabunganData);
      setAnggaranList(anggaranData);
      setSaldoPerAset(saldoAset);
      setPengeluaranPerKategori(pengeluaranKat);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const resetForm = () => {
    setFormData({
      nominal: '',
      keterangan: '',
      aset: 'tunai',
      prioritas: 'rendah',
      kategori: 'Umum',
      pajak: ''
    });
  };

  const resetPembayaranForm = () => {
    const n = new Date();
    setPembayaranForm({
      nama: '',
      nominal: '',
      tanggal_jatuh_tempo: '',
      bulan_jatuh_tempo: String(n.getMonth() + 1),
      tahun_jatuh_tempo: String(n.getFullYear()),
      kategori: 'Tagihan',
      keterangan: ''
    });
    setEditingPembayaran(null);
  };

  const handleSave = async () => {
    if (!formData.nominal || !formData.keterangan) {
      alert("Harap isi nominal dan keterangan!");
      return;
    }

    const pajakNominal = formData.pajak ? parseFloat(formData.pajak) : 0;

    const payload = {
      jenis: view === 'pemasukan' ? 'pemasukan' : 'pengeluaran',
      nominal: parseFloat(formData.nominal) + pajakNominal,
      keterangan: formData.keterangan,
      aset: formData.aset,
      kategori: formData.kategori,
      prioritas: view === 'pengeluaran' ? formData.prioritas : null,
      pajak: pajakNominal
    };

    try {
      await window.api.simpanTransaksi(payload);
      resetForm();
      setView('dashboard');
      fetchData();
    } catch (err) {
      console.error('Failed to save', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus transaksi ini?')) return;
    try {
      await window.api.hapusTransaksi(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  // ─── Pembayaran Prioritas Handlers ───────────────────────────────

  const handleSavePembayaran = async () => {
    if (!pembayaranForm.nama || !pembayaranForm.nominal || !pembayaranForm.tanggal_jatuh_tempo) {
      alert("Harap isi nama, nominal, dan tanggal jatuh tempo!");
      return;
    }

    const tgl = parseInt(pembayaranForm.tanggal_jatuh_tempo);
    const bln = parseInt(pembayaranForm.bulan_jatuh_tempo);
    const thn = parseInt(pembayaranForm.tahun_jatuh_tempo);

    if (tgl < 1 || tgl > 31) {
      alert("Tanggal harus antara 1-31!");
      return;
    }

    // Validasi tanggal valid untuk bulan yang dipilih
    const maxDay = new Date(thn, bln, 0).getDate(); // hari terakhir bulan tsb
    if (tgl > maxDay) {
      alert(`Bulan ${NAMA_BULAN[bln - 1]} ${thn} hanya memiliki ${maxDay} hari!`);
      return;
    }

    const payload = {
      nama: pembayaranForm.nama,
      nominal: parseFloat(pembayaranForm.nominal),
      tanggal_jatuh_tempo: tgl,
      bulan_jatuh_tempo: bln,
      tahun_jatuh_tempo: thn,
      kategori: pembayaranForm.kategori,
      keterangan: pembayaranForm.keterangan
    };

    try {
      if (editingPembayaran) {
        await window.api.updateCicilan(editingPembayaran.id, payload);
      } else {
        await window.api.simpanCicilan(payload);
      }
      resetPembayaranForm();
      setShowPembayaranForm(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save pembayaran', err);
    }
  };

  const handleDeletePembayaran = async (id) => {
    if (!confirm('Hapus tagihan rutin ini?')) return;
    try {
      await window.api.hapusCicilan(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete pembayaran', err);
    }
  };

  const handleEditPembayaran = (item) => {
    setEditingPembayaran(item);
    setPembayaranForm({
      nama: item.nama,
      nominal: item.nominal.toString(),
      tanggal_jatuh_tempo: item.tanggal_jatuh_tempo.toString(),
      bulan_jatuh_tempo: item.bulan_jatuh_tempo.toString(),
      tahun_jatuh_tempo: item.tahun_jatuh_tempo.toString(),
      kategori: item.kategori,
      keterangan: item.keterangan || ''
    });
    setShowPembayaranForm(true);
  };

  // ─── NEW: Tabungan Handlers ──────────────────────────────────────

  const handleSaveTabungan = async () => {
    if (!tabunganForm.nama || !tabunganForm.target_nominal) {
      alert("Harap isi nama dan target nominal!");
      return;
    }
    try {
      await window.api.simpanTabungan({
        nama: tabunganForm.nama,
        target_nominal: parseFloat(tabunganForm.target_nominal),
        emoji: tabunganForm.emoji
      });
      setTabunganForm({ nama: '', target_nominal: '', emoji: '🐷' });
      setShowTabunganForm(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save tabungan', err);
    }
  };

  const handleIsiTabungan = async (id, jumlah) => {
    if (!jumlah || parseFloat(jumlah) <= 0) return;
    try {
      await window.api.updateTabunganNominal(id, parseFloat(jumlah));
      setShowIsiTabungan(null);
      setIsiTabunganNominal('');
      fetchData();
    } catch (err) {
      console.error('Failed to update tabungan', err);
    }
  };

  const handleAmbilTabungan = async (id, jumlah) => {
    if (!jumlah || parseFloat(jumlah) <= 0) return;
    try {
      await window.api.updateTabunganNominal(id, -parseFloat(jumlah));
      setShowIsiTabungan(null);
      setIsiTabunganNominal('');
      fetchData();
    } catch (err) {
      console.error('Failed to withdraw tabungan', err);
    }
  };

  const handleDeleteTabungan = async (id) => {
    if (!confirm('Hapus target tabungan ini?')) return;
    try {
      await window.api.hapusTabungan(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete tabungan', err);
    }
  };

  // ─── NEW: Anggaran Handlers ──────────────────────────────────────

  const handleSaveAnggaran = async () => {
    if (!anggaranForm.kategori || !anggaranForm.batas) {
      alert("Harap isi kategori dan batas anggaran!");
      return;
    }
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    try {
      await window.api.simpanAnggaran({
        kategori: anggaranForm.kategori,
        batas: parseFloat(anggaranForm.batas),
        bulan: currentMonth,
        tahun: currentYear
      });
      setAnggaranForm({ kategori: 'Makanan', batas: '' });
      setShowAnggaranForm(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save anggaran', err);
    }
  };

  const handleDeleteAnggaran = async (id) => {
    if (!confirm('Hapus anggaran ini?')) return;
    try {
      await window.api.hapusAnggaran(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete anggaran', err);
    }
  };

  // ─── NEW: Split Bill Handler ─────────────────────────────────────

  const handleSplitBillSave = async () => {
    const total = parseFloat(splitBillData.total);
    const orang = parseInt(splitBillData.jumlahOrang);
    if (!total || !orang || orang < 1) return;
    const perOrang = Math.ceil(total / orang);
    
    try {
      await window.api.simpanTransaksi({
        jenis: 'pengeluaran',
        nominal: perOrang,
        keterangan: `Patungan (${orang} orang, total ${formatIDR(total)})`,
        aset: 'tunai',
        kategori: 'Umum',
        prioritas: 'rendah',
        pajak: 0
      });
      setSplitBillData({ total: '', jumlahOrang: '2' });
      setShowSplitBill(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save split bill', err);
    }
  };

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Format tanggal jatuh tempo lengkap
  const formatTanggalJatuhTempo = (item) => {
    const bln = item.bulan_jatuh_tempo;
    const thn = item.tahun_jatuh_tempo;
    return `${item.tanggal_jatuh_tempo} ${NAMA_BULAN[bln - 1]} ${thn}`;
  };

  // ─── SPK / Status Keuangan Logic ─────────────────────────────────

  let statusKeuangan = "Kurang Stabil";
  let statusColor = "bg-[#F43F5E]";
  let progressWidth = "w-1/3";
  
  if (ringkasan.pemasukan > ringkasan.pengeluaran * 1.5) {
    statusKeuangan = "Sangat Stabil";
    statusColor = "bg-[#FB7185]";
    progressWidth = "w-4/5";
  } else if (ringkasan.pemasukan >= ringkasan.pengeluaran) {
    statusKeuangan = "Stabil";
    statusColor = "bg-[#10B981]";
    progressWidth = "w-2/3";
  }

  // SPK Priority helpers
  const getPriorityBadge = (prioritas) => {
    switch (prioritas) {
      case 'tinggi': return 'bg-danger text-white';
      case 'sedang': return 'bg-warning text-white';
      case 'rendah': return 'bg-success text-white';
      default: return 'bg-gray-300 text-gray-600';
    }
  };

  const getPriorityLabel = (prioritas) => {
    switch (prioritas) {
      case 'tinggi': return simpleMode ? 'Segera!' : 'Tinggi';
      case 'sedang': return simpleMode ? 'Siap-siap' : 'Sedang';
      case 'rendah': return simpleMode ? 'Aman' : 'Rendah';
      default: return '-';
    }
  };

  const getPriorityIcon = (prioritas) => {
    switch (prioritas) {
      case 'tinggi': return <ShieldAlert size={16} />;
      case 'sedang': return <AlertTriangle size={16} />;
      case 'rendah': return <CheckCircle2 size={16} />;
      default: return <Clock size={16} />;
    }
  };

  // Pembayaran data computed
  const topPrioritas = [...pembayaranList]
    .sort((a, b) => a.sisaHari - b.sisaHari)
    .slice(0, 3);
  
  const totalPembayaranBulanan = pembayaranList.reduce((sum, c) => sum + c.nominal, 0);
  const pembayaranMendesak = pembayaranList.filter(c => c.prioritas === 'tinggi').length;

  // Computed values for Tabungan and Anggaran (Ecosystem Integration)
  const totalTabunganTerkumpul = tabunganList.reduce((sum, t) => sum + (t.terkumpul || 0), 0);
  const totalTabunganTarget = tabunganList.reduce((sum, t) => sum + (t.target_nominal || 0), 0);
  const tabunganTercapaiCount = tabunganList.filter(t => (t.terkumpul || 0) >= (t.target_nominal || 0)).length;
  const tabunganAktifCount = tabunganList.length - tabunganTercapaiCount;
  const tabunganProgressGabungan = totalTabunganTarget > 0 ? Math.min((totalTabunganTerkumpul / totalTabunganTarget) * 100, 100) : 0;

  const totalAnggaranCount = anggaranList.length;
  const anggaranAmanCount = anggaranList.filter(a => (pengeluaranPerKategori[a.kategori] || 0) <= a.batas).length;

  const anggaranKritisList = [...anggaranList]
    .map(a => {
      const terpakai = pengeluaranPerKategori[a.kategori] || 0;
      const persen = a.batas > 0 ? (terpakai / a.batas) * 100 : 0;
      return { ...a, terpakai, persen };
    })
    .sort((a, b) => b.persen - a.persen);

  // ─── Saran Keuangan (SPK Recommendations) ────────────────────────
  const generateSaran = () => {
    const saran = [];

    if (ringkasan.saldo < 0) {
      saran.push({
        type: 'danger',
        icon: <ShieldAlert size={14} />,
        text: simpleMode ? 'Uangmu habis! Kurangi jajan dan cari pemasukan.' : 'Saldo Anda negatif. Kurangi pengeluaran dan prioritaskan pemasukan segera.'
      });
    } else if (ringkasan.pengeluaran > ringkasan.pemasukan) {
      saran.push({
        type: 'warning',
        icon: <AlertTriangle size={14} />,
        text: simpleMode ? 'Pengeluaranmu lebih banyak dari pemasukan bulan ini.' : 'Pengeluaran bulan ini lebih besar dari pemasukan. Pertimbangkan untuk mengurangi pengeluaran non-prioritas.'
      });
    } else if (ringkasan.pemasukan > ringkasan.pengeluaran * 2) {
      saran.push({
        type: 'success',
        icon: <TrendingUp size={14} />,
        text: simpleMode ? 'Keuanganmu sangat bagus! Coba menabung lebih banyak.' : 'Keuangan sangat sehat! Pertimbangkan alokasi dana darurat atau investasi.'
      });
    }

    if (pembayaranMendesak > 0) {
      saran.push({
        type: 'danger',
        icon: <CalendarClock size={14} />,
        text: `Ada ${pembayaranMendesak} tagihan yang harus segera dibayar!`
      });
    }

    const sedangCount = pembayaranList.filter(c => c.prioritas === 'sedang').length;
    if (sedangCount > 0) {
      saran.push({
        type: 'warning',
        icon: <Clock size={14} />,
        text: `${sedangCount} tagihan mendekati jatuh tempo. Siapkan dananya.`
      });
    }

    if (totalPembayaranBulanan > 0 && ringkasan.pemasukan > 0) {
      const rasio = (totalPembayaranBulanan / ringkasan.pemasukan) * 100;
      if (rasio > 50) {
        saran.push({
          type: 'danger',
          icon: <Lightbulb size={14} />,
          text: simpleMode 
            ? `Tagihan rutinmu terlalu banyak (${rasio.toFixed(0)}% dari pemasukan).` 
            : `Beban pembayaran rutin (${rasio.toFixed(0)}% dari pemasukan) terlalu tinggi. Idealnya di bawah 30%.`
        });
      } else if (rasio > 30) {
        saran.push({
          type: 'warning',
          icon: <Lightbulb size={14} />,
          text: `Tagihan rutin ${rasio.toFixed(0)}% dari pemasukan. Masih wajar, tapi perlu dijaga.`
        });
      } else {
        saran.push({
          type: 'success',
          icon: <Lightbulb size={14} />,
          text: `Tagihan rutin hanya ${rasio.toFixed(0)}% dari pemasukan. Sangat baik!`
        });
      }
    }

    // Saran anggaran
    anggaranList.forEach(a => {
      const terpakai = pengeluaranPerKategori[a.kategori] || 0;
      const persen = a.batas > 0 ? (terpakai / a.batas) * 100 : 0;
      if (persen > 100) {
        saran.push({
          type: 'danger',
          icon: <Target size={14} />,
          text: `Anggaran ${a.kategori} sudah melebihi batas! (${persen.toFixed(0)}%)`
        });
      } else if (persen > 80) {
        saran.push({
          type: 'warning',
          icon: <Target size={14} />,
          text: `Anggaran ${a.kategori} hampir habis (${persen.toFixed(0)}%).`
        });
      }
    });

    if (saran.length === 0) {
      saran.push({
        type: 'success',
        icon: <CheckCircle2 size={14} />,
        text: 'Mulailah catat pemasukan & pengeluaran untuk mendapatkan saran keuangan otomatis.'
      });
    }

    return saran;
  };

  const saranList = generateSaran();

  // Ranking pembayaran (sorted by urgency)
  const rankedPembayaran = [...pembayaranList].sort((a, b) => a.sisaHari - b.sisaHari);

  // Generate year options: current year to +5 years
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear + i);

  // Budget helpers
  const getBudgetColor = (persen) => {
    if (persen > 100) return { bg: 'bg-danger', text: 'text-danger', glow: 'budget-danger-glow' };
    if (persen > 70) return { bg: 'bg-warning', text: 'text-warning', glow: 'budget-warning-glow' };
    return { bg: 'bg-success', text: 'text-success', glow: '' };
  };

  return (
    <div className="flex items-center justify-center h-screen p-0">
      
      {view === 'mini' ? (
        // ═══════════════════════════════════════════════════════════════
        // MINI WIDGET VIEW
        // ═══════════════════════════════════════════════════════════════
        <div className="mini-widget-container w-full h-full relative overflow-hidden flex flex-col rounded-2xl">
          {/* Gradient accent bar at top */}
          <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 flex-shrink-0" />

          {/* Header - ultra compact & draggable */}
          <div className="titlebar-drag flex justify-between items-center px-3 py-2 bg-white/[0.03]">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span className="font-sans font-bold text-[8px] tracking-[0.12em] uppercase text-white/80">Hemat Cuan</span>
            </div>
            <div className="flex gap-1.5 titlebar-no-drag z-10">
              <button 
                onClick={() => setView('dashboard')}
                className="w-5 h-5 rounded-md flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Buka Dashboard"
              >
                <Maximize2 size={10} />
              </button>
              <button 
                onClick={() => window.api.closeWindow()}
                className="w-5 h-5 rounded-md flex items-center justify-center text-white/50 hover:text-danger hover:bg-danger/10 transition-all cursor-pointer"
                title="Tutup"
              >
                <X size={10} />
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="px-3 pb-3 pt-1 flex-1 flex flex-col gap-2 overflow-hidden">
            
            {/* Saldo - hero section */}
            <div className="text-center py-2 bg-white/[0.02] rounded-xl border border-white/[0.04] my-1">
              <p className="text-[7.5px] uppercase tracking-[0.15em] text-lavender/80 font-bold mb-0.5">Saldo</p>
              <h1 className={`text-xl font-sans font-extrabold tracking-tight leading-none ${
                ringkasan.saldo >= 0 ? 'text-emerald-300' : 'text-rose-300'
              }`}>
                {formatIDR(ringkasan.saldo)}
              </h1>
            </div>

            {/* Pemasukan / Pengeluaran - side by side mini bars */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="mini-stat-card bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500/25 flex items-center justify-center flex-shrink-0">
                  <ArrowDownLeft size={8} className="text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[6px] uppercase tracking-wide text-white/70 font-bold leading-none">Masuk</p>
                  <p className="text-[10px] font-sans font-bold text-emerald-300 truncate leading-tight">{formatIDR(ringkasan.pemasukan)}</p>
                </div>
              </div>
              <div className="mini-stat-card bg-rose-950/40 border border-rose-500/30 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-rose-500/25 flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight size={8} className="text-rose-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[6px] uppercase tracking-wide text-white/70 font-bold leading-none">Keluar</p>
                  <p className="text-[10px] font-sans font-bold text-rose-300 truncate leading-tight">{formatIDR(ringkasan.pengeluaran)}</p>
                </div>
              </div>
            </div>

            {/* Tagihan alert - only shows if there are urgent bills */}
            {pembayaranMendesak > 0 && (
              <button
                onClick={() => setView('spk')}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg bg-rose-950/50 border border-rose-500/40 hover:bg-rose-900/40 transition-all cursor-pointer group"
              >
                <div className="w-4 h-4 rounded-full bg-danger flex items-center justify-center flex-shrink-0 spk-pulse">
                  <ShieldAlert size={8} className="text-white" />
                </div>
                <span className="text-[8px] font-bold text-rose-200 group-hover:text-white transition-colors">
                  {pembayaranMendesak} tagihan mendesak!
                </span>
                <ChevronRight size={8} className="text-rose-300/60 ml-auto" />
              </button>
            )}

            {/* Spacer to push buttons to bottom */}
            <div className="flex-1" />

            {/* Quick action buttons - icon only, super compact */}
            <div className="grid grid-cols-3 gap-1.5">
              <button 
                onClick={() => setView('pemasukan')}
                className="mini-action-btn flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-white/[0.08] border border-white/[0.12] hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/25 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={11} strokeWidth={3} className="text-emerald-300" />
                </div>
                <span className="text-[7.5px] font-bold uppercase tracking-wide text-white/80 group-hover:text-emerald-300 transition-colors">Masuk</span>
              </button>
              <button 
                onClick={() => setView('pengeluaran')}
                className="mini-action-btn flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-white/[0.08] border border-white/[0.12] hover:bg-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-lg bg-rose-500/25 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Minus size={11} strokeWidth={3} className="text-rose-300" />
                </div>
                <span className="text-[7.5px] font-bold uppercase tracking-wide text-white/80 group-hover:text-rose-300 transition-colors">Keluar</span>
              </button>
              <button 
                onClick={() => setView('dashboard')}
                className="mini-action-btn flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-white/[0.08] border border-white/[0.12] hover:bg-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-lg bg-violet-500/25 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 size={11} strokeWidth={2.5} className="text-violet-300" />
                </div>
                <span className="text-[7.5px] font-bold uppercase tracking-wide text-white/80 group-hover:text-violet-300 transition-colors">Menu</span>
              </button>
            </div>
          </div>
        </div>

      ) : (
        // ═══════════════════════════════════════════════════════════════
        // FULL DASHBOARD / FORM / SPK VIEW
        // ═══════════════════════════════════════════════════════════════
        <div className="w-full max-w-[1000px] h-full bg-primary rounded-2xl shadow-lg relative overflow-hidden flex flex-col border border-white/10 transition-all">
          
          {/* Header */}
          <div className="titlebar-drag flex justify-between items-center px-6 py-3 bg-white/5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-light" />
              <span className="text-white/40 text-[11px] font-semibold tracking-wide uppercase">Hemat Cuan Beta 0.2</span>
            </div>
            <div className="flex gap-3 titlebar-no-drag z-10">
              {/* Simple Mode Toggle */}
              <button 
                onClick={() => setSimpleMode(!simpleMode)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                  simpleMode ? 'bg-amber-400/20 text-amber-400' : 'bg-white/5 text-white/40 hover:text-white/60'
                }`}
                title={simpleMode ? 'Mode Sederhana Aktif' : 'Aktifkan Mode Sederhana'}
              >
                {simpleMode ? <Eye size={14} /> : <EyeOff size={14} />}
                {simpleMode ? 'Simple' : ''}
              </button>
              <button 
                onClick={() => setView('mini')}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
                title="Mini Mode"
              >
                <Minimize2 size={18} />
              </button>
              <button 
                onClick={() => window.api.closeWindow()}
                className="text-white/40 hover:text-danger transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
            <AnimatePresence mode="wait">
              
              {/* ─── DASHBOARD VIEW ──────────────────────────────────── */}
              {view === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full p-6 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto"
                >
                  {/* Left Column (2/3) */}
                  <div className="md:col-span-2 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lavender/60 font-medium text-sm">Saldomu saat ini</span>
                        <button className="px-3 py-1 bg-white/10 hover:bg-white/15 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer">
                          Bulan Ini <MoreHorizontal size={14} />
                        </button>
                      </div>
                      <h1 className="text-5xl md:text-6xl font-sans font-bold text-white" style={{ letterSpacing: '-0.04em' }}>
                        {formatIDR(ringkasan.saldo)}
                      </h1>

                      {/* Quick Stats Bar */}
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <button 
                          onClick={() => setView('tabungan')}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/[0.06] hover:border-white/15 transition-all cursor-pointer group text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center shrink-0">
                              <PiggyBank size={12} className="text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[8px] uppercase tracking-wide text-lavender/60 font-bold leading-none mb-1">Tabungan</p>
                              <p className="text-[10px] font-sans font-bold text-white truncate">{formatIDR(totalTabunganTerkumpul)}</p>
                            </div>
                          </div>
                          <ChevronRight size={10} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all ml-1 shrink-0" />
                        </button>

                        <button 
                          onClick={() => setView('anggaran')}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/[0.06] hover:border-white/15 transition-all cursor-pointer group text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center shrink-0">
                              <BarChart3 size={12} className="text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[8px] uppercase tracking-wide text-lavender/60 font-bold leading-none mb-1">Anggaran</p>
                              <p className="text-[10px] font-sans font-bold text-white truncate">
                                {totalAnggaranCount > 0 ? `${anggaranAmanCount}/${totalAnggaranCount} aman` : 'Belum diatur'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={10} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all ml-1 shrink-0" />
                        </button>

                        <button 
                          onClick={() => setView('spk')}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/[0.06] hover:border-white/15 transition-all cursor-pointer group text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center shrink-0">
                              <CalendarClock size={12} className="text-amber-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[8px] uppercase tracking-wide text-lavender/60 font-bold leading-none mb-1">Tagihan</p>
                              <p className="text-[10px] font-sans font-bold text-white truncate">
                                {pembayaranMendesak > 0 ? `${pembayaranMendesak} mendesak` : 'Semua aman'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={10} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all ml-1 shrink-0" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-3 mt-4">
                        <button 
                          onClick={() => setView('pemasukan')}
                          className="bg-lavender-soft text-dark-purple p-4 rounded-2xl flex flex-col justify-between h-24 hover:bg-lavender transition-colors group cursor-pointer border border-transparent hover:border-primary/20"
                        >
                          <span className="text-[10px] font-bold leading-tight opacity-70 group-hover:opacity-100 text-left">Tambah Pemasukan</span>
                          <div className="self-end w-8 h-8 bg-dark-purple rounded-full flex items-center justify-center text-white">
                            <Plus size={16} strokeWidth={3} />
                          </div>
                        </button>
                        <button 
                          onClick={() => setView('pengeluaran')}
                          className="bg-lavender-soft text-dark-purple p-4 rounded-2xl flex flex-col justify-between h-24 hover:bg-lavender transition-colors group cursor-pointer border border-transparent hover:border-primary/20"
                        >
                          <span className="text-[10px] font-bold leading-tight opacity-70 group-hover:opacity-100 text-left">Tambah Pengeluaran</span>
                          <div className="self-end w-8 h-8 bg-dark-purple rounded-full flex items-center justify-center text-white">
                            <Plus size={16} strokeWidth={3} />
                          </div>
                        </button>
                        <button 
                          onClick={() => setView('tabungan')}
                          className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-4 rounded-2xl flex flex-col justify-between h-24 hover:brightness-110 transition-all group cursor-pointer relative overflow-hidden"
                        >
                          <span className="text-[10px] font-bold leading-tight opacity-90 group-hover:opacity-100 text-left">{simpleMode ? 'Celengan' : 'Target Tabungan'}</span>
                          <div className="self-end w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
                            <PiggyBank size={16} strokeWidth={2.5} />
                          </div>
                        </button>
                        <button 
                          onClick={() => setView('spk')}
                          className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-4 rounded-2xl flex flex-col justify-between h-24 hover:brightness-110 transition-all group cursor-pointer relative overflow-hidden"
                        >
                          {pembayaranMendesak > 0 && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-danger rounded-full flex items-center justify-center text-[9px] font-black">
                              {pembayaranMendesak}
                            </div>
                          )}
                          <span className="text-[10px] font-bold leading-tight opacity-90 group-hover:opacity-100 text-left">{simpleMode ? 'Tagihan' : 'Tagihan Rutin & SPK'}</span>
                          <div className="self-end w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
                            <CalendarClock size={16} strokeWidth={2.5} />
                          </div>
                        </button>
                      </div>

                      {/* Quick tools row */}
                      <div className="flex gap-3 mt-2">
                        <button
                          onClick={() => setView('anggaran')}
                          className="flex-1 p-3 rounded-full flex items-center justify-center gap-2 text-white/60 bg-white/5 hover:bg-white/10 hover:text-white transition-all cursor-pointer border border-white/[0.06]"
                        >
                          <Target size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wide">{simpleMode ? 'Batas Belanja' : 'Anggaran Kategori'}</span>
                        </button>
                        <button
                          onClick={() => setShowSplitBill(true)}
                          className="flex-1 p-3 rounded-full flex items-center justify-center gap-2 text-white/60 bg-white/5 hover:bg-white/10 hover:text-white transition-all cursor-pointer border border-white/[0.06]"
                        >
                          <Users size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wide">Patungan</span>
                        </button>
                      </div>
                    </div>

                    {/* Riwayat Transaksi */}
                    <div className="bg-white rounded-2xl p-5 flex flex-col flex-1 min-h-[200px] shadow-md text-dark-purple overflow-hidden">
                      <h3 className="text-sm font-bold mb-3 flex items-center justify-between">
                        Riwayat Transaksi
                        <span className="text-[10px] font-normal opacity-40 px-2.5 py-0.5 bg-gray-100 rounded-full">Terbaru</span>
                      </h3>
                      <div className="flex-1 overflow-y-auto pr-2 space-y-1 white-scrollbar">
                        {isLoading ? (
                          <div className="flex items-center justify-center h-full text-gray-300 text-sm">Memuat transaksimu...</div>
                        ) : transaksiList.length === 0 ? (
                          <div className="flex items-center justify-center h-full text-gray-300 text-sm">Belum ada transaksi</div>
                        ) : (
                          transaksiList.map((trx) => {
                            const isPatungan = trx.keterangan && trx.keterangan.includes('Patungan (');
                            const anggaranForTrx = anggaranList.find(a => a.kategori === trx.kategori);
                            let isBudgetWarning = false;
                            let isBudgetExceeded = false;
                            if (anggaranForTrx && trx.jenis === 'pengeluaran') {
                              const terpakai = pengeluaranPerKategori[trx.kategori] || 0;
                              const persen = anggaranForTrx.batas > 0 ? (terpakai / anggaranForTrx.batas) * 100 : 0;
                              if (persen > 100) {
                                isBudgetExceeded = true;
                              } else if (persen > 80) {
                                isBudgetWarning = true;
                              }
                            }

                            return (
                              <div key={trx.id} className="flex justify-between items-center py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full shrink-0 ${trx.jenis === 'pemasukan' ? 'bg-success' : 'bg-danger'}`} />
                                  <div>
                                    <div className="font-semibold text-sm flex items-center flex-wrap gap-1">
                                      {trx.keterangan}
                                      {isPatungan && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[8px] font-bold uppercase tracking-wide ml-1">
                                          <Users size={8} /> Patungan
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-wide font-medium opacity-40 flex items-center gap-1.5 flex-wrap mt-0.5">
                                      <span>{trx.kategori} · {trx.aset}</span>
                                      {isBudgetExceeded && (
                                        <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[7px] font-bold uppercase tracking-wide" title="Anggaran kategori ini melebihi batas!">
                                          <ShieldAlert size={7} /> Melebihi Batas
                                        </span>
                                      )}
                                      {isBudgetWarning && !isBudgetExceeded && (
                                        <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[7px] font-bold uppercase tracking-wide" title="Anggaran kategori ini hampir habis!">
                                          <AlertTriangle size={7} /> Hampir Habis
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className={`font-sans font-bold text-sm tabular-nums ${trx.jenis === 'pemasukan' ? 'text-success' : 'text-danger'}`}>
                                    {trx.jenis === 'pemasukan' ? '+' : '-'} {formatIDR(trx.nominal)}
                                  </div>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(trx.id); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-md transition-all cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column (1/3) */}
                  <div className="flex flex-col gap-4">
                     <div className="bg-pink-500 p-5 rounded-2xl flex flex-col gap-1 transition-colors">
                       <span className="text-white/70 text-[10px] font-medium uppercase tracking-wide">Pendapatan bulan ini</span>
                       <h2 className="text-xl font-sans font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{formatIDR(ringkasan.pemasukan)}</h2>
                     </div>

                     <div className="bg-lavender text-dark-purple p-5 rounded-2xl flex flex-col gap-1 transition-colors">
                       <span className="text-dark-purple/50 text-[10px] font-medium uppercase tracking-wide">Pengeluaran bulan ini</span>
                       <h2 className="text-xl font-sans font-bold" style={{ letterSpacing: '-0.02em' }}>{formatIDR(ringkasan.pengeluaran)}</h2>
                     </div>

                     {/* Ringkasan Tabungan */}
                      <button
                        onClick={() => setView('tabungan')}
                        className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-2xl flex flex-col text-left hover:brightness-105 transition-all cursor-pointer group"
                      >
                        <span className="text-white/70 text-[10px] font-medium uppercase tracking-wide flex items-center justify-between w-full">
                          <span className="flex items-center gap-1.5"><PiggyBank size={12} /> Ringkasan Tabungan</span>
                          <ChevronRight size={14} className="text-white/55 group-hover:translate-x-0.5 transition-all" />
                        </span>
                        <h2 className="text-xl font-sans font-bold mt-1" style={{ letterSpacing: '-0.02em' }}>{formatIDR(totalTabunganTerkumpul)}</h2>
                        
                        <div className="w-full h-1.5 bg-white/20 mt-3 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white transition-all duration-1000" 
                            style={{ width: `${tabunganProgressGabungan}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center mt-2.5 text-[10px] text-white/80">
                          {tabunganList.length > 0 ? (
                            <>
                              <span>{tabunganTercapaiCount} Tercapai</span>
                              <span>{tabunganAktifCount} Aktif</span>
                            </>
                          ) : (
                            <span className="opacity-80">Belum ada target tabungan</span>
                          )}
                        </div>
                      </button>

                      {/* Monitor Anggaran */}
                      <button
                        onClick={() => setView('anggaran')}
                        className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl flex flex-col text-left hover:brightness-105 transition-all cursor-pointer group"
                      >
                        <span className="text-white/70 text-[10px] font-medium uppercase tracking-wide flex items-center justify-between w-full">
                          <span className="flex items-center gap-1.5"><Target size={12} /> Monitor Anggaran</span>
                          <ChevronRight size={14} className="text-white/55 group-hover:translate-x-0.5 transition-all" />
                        </span>
                        
                        {anggaranList.length > 0 ? (
                          <div className="w-full mt-3 space-y-2.5">
                            {anggaranKritisList.slice(0, 3).map((a) => {
                              return (
                                <div key={a.id} className="text-[11px] w-full">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold truncate max-w-[100px]">{a.kategori}</span>
                                    <span className="font-mono text-[10px] opacity-90">
                                      {formatIDR(a.terpakai)} / {formatIDR(a.batas)}
                                    </span>
                                  </div>
                                  <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${a.persen > 100 ? 'bg-rose-400' : a.persen > 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                      style={{ width: `${Math.min(a.persen, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="mt-4 text-xs text-white/60 text-center py-2 w-full">
                            Belum ada anggaran bulanan
                            <br />
                            <span className="underline font-medium text-white">Buat Sekarang →</span>
                          </div>
                        )}
                      </button>

                     {/* Saldo per Aset */}
                     <div className="bg-white/10 p-4 rounded-2xl border border-white/[0.06]">
                       <h4 className="text-[10px] font-bold uppercase tracking-wide text-lavender/50 mb-3 flex items-center gap-1.5">
                         <Coins size={12} />
                         Saldo per Aset
                       </h4>
                       <div className="space-y-2">
                         {[
                           { key: 'tunai', icon: Banknote, label: 'Tunai', color: 'text-emerald-400' },
                           { key: 'kartu', icon: CreditCard, label: 'Kartu', color: 'text-blue-400' },
                           { key: 'e-wallet', icon: Wallet, label: 'E-Wallet', color: 'text-purple-400' },
                         ].map(item => (
                           <div key={item.key} className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <item.icon size={14} className={item.color} />
                               <span className="text-xs text-white/60">{item.label}</span>
                             </div>
                             <span className={`text-sm font-sans font-bold tabular-nums ${saldoPerAset[item.key] < 0 ? 'text-danger' : 'text-white'}`}>
                               {formatIDR(saldoPerAset[item.key])}
                             </span>
                           </div>
                         ))}
                       </div>
                     </div>

                     <div className={`${statusColor} p-5 rounded-2xl flex flex-col gap-1 transition-colors duration-500`}>
                       <span className="text-white/70 text-[10px] font-medium uppercase tracking-wide">Status keuangan</span>
                       <h3 className="text-lg font-bold text-white">{statusKeuangan}</h3>
                       <div className="w-full h-1 bg-white/20 mt-2 rounded-full overflow-hidden">
                          <div className={`${progressWidth} h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-1000`} />
                       </div>
                     </div>

                     {/* Ranking Prioritas Card */}
                     <button 
                       onClick={() => setView('spk')}
                       className="bg-lavender-soft text-dark-purple p-5 rounded-2xl flex-1 flex flex-col text-left hover:bg-lavender/80 transition-colors cursor-pointer group"
                     >
                       <h4 className="text-xs font-bold mb-3 flex items-center justify-between w-full">
                         <span className="flex items-center gap-2">
                           <Award size={14} className="text-primary" />
                           {simpleMode ? 'Tagihan Penting' : 'Ranking Prioritas'}
                         </span>
                         <div className="flex items-center gap-2">
                           {pembayaranMendesak > 0 && (
                             <span className="w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center text-[9px] font-black">
                               {pembayaranMendesak}
                             </span>
                           )}
                           <ChevronRight size={14} className="text-dark-purple/30 group-hover:text-dark-purple/60 group-hover:translate-x-0.5 transition-all" />
                         </div>
                       </h4>
                       <div className="flex-1 space-y-2.5 w-full">
                         {topPrioritas.length > 0 ? (
                           topPrioritas.map((c, index) => (
                             <div key={c.id} className="flex justify-between items-center text-xs">
                               <div className="flex items-center gap-2 flex-1 min-w-0">
                                 <span className="text-[9px] font-black text-dark-purple/30 w-4">#{index + 1}</span>
                                 {getPriorityIcon(c.prioritas)}
                                 <span className="font-medium opacity-80 truncate">{c.nama}</span>
                               </div>
                               <div className="flex items-center gap-2 ml-2 shrink-0">
                                 <span className="text-[9px] text-dark-purple/40 font-medium">{c.labelPrioritas}</span>
                                 <span className={`px-2 py-0.5 ${getPriorityBadge(c.prioritas)} rounded-full font-bold uppercase text-[9px]`}>
                                   {getPriorityLabel(c.prioritas)}
                                 </span>
                               </div>
                             </div>
                           ))
                         ) : (
                           <div className="text-xs text-dark-purple/30 text-center py-2">
                             Belum ada tagihan rutin
                             <br />
                             <span className="text-primary font-medium">Klik untuk tambah →</span>
                           </div>
                         )}
                       </div>
                       {pembayaranList.length > 0 && (
                         <div className="mt-3 pt-2 border-t border-dark-purple/10 w-full">
                           <div className="flex justify-between text-[10px]">
                             <span className="text-dark-purple/40">Total tagihan</span>
                             <span className="font-bold text-dark-purple/70">{formatIDR(totalPembayaranBulanan)}</span>
                           </div>
                         </div>
                       )}
                       {!simpleMode && (
                         <div className="mt-2 pt-2 border-t border-dark-purple/10 w-full">
                            <p className="text-[9px] leading-tight text-dark-purple/40">
                              *Ranking otomatis berdasarkan algoritma SAW
                            </p>
                         </div>
                       )}
                     </button>

                     {/* Saran SPK */}
                     <div className="bg-dark-purple/30 p-4 rounded-2xl border border-white/[0.06]">
                       <h4 className="text-[10px] font-bold uppercase tracking-wide text-lavender/50 mb-2 flex items-center gap-1.5">
                         <Lightbulb size={12} />
                         {simpleMode ? 'Tips Keuangan' : 'Saran SPK'}
                       </h4>
                       <div className="space-y-2">
                         {saranList.slice(0, 3).map((s, i) => (
                           <div key={i} className={`flex items-start gap-2 text-[10px] leading-snug ${
                             s.type === 'danger' ? 'text-danger' : s.type === 'warning' ? 'text-warning' : 'text-success'
                           }`}>
                             <span className="mt-0.5 shrink-0">{s.icon}</span>
                             <span className="text-white/70">{s.text}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                  </div>
                </motion.div>
              )}

              {/* ─── FORM VIEW (Pemasukan or Pengeluaran) ────────── */}
              {(view === 'pemasukan' || view === 'pengeluaran') && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full p-6 flex flex-col gap-5 overflow-y-auto"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setView('dashboard')}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-all text-white cursor-pointer"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <h2 className="text-2xl font-sans font-bold uppercase tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                        {view === 'pemasukan' ? 'Pendapatan' : 'Pengeluaran'}
                      </h2>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-full text-dark-purple font-bold text-sm flex items-center gap-3">
                      <span className="opacity-60 uppercase text-[10px]">Saldomu</span>
                      {formatIDR(ringkasan.saldo)}
                    </div>
                  </div>

                  <div className="flex gap-8 border-b border-white/10 pb-2">
                    <button 
                      onClick={() => setView('pemasukan')}
                      className={`pb-2 text-sm font-bold transition-all relative cursor-pointer ${view === 'pemasukan' ? 'text-white' : 'text-white/60'}`}
                    >
                      Pendapatan
                      {view === 'pemasukan' && <motion.div layoutId="tab" className="absolute bottom-[-2px] left-0 right-0 h-1 bg-white rounded-full" />}
                    </button>
                    <button 
                      onClick={() => setView('pengeluaran')}
                      className={`pb-2 text-sm font-bold transition-all relative cursor-pointer ${view === 'pengeluaran' ? 'text-white' : 'text-white/60'}`}
                    >
                      Pengeluaran
                      {view === 'pengeluaran' && <motion.div layoutId="tab" className="absolute bottom-[-2px] left-0 right-0 h-1 bg-white rounded-full" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4 flex-1">
                    <div className="flex flex-col gap-5 max-w-md">
                      <div className="flex items-center gap-4">
                        <label className="w-24 text-sm font-bold uppercase tracking-wide text-lavender/70">Nominal</label>
                        <div className="flex-1 relative">
                          <span className="absolute left-0 bottom-2 text-xl font-bold opacity-50">Rp</span>
                          <input 
                            type="number" 
                            value={formData.nominal}
                            onChange={(e) => setFormData({...formData, nominal: e.target.value})}
                            placeholder="00.000"
                            className="w-full bg-transparent border-b-2 border-white/20 pb-2 px-8 text-2xl font-bold font-sans focus:outline-none focus:border-white transition-colors"
                            style={{ letterSpacing: '-0.02em' }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label htmlFor="keterangan-input" className="w-24 text-sm font-bold uppercase tracking-wide text-lavender/70 cursor-pointer">Keterangan</label>
                        <div className="flex-1">
                          <input 
                            id="keterangan-input"
                            type="text" 
                            value={formData.keterangan}
                            onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                            placeholder="Makan siang di kantor..."
                            className="w-full bg-transparent border-b border-white/30 pb-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-white/40"
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-4 mt-2">
                        <label className="w-24 text-sm font-bold uppercase tracking-wide text-lavender/70 pt-2">Aset</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'tunai', icon: Banknote, label: 'Tunai' },
                            { id: 'kartu', icon: CreditCard, label: 'Kartu' },
                            { id: 'e-wallet', icon: Wallet, label: 'E-Wallet' }
                          ].map((item) => (
                            <button 
                              key={item.id}
                              onClick={() => setFormData({...formData, aset: item.id})}
                              className={`px-4 py-2 rounded-full border text-sm font-bold gap-2 flex items-center transition-all cursor-pointer ${
                                formData.aset === item.id 
                                ? 'bg-white text-primary border-white shadow-sm' 
                                : 'bg-transparent text-white/70 border-white/30 hover:border-white/60'
                              }`}
                            >
                              <item.icon size={14} />
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {view === 'pengeluaran' && (
                        <>
                          {/* Pajak (Opsional) */}
                          <div className="flex items-center gap-4">
                            <label className="w-24 text-sm font-bold uppercase tracking-wide text-lavender/70">Pajak</label>
                            <div className="flex-1 relative">
                              <span className="absolute left-0 bottom-2 text-sm font-bold opacity-50"><Percent size={14} /></span>
                              <input 
                                type="number" 
                                value={formData.pajak}
                                onChange={(e) => setFormData({...formData, pajak: e.target.value})}
                                placeholder="Opsional (contoh: 5000)"
                                className="w-full bg-transparent border-b border-white/20 pb-2 pl-6 text-sm font-bold font-sans focus:outline-none focus:border-white transition-colors"
                              />
                              <span className="absolute right-0 bottom-2 text-xs text-lavender/50">Rp</span>
                            </div>
                          </div>
                          {formData.pajak && parseFloat(formData.pajak) > 0 && (
                            <div className="-mt-3 ml-28 text-xs text-lavender/60">
                              Total: {formatIDR(parseFloat(formData.nominal || 0) + parseFloat(formData.pajak))} (Nominal + Pajak)
                            </div>
                          )}

                          {/* Tingkat Prioritas */}
                          {!simpleMode && (
                            <div className="flex flex-col gap-3 mt-2">
                              <label className="text-sm font-bold uppercase tracking-wide text-lavender/70">Tingkat Prioritas</label>
                              <div className="flex gap-3">
                                {[
                                  { id: 'tinggi', colorClass: 'bg-danger border-danger text-danger', activeClass: 'bg-danger border-danger text-white', label: 'Tinggi' },
                                  { id: 'sedang', colorClass: 'bg-warning border-warning text-warning', activeClass: 'bg-warning border-warning text-white', label: 'Sedang' },
                                  { id: 'rendah', colorClass: 'bg-success border-success text-success', activeClass: 'bg-success border-success text-white', label: 'Rendah' }
                                ].map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() => setFormData({...formData, prioritas: item.id})}
                                    className={`flex-1 py-3 rounded-full border-2 text-xs font-black uppercase transition-all cursor-pointer ${
                                      formData.prioritas === item.id
                                      ? `${item.activeClass} shadow-sm`
                                      : `bg-transparent ${item.colorClass.split(' ').slice(1).join(' ')} opacity-60 hover:opacity-90`
                                    }`}
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      <div className="mt-auto pt-6">
                         <button 
                           onClick={handleSave}
                           className="w-full py-3.5 bg-white text-dark-purple font-black uppercase tracking-[0.15em] rounded-full hover:bg-white/90 transition-all shadow-sm cursor-pointer"
                         >
                           Simpan Transaksi
                         </button>
                      </div>
                    </div>

                    <div className="bg-lavender-soft/10 rounded-2xl p-6 border border-white/5 flex flex-col gap-5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold uppercase tracking-wide text-white">Kategori</span>
                        <button 
                          onClick={() => setShowAddKategori(!showAddKategori)}
                          className="text-[10px] font-bold text-dark-purple bg-white px-3 py-1.5 rounded-full hover:bg-white/90 transition-all cursor-pointer flex items-center gap-1"
                        >
                          {showAddKategori ? <X size={10} /> : <Plus size={10} />}
                          {showAddKategori ? 'Batal' : 'Tambah Kategori'}
                        </button>
                      </div>

                      {/* Tambah Kategori Inline Form */}
                      <AnimatePresence>
                        {showAddKategori && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex gap-2 items-center bg-white/10 p-3 rounded-xl border border-white/10">
                              <input 
                                type="text"
                                value={newKategori}
                                onChange={(e) => setNewKategori(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newKategori.trim()) {
                                    if (!allKategori.includes(newKategori.trim())) {
                                      setCustomKategori([...customKategori, newKategori.trim()]);
                                      setFormData({...formData, kategori: newKategori.trim()});
                                    }
                                    setNewKategori('');
                                    setShowAddKategori(false);
                                  }
                                }}
                                placeholder="Nama kategori baru..."
                                className="flex-1 bg-transparent border-b border-white/20 pb-1 text-sm focus:outline-none focus:border-white transition-colors text-white placeholder-white/30"
                                autoFocus
                              />
                              <button 
                                onClick={() => {
                                  if (newKategori.trim() && !allKategori.includes(newKategori.trim())) {
                                    setCustomKategori([...customKategori, newKategori.trim()]);
                                    setFormData({...formData, kategori: newKategori.trim()});
                                  }
                                  setNewKategori('');
                                  setShowAddKategori(false);
                                }}
                                disabled={!newKategori.trim()}
                                className="px-3 py-1.5 bg-white text-dark-purple rounded-full text-[10px] font-bold uppercase tracking-wide hover:bg-white/90 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                Simpan
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex flex-wrap gap-2 content-start">
                         {allKategori.map((cat) => (
                           <button 
                             key={cat}
                             onClick={() => setFormData({...formData, kategori: cat})}
                             className={`px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
                               formData.kategori === cat 
                               ? 'bg-lavender text-dark-purple' 
                               : 'bg-white/10 text-white/60 hover:bg-white/20'
                             } ${customKategori.includes(cat) ? 'border border-dashed border-white/20' : ''}`}
                           >
                             {cat}
                           </button>
                         ))}
                      </div>
                      <div className="mt-auto p-4 bg-primary/30 rounded-2xl border border-white/[0.06]">
                        <div className="flex items-center gap-3 text-white/60 text-sm">
                          <MoreHorizontal size={16} />
                          Tips: Pilih kategori yang sesuai untuk analisis keuangan yang lebih akurat
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* SPK VIEW — Tagihan Rutin & Pembayaran Prioritas       */}
              {/* ═══════════════════════════════════════════════════════ */}
              {view === 'spk' && (
                <motion.div
                  key="spk"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full flex flex-col"
                >
                  {/* SPK Header */}
                  <div className="shrink-0 px-6 pt-5 pb-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setView('dashboard')}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-all text-white cursor-pointer"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <div>
                        <h2 className="text-xl font-sans font-bold tracking-tight flex items-center gap-3" style={{ letterSpacing: '-0.02em' }}>
                          <CalendarClock size={22} className="text-amber-400" />
                          {simpleMode ? 'Tagihan Rutin' : 'Tagihan Rutin & SPK'}
                        </h2>
                        <p className="text-xs text-lavender/60 mt-0.5">
                          {simpleMode ? 'Daftar tagihan yang perlu dibayar' : 'Ranking & saran otomatis berdasarkan perhitungan SPK (SAW)'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { resetPembayaranForm(); setShowPembayaranForm(true); }}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-bold text-sm flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer"
                    >
                      <Plus size={18} strokeWidth={3} />
                      Tambah Tagihan
                    </button>
                  </div>

                  {/* Summary Cards */}
                  <div className="shrink-0 px-6 pb-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-400/20 rounded-full flex items-center justify-center text-amber-400">
                            <Wallet size={20} />
                          </div>
                          <div>
                            <div className="text-xs text-lavender/70 uppercase tracking-wide font-medium">Total Tagihan</div>
                            <div className="text-lg font-sans font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{formatIDR(totalPembayaranBulanan)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center text-primary-light">
                            <TrendingUp size={20} />
                          </div>
                          <div>
                            <div className="text-xs text-lavender/70 uppercase tracking-wide font-medium">Total Item</div>
                            <div className="text-lg font-sans font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{pembayaranList.length} <span className="text-sm font-normal text-lavender/60">tagihan</span></div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pembayaranMendesak > 0 ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                            <ShieldAlert size={20} />
                          </div>
                          <div>
                            <div className="text-xs text-lavender/70 uppercase tracking-wide font-medium">Mendesak</div>
                            <div className={`text-lg font-sans font-bold ${pembayaranMendesak > 0 ? 'text-danger' : 'text-success'}`} style={{ letterSpacing: '-0.02em' }}>
                              {pembayaranMendesak} <span className="text-sm font-normal text-lavender/60">tagihan</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content: Ranking List + Saran */}
                  <div className="flex-1 min-h-0 px-6 pb-5 grid grid-cols-3 gap-4">
                    
                    {/* Ranking Pembayaran (2/3) */}
                    <div className="col-span-2 bg-white rounded-2xl p-5 shadow-md text-dark-purple flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                          <Award size={16} className="text-primary" />
                          {simpleMode ? 'Daftar Tagihan' : 'Ranking Tagihan Prioritas'}
                          <span className="text-[10px] font-normal opacity-40 px-2 py-0.5 bg-gray-100 rounded-full ml-1">
                            {pembayaranList.length} total
                          </span>
                        </h3>
                        {!simpleMode && (
                          <div className="flex items-center gap-2 text-[11px] text-gray-500">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-danger" /> ≤3 hari</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-warning" /> 4-10 hari</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success" /> &gt;10 hari</div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2 white-scrollbar pr-1">
                        {pembayaranList.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-4">
                            <CalendarClock size={48} strokeWidth={1.5} />
                            <div className="text-center">
                              <p className="font-medium text-sm">Belum ada tagihan rutin</p>
                              <p className="text-xs opacity-60 mt-1">Tambahkan untuk mulai tracking otomatis</p>
                            </div>
                          </div>
                        ) : (
                          rankedPembayaran.map((item, index) => (
                            <motion.div 
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${
                                item.prioritas === 'tinggi'
                                  ? 'bg-danger/5 border-danger/20 hover:border-danger/40'
                                  : item.prioritas === 'sedang'
                                    ? 'bg-warning/5 border-warning/20 hover:border-warning/40'
                                    : 'bg-success/5 border-success/20 hover:border-success/40'
                              }`}
                            >
                              {/* Rank Number */}
                              <div className="text-lg font-sans font-black text-gray-200 w-7 text-center shrink-0">
                                {index + 1}
                              </div>

                              {/* Priority Icon */}
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                item.prioritas === 'tinggi' ? 'bg-danger/20 text-danger' :
                                item.prioritas === 'sedang' ? 'bg-warning/20 text-warning' :
                                'bg-success/20 text-success'
                              } ${item.prioritas === 'tinggi' ? 'spk-pulse' : ''}`}>
                                {getPriorityIcon(item.prioritas)}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm">{item.nama}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                  <span>{item.kategori}</span>
                                  <span>·</span>
                                  <span>Jatuh tempo: {formatTanggalJatuhTempo(item)}</span>
                                  {item.keterangan && (
                                    <>
                                      <span>·</span>
                                      <span className="truncate max-w-[150px]">{item.keterangan}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Amount & countdown */}
                              <div className="text-right shrink-0">
                                <div className="font-sans font-bold text-sm tabular-nums">{formatIDR(item.nominal)}</div>
                                <div className={`text-xs font-bold ${
                                  item.prioritas === 'tinggi' ? 'text-danger' :
                                  item.prioritas === 'sedang' ? 'text-warning' :
                                  'text-success'
                                }`}>
                                  {item.labelPrioritas}
                                </div>
                              </div>

                              {/* Badge */}
                              <span className={`px-2.5 py-1 ${getPriorityBadge(item.prioritas)} rounded-full font-bold uppercase text-[11px] shrink-0`}>
                                {getPriorityLabel(item.prioritas)}
                              </span>

                              {/* Actions: Edit & Delete only */}
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                <button 
                                  onClick={() => handleEditPembayaran(item)}
                                  className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-lg transition-all cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button 
                                  onClick={() => handleDeletePembayaran(item.id)}
                                  className="p-1.5 hover:bg-danger/10 text-gray-400 hover:text-danger rounded-lg transition-all cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Saran Lengkap (1/3) */}
                    <div className="flex flex-col gap-4 min-h-0">
                      <div className="bg-white rounded-2xl p-5 shadow-md text-dark-purple flex-1 flex flex-col overflow-hidden">
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                          <Lightbulb size={16} className="text-amber-500" />
                          {simpleMode ? 'Tips Keuangan' : 'Saran Keuangan'}
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-3 white-scrollbar pr-1">
                          {saranList.map((s, i) => (
                            <div 
                              key={i} 
                              className={`p-3 rounded-xl border text-sm leading-relaxed ${
                                s.type === 'danger' ? 'bg-danger/5 border-danger/20' : 
                                s.type === 'warning' ? 'bg-warning/5 border-warning/20' : 
                                'bg-success/5 border-success/20'
                              }`}
                            >
                              <div className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide mb-1 ${
                                s.type === 'danger' ? 'text-danger' : s.type === 'warning' ? 'text-warning' : 'text-success'
                              }`}>
                                {s.icon}
                                {s.type === 'danger' ? 'Perhatian' : s.type === 'warning' ? 'Peringatan' : 'Bagus'}
                              </div>
                              <p className="text-dark-purple/70">{s.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Legend */}
                      {!simpleMode && (
                        <div className="bg-white/10 rounded-2xl p-4 border border-white/[0.06]">
                          <h4 className="text-xs font-bold uppercase tracking-wide text-lavender/70 mb-2">Cara Kerja SPK</h4>
                          <div className="space-y-2 text-xs text-lavender/60">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-danger shrink-0" />
                              <span><strong className="text-white/80">Tinggi</strong> — ≤3 hari / sudah lewat</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-warning shrink-0" />
                              <span><strong className="text-white/80">Sedang</strong> — 4-10 hari ke jatuh tempo</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-success shrink-0" />
                              <span><strong className="text-white/80">Rendah</strong> — &gt;10 hari ke jatuh tempo</span>
                            </div>
                            <p className="pt-1 border-t border-white/10 text-lavender/50">
                              Dihitung otomatis dari tanggal lokal perangkatmu
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ─── Pembayaran Form Modal ──────────────────────── */}
                  <AnimatePresence>
                    {showPembayaranForm && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center"
                      >
                        <div 
                          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                          onClick={() => { setShowPembayaranForm(false); resetPembayaranForm(); }}
                        />
                        
                        <motion.div
                          initial={{ scale: 0.9, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.9, y: 20 }}
                          className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-lg text-dark-purple z-10 max-h-[90%] overflow-y-auto"
                        >
                          {/* Modal Header */}
                          <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                            <h3 className="text-lg font-sans font-bold" style={{ letterSpacing: '-0.02em' }}>
                              {editingPembayaran ? 'Edit Tagihan' : 'Tambah Tagihan Baru'}
                            </h3>
                            <button 
                              onClick={() => { setShowPembayaranForm(false); resetPembayaranForm(); }}
                              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          {/* Form Fields */}
                          <div className="flex flex-col gap-4">
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5 block">Nama Tagihan</label>
                              <input 
                                type="text"
                                value={pembayaranForm.nama}
                                onChange={(e) => setPembayaranForm({...pembayaranForm, nama: e.target.value})}
                                placeholder="Contoh: Tagihan Listrik, Internet Kosan..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5 block">Nominal</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">Rp</span>
                                <input 
                                  type="number"
                                  value={pembayaranForm.nominal}
                                  onChange={(e) => setPembayaranForm({...pembayaranForm, nominal: e.target.value})}
                                  placeholder="0"
                                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold font-sans focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                              </div>
                            </div>

                            {/* Tanggal Jatuh Tempo — Full Date: Tanggal, Bulan, Tahun */}
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5 block">Tanggal Jatuh Tempo</label>
                              <div className="grid grid-cols-3 gap-2">
                                {/* Tanggal */}
                                <div>
                                  <label className="text-[8px] font-medium text-gray-300 mb-1 block uppercase">Tanggal</label>
                                  <input 
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={pembayaranForm.tanggal_jatuh_tempo}
                                    onChange={(e) => setPembayaranForm({...pembayaranForm, tanggal_jatuh_tempo: e.target.value})}
                                    placeholder="1-31"
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold font-sans focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-center"
                                  />
                                </div>
                                {/* Bulan */}
                                <div>
                                  <label className="text-[8px] font-medium text-gray-300 mb-1 block uppercase">Bulan</label>
                                  <select
                                    value={pembayaranForm.bulan_jatuh_tempo}
                                    onChange={(e) => setPembayaranForm({...pembayaranForm, bulan_jatuh_tempo: e.target.value})}
                                    className="w-full px-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                  >
                                    {NAMA_BULAN.map((nama, i) => (
                                      <option key={i + 1} value={i + 1}>{nama}</option>
                                    ))}
                                  </select>
                                </div>
                                {/* Tahun */}
                                <div>
                                  <label className="text-[8px] font-medium text-gray-300 mb-1 block uppercase">Tahun</label>
                                  <select
                                    value={pembayaranForm.tahun_jatuh_tempo}
                                    onChange={(e) => setPembayaranForm({...pembayaranForm, tahun_jatuh_tempo: e.target.value})}
                                    className="w-full px-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                  >
                                    {yearOptions.map((yr) => (
                                      <option key={yr} value={yr}>{yr}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <p className="text-[9px] text-gray-300 mt-1.5">
                                Prioritas dihitung otomatis dari tanggal lokal perangkatmu ({new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})
                              </p>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5 block">Kategori</label>
                              <div className="flex flex-wrap gap-2">
                                {['Tagihan', 'Kredit', 'Asuransi', 'Sewa', 'Lainnya'].map((cat) => (
                                  <button
                                    key={cat}
                                    onClick={() => setPembayaranForm({...pembayaranForm, kategori: cat})}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                      pembayaranForm.kategori === cat
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5 block">Keterangan (opsional)</label>
                              <input 
                                type="text"
                                value={pembayaranForm.keterangan}
                                onChange={(e) => setPembayaranForm({...pembayaranForm, keterangan: e.target.value})}
                                placeholder="Tambahkan catatan..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>
                          </div>

                          {/* Info Box */}
                          <div className="mt-4 p-3 bg-amber-50 border border-amber-200/50 rounded-xl">
                            <div className="flex items-start gap-2 text-[10px] text-amber-700">
                              <CalendarClock size={14} className="mt-0.5 shrink-0" />
                              <span>
                                Prioritas <strong>otomatis dihitung</strong> dari selisih tanggal jatuh tempo dengan tanggal lokal perangkatmu. 
                                ≤3 hari = <span className="text-danger font-bold">Tinggi</span>, 
                                4-10 hari = <span className="text-warning font-bold">Sedang</span>, 
                                &gt;10 hari = <span className="text-success font-bold">Rendah</span>.
                              </span>
                            </div>
                          </div>

                          {/* Submit */}
                          <button
                            onClick={handleSavePembayaran}
                            className="w-full mt-5 py-3.5 bg-primary hover:bg-primary-light text-white font-black uppercase tracking-[0.15em] rounded-full transition-all cursor-pointer"
                          >
                            {editingPembayaran ? 'Simpan Perubahan' : 'Tambah Tagihan'}
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* TABUNGAN VIEW — Savings Goals / Celengan              */}
              {/* ═══════════════════════════════════════════════════════ */}
              {view === 'tabungan' && (
                <motion.div
                  key="tabungan"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full flex flex-col"
                >
                  {/* Header */}
                  <div className="shrink-0 px-6 pt-5 pb-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setView('dashboard')} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-all text-white cursor-pointer">
                        <ChevronLeft size={24} />
                      </button>
                      <div>
                        <h2 className="text-xl font-sans font-bold tracking-tight flex items-center gap-3" style={{ letterSpacing: '-0.02em' }}>
                          <PiggyBank size={22} className="text-emerald-400" />
                          {simpleMode ? 'Celengan' : 'Target Tabungan'}
                        </h2>
                        <p className="text-xs text-lavender/60 mt-0.5">
                          {simpleMode ? 'Simpan uangmu untuk beli yang kamu mau!' : 'Tetapkan target & kumpulkan dana secara bertahap'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowTabunganForm(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-full font-bold text-sm flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer"
                    >
                      <Plus size={18} strokeWidth={3} />
                      {simpleMode ? 'Celengan Baru' : 'Target Baru'}
                    </button>
                  </div>

                  {/* Tabungan Grid */}
                  <div className="flex-1 min-h-0 px-6 pb-5 overflow-y-auto">
                    {tabunganList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-white/30 gap-4">
                        <PiggyBank size={64} strokeWidth={1.5} />
                        <div className="text-center">
                          <p className="font-medium text-lg">{simpleMode ? 'Belum ada celengan' : 'Belum ada target tabungan'}</p>
                          <p className="text-sm opacity-60 mt-1">Mulai menabung untuk impianmu!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tabunganList.map((t) => {
                          const persen = t.target_nominal > 0 ? Math.min((t.terkumpul / t.target_nominal) * 100, 100) : 0;
                          const tercapai = persen >= 100;
                          return (
                            <motion.div
                              key={t.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`relative bg-white rounded-2xl p-5 shadow-md text-dark-purple flex flex-col gap-4 ${tercapai ? 'bounce-in ring-2 ring-emerald-400/50' : ''}`}
                            >
                              {/* Sparkles for completed goals */}
                              {tercapai && (
                                <>
                                  <div className="absolute top-2 right-4 text-amber-400 sparkle-1"><Sparkles size={16} /></div>
                                  <div className="absolute top-6 right-2 text-emerald-400 sparkle-2"><Sparkles size={12} /></div>
                                  <div className="absolute top-2 right-10 text-purple-400 sparkle-3"><Sparkles size={10} /></div>
                                </>
                              )}

                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-3xl emoji-float">{t.emoji}</span>
                                  <div>
                                    <h4 className="font-bold text-sm">{t.nama}</h4>
                                    <p className="text-xs text-gray-400">{tercapai ? '🎉 Target Tercapai!' : `${persen.toFixed(0)}% terkumpul`}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteTabungan(t.id)}
                                  className="p-1.5 text-gray-300 hover:text-danger hover:bg-danger/10 rounded-lg transition-all cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              {/* Progress Bar */}
                              <div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full progress-bar-animated ${tercapai ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-primary to-primary-light'}`}
                                    style={{ width: `${persen}%` }}
                                  />
                                </div>
                                <div className="flex justify-between mt-2 text-xs">
                                  <span className="font-sans font-bold text-primary">{formatIDR(t.terkumpul)}</span>
                                  <span className="text-gray-400">/ {formatIDR(t.target_nominal)}</span>
                                </div>
                              </div>

                              {/* Actions */}
                              {showIsiTabungan === t.id ? (
                                <div className="flex flex-col gap-2">
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300">Rp</span>
                                    <input
                                      type="number"
                                      value={isiTabunganNominal}
                                      onChange={(e) => setIsiTabunganNominal(e.target.value)}
                                      placeholder="Jumlah"
                                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold font-sans focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                      autoFocus
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleIsiTabungan(t.id, isiTabunganNominal)}
                                      className="flex-1 py-2 bg-emerald-500 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1 hover:bg-emerald-600 transition-all cursor-pointer"
                                    >
                                      <Plus size={14} /> Isi
                                    </button>
                                    <button
                                      onClick={() => handleAmbilTabungan(t.id, isiTabunganNominal)}
                                      className="flex-1 py-2 bg-amber-500 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1 hover:bg-amber-600 transition-all cursor-pointer"
                                    >
                                      <Minus size={14} /> Ambil
                                    </button>
                                    <button
                                      onClick={() => { setShowIsiTabungan(null); setIsiTabunganNominal(''); }}
                                      className="px-3 py-2 bg-gray-100 text-gray-500 rounded-full text-xs font-bold hover:bg-gray-200 transition-all cursor-pointer"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setShowIsiTabungan(t.id)}
                                  className={`w-full py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                                    tercapai 
                                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                                  }`}
                                >
                                  {tercapai ? '✨ Kelola Dana' : `${simpleMode ? '🐷 Isi Celengan' : '💰 Isi Tabungan'}`}
                                </button>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Tabungan Form Modal */}
                  <AnimatePresence>
                    {showTabunganForm && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center"
                      >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTabunganForm(false)} />
                        <motion.div
                          initial={{ scale: 0.9, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.9, y: 20 }}
                          className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-lg text-dark-purple z-10"
                        >
                          <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                            <h3 className="text-lg font-sans font-bold" style={{ letterSpacing: '-0.02em' }}>{simpleMode ? 'Celengan Baru' : 'Target Tabungan Baru'}</h3>
                            <button onClick={() => setShowTabunganForm(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all cursor-pointer">
                              <X size={16} />
                            </button>
                          </div>

                          <div className="flex flex-col gap-4">
                            {/* Emoji Picker */}
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2 block">Pilih Ikon</label>
                              <div className="flex flex-wrap gap-2">
                                {EMOJI_OPTIONS.map(e => (
                                  <button
                                    key={e}
                                    onClick={() => setTabunganForm({...tabunganForm, emoji: e})}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                                      tabunganForm.emoji === e ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                  >
                                    {e}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5 block">{simpleMode ? 'Nama Celengan' : 'Nama Target'}</label>
                              <input
                                type="text"
                                value={tabunganForm.nama}
                                onChange={(e) => setTabunganForm({...tabunganForm, nama: e.target.value})}
                                placeholder={simpleMode ? 'Contoh: Beli Headphone, Main...' : 'Contoh: Dana Darurat, Laptop Baru...'}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5 block">Target Nominal</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">Rp</span>
                                <input
                                  type="number"
                                  value={tabunganForm.target_nominal}
                                  onChange={(e) => setTabunganForm({...tabunganForm, target_nominal: e.target.value})}
                                  placeholder="0"
                                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold font-sans focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={handleSaveTabungan}
                            className="w-full mt-5 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-black uppercase tracking-[0.15em] rounded-full hover:brightness-110 transition-all cursor-pointer"
                          >
                            {simpleMode ? 'Buat Celengan' : 'Buat Target'}
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* ANGGARAN VIEW — Category Budgeting                    */}
              {/* ═══════════════════════════════════════════════════════ */}
              {view === 'anggaran' && (
                <motion.div
                  key="anggaran"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full flex flex-col"
                >
                  {/* Header */}
                  <div className="shrink-0 px-6 pt-5 pb-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setView('dashboard')} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-all text-white cursor-pointer">
                        <ChevronLeft size={24} />
                      </button>
                      <div>
                        <h2 className="text-xl font-sans font-bold tracking-tight flex items-center gap-3" style={{ letterSpacing: '-0.02em' }}>
                          <Target size={22} className="text-blue-400" />
                          {simpleMode ? 'Batas Belanja' : 'Anggaran Kategori'}
                        </h2>
                        <p className="text-xs text-lavender/60 mt-0.5">
                          {simpleMode ? 'Atur berapa batas belanjamu per kategori' : 'Tetapkan batas pengeluaran bulanan per kategori'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowAnggaranForm(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-bold text-sm flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer"
                    >
                      <Plus size={18} strokeWidth={3} />
                      {simpleMode ? 'Tambah Batas' : 'Set Anggaran'}
                    </button>
                  </div>

                  {/* Anggaran List */}
                  <div className="flex-1 min-h-0 px-6 pb-5 overflow-y-auto">
                    {anggaranList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-white/30 gap-4">
                        <Target size={64} strokeWidth={1.5} />
                        <div className="text-center">
                          <p className="font-medium text-lg">{simpleMode ? 'Belum ada batas belanja' : 'Belum ada anggaran'}</p>
                          <p className="text-sm opacity-60 mt-1">Atur batas pengeluaran untuk kontrol keuanganmu</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {anggaranList.map((a) => {
                          const terpakai = pengeluaranPerKategori[a.kategori] || 0;
                          const persen = a.batas > 0 ? (terpakai / a.batas) * 100 : 0;
                          const sisa = a.batas - terpakai;
                          const colors = getBudgetColor(persen);

                          return (
                            <motion.div
                              key={a.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`bg-white rounded-2xl p-5 shadow-md text-dark-purple ${colors.glow}`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="font-bold text-sm">{a.kategori}</h4>
                                  <p className="text-xs text-gray-400">
                                    {NAMA_BULAN[a.bulan - 1]} {a.tahun}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                    persen > 100 ? 'bg-danger/10 text-danger' :
                                    persen > 70 ? 'bg-warning/10 text-warning' :
                                    'bg-success/10 text-success'
                                  }`}>
                                    {persen.toFixed(0)}%
                                  </span>
                                  <button
                                    onClick={() => handleDeleteAnggaran(a.id)}
                                    className="p-1.5 text-gray-300 hover:text-danger hover:bg-danger/10 rounded-lg transition-all cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                                <div
                                  className={`h-full rounded-full progress-bar-animated ${
                                    persen > 100 ? 'bg-gradient-to-r from-danger to-red-400' :
                                    persen > 70 ? 'bg-gradient-to-r from-warning to-amber-400' :
                                    'bg-gradient-to-r from-success to-emerald-400'
                                  }`}
                                  style={{ width: `${Math.min(persen, 100)}%` }}
                                />
                              </div>

                              <div className="flex justify-between text-xs">
                                <span className="font-sans font-bold">{formatIDR(terpakai)}</span>
                                <span className="text-gray-400">/ {formatIDR(a.batas)}</span>
                              </div>
                              <p className={`text-xs mt-1 font-medium ${sisa < 0 ? 'text-danger' : 'text-gray-400'}`}>
                                {sisa < 0 ? `Melebihi ${formatIDR(Math.abs(sisa))}` : `Sisa ${formatIDR(sisa)}`}
                              </p>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Anggaran Form Modal */}
                  <AnimatePresence>
                    {showAnggaranForm && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center"
                      >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAnggaranForm(false)} />
                        <motion.div
                          initial={{ scale: 0.9, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.9, y: 20 }}
                          className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-lg text-dark-purple z-10"
                        >
                          <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                            <h3 className="text-lg font-sans font-bold" style={{ letterSpacing: '-0.02em' }}>{simpleMode ? 'Set Batas Belanja' : 'Set Anggaran Kategori'}</h3>
                            <button onClick={() => setShowAnggaranForm(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all cursor-pointer">
                              <X size={16} />
                            </button>
                          </div>

                          <div className="flex flex-col gap-4">
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5 block">Kategori</label>
                              <div className="flex flex-wrap gap-2">
                                {allKategori.filter(k => k !== 'Gaji' && k !== 'Bonus').map(cat => (
                                  <button
                                    key={cat}
                                    onClick={() => setAnggaranForm({...anggaranForm, kategori: cat})}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                      anggaranForm.kategori === cat
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5 block">{simpleMode ? 'Batas Maksimal' : 'Batas Anggaran Bulanan'}</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">Rp</span>
                                <input
                                  type="number"
                                  value={anggaranForm.batas}
                                  onChange={(e) => setAnggaranForm({...anggaranForm, batas: e.target.value})}
                                  placeholder="0"
                                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold font-sans focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                              </div>
                              <p className="text-[9px] text-gray-300 mt-1.5">
                                Berlaku untuk bulan {NAMA_BULAN[new Date().getMonth()]} {new Date().getFullYear()}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={handleSaveAnggaran}
                            className="w-full mt-5 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black uppercase tracking-[0.15em] rounded-full hover:brightness-110 transition-all cursor-pointer"
                          >
                            {simpleMode ? 'Simpan Batas' : 'Simpan Anggaran'}
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ─── Split Bill Modal (accessible from any view) ──────── */}
          <AnimatePresence>
            {showSplitBill && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSplitBill(false)} />
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-lg text-dark-purple z-10"
                >
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                    <h3 className="text-lg font-sans font-bold flex items-center gap-2" style={{ letterSpacing: '-0.02em' }}>
                      <Users size={22} className="text-primary" />
                      Kalkulator Patungan
                    </h3>
                    <button onClick={() => setShowSplitBill(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5 block">Total Tagihan</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">Rp</span>
                        <input
                          type="number"
                          value={splitBillData.total}
                          onChange={(e) => setSplitBillData({...splitBillData, total: e.target.value})}
                          placeholder="0"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold font-sans focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5 block">Jumlah Orang</label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSplitBillData({...splitBillData, jumlahOrang: String(Math.max(2, parseInt(splitBillData.jumlahOrang || 2) - 1))})}
                          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all cursor-pointer"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          value={splitBillData.jumlahOrang}
                          onChange={(e) => setSplitBillData({...splitBillData, jumlahOrang: e.target.value})}
                          min="2"
                          className="w-20 py-2 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold font-sans text-center focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <button
                          onClick={() => setSplitBillData({...splitBillData, jumlahOrang: String(parseInt(splitBillData.jumlahOrang || 2) + 1)})}
                          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all cursor-pointer"
                        >
                          <Plus size={16} />
                        </button>
                        <span className="text-sm text-gray-400">orang</span>
                      </div>
                    </div>

                    {/* Result */}
                    {splitBillData.total && parseInt(splitBillData.jumlahOrang) >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-primary/5 border border-primary/15 rounded-2xl p-5 text-center"
                      >
                        <p className="text-xs text-gray-400 mb-1">Bayar per orang</p>
                        <p className="text-3xl font-sans font-bold text-primary" style={{ letterSpacing: '-0.03em' }}>
                          {formatIDR(Math.ceil(parseFloat(splitBillData.total) / parseInt(splitBillData.jumlahOrang)))}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {formatIDR(parseFloat(splitBillData.total))} ÷ {splitBillData.jumlahOrang} orang
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => setShowSplitBill(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-full hover:bg-gray-200 transition-all cursor-pointer"
                    >
                      Tutup
                    </button>
                    <button
                      onClick={handleSplitBillSave}
                      disabled={!splitBillData.total || parseInt(splitBillData.jumlahOrang) < 2}
                      className="flex-1 py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-full transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Receipt size={16} />
                      Catat Pengeluaran
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="px-6 py-2 border-t border-white/[0.06] text-[9px] font-medium text-white/20 flex justify-between tracking-wide">
            <span>Synced with SQLite Database Local</span>
            <span>© 2026 Finance Management System</span>
          </div>
        </div>
      )}

    </div>
  );
}
