import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Download, 
  Trash2, 
  Database,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Pencil,
  Save,
  X,
  Camera
} from 'lucide-react';
import { CATEGORIES } from '../../data/dummyTransactions';

export const Akun = ({ 
  currentUser = null,
  userProfile = {
    name: 'Pengguna',
    bio: 'Pengguna Catat Keuangan',
  },
  onUpdateProfile,
  profileImage = null,
  onUpdateProfileImage,
  transactions = [], 
  onLoadDemoData,
  onClearAllTransactions,
  onResetData,
  onLogout
}) => {
  const fileInputRef = useRef(null);

  // State Profile Editing
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile?.name || 'Pengguna');
  const [bioInput, setBioInput] = useState(userProfile?.bio || 'Pengguna Catat Keuangan');

  // Sinkronkan input edit saat userProfile berubah (misal ganti akun login)
  useEffect(() => {
    if (userProfile?.name) setNameInput(userProfile.name);
    if (userProfile?.bio !== undefined) setBioInput(userProfile.bio);
  }, [userProfile?.name, userProfile?.bio]);

  // State Modals & Toasts
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Helper show toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 1. Unggah Foto Profil dengan Kompresi Ultra-Compact (128x128 ~5KB) agar 100% lolos ke Cloud Database
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 128;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to ultra-lightweight JPEG format (~5KB)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.72);

          if (onUpdateProfileImage) {
            onUpdateProfileImage(compressedBase64);
            triggerToast('Foto profil berhasil diunggah & disinkronkan!');
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Hapus Foto Profil (Kembali ke inisial huruf)
  const handleRemoveImage = (e) => {
    e.stopPropagation();
    if (onUpdateProfileImage) {
      onUpdateProfileImage(null);
      triggerToast('Foto profil telah dihapus');
    }
  };

  // 2. Simpan Perubahan Teks Profil
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      alert('Nama pengguna tidak boleh kosong');
      return;
    }

    if (onUpdateProfile) {
      onUpdateProfile({
        name: nameInput.trim(),
        bio: bioInput.trim() || 'Pengguna Catat Keuangan',
      });
    }

    setIsEditing(false);
    triggerToast('Profil berhasil diperbarui!');
  };

  // Batal Edit Profil
  const handleCancelEdit = () => {
    setNameInput(userProfile.name);
    setBioInput(userProfile.bio);
    setIsEditing(false);
  };

  // 3. Export Data ke format CSV
  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      alert('Tidak ada data transaksi untuk diekspor.');
      return;
    }

    const headers = ['ID', 'Tanggal', 'Waktu', 'Judul Transaksi', 'Kategori', 'Tipe', 'Nominal (Rp)'];
    const rows = transactions.map((tx) => {
      const categoryLabel = CATEGORIES[tx.category]?.label || tx.category || 'Lainnya';
      const typeLabel = tx.type === 'expense' ? 'Pengeluaran' : 'Pemasukan';
      
      return [
        `"${tx.id}"`,
        `"${tx.date || tx.dateLabel || ''}"`,
        `"${tx.time || ''}"`,
        `"${(tx.title || '').replace(/"/g, '""')}"`,
        `"${categoryLabel}"`,
        `"${typeLabel}"`,
        tx.amount || 0,
      ];
    });

    const csvString = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `catatkeuangan_transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerToast('File CSV berhasil diunduh ke perangkat Anda!');
  };

  // 4. Muat Data Demo
  const handleLoadDemo = () => {
    if (onLoadDemoData) {
      onLoadDemoData();
      triggerToast('Data demo berhasil dimuat!');
    }
  };

  // 5. Konfirmasi Hapus Semua Data
  const handleConfirmDelete = () => {
    if (onClearAllTransactions) {
      onClearAllTransactions();
      triggerToast('Seluruh riwayat transaksi telah dihapus.');
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Hidden File Input for Avatar Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleImageChange} 
        className="hidden" 
      />

      {/* 1. Header Profil (Interaktif dengan Ganti Foto & Edit Profil) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
        
        {/* Tombol Edit Profil di Pojok Kanan Atas */}
        {!isEditing && (
          <button
            onClick={() => {
              setNameInput(userProfile.name);
              setBioInput(userProfile.bio);
              setIsEditing(true);
            }}
            type="button"
            className="absolute top-5 right-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold transition-colors cursor-pointer active:scale-95"
            title="Edit Profil"
          >
            <Pencil className="w-3.5 h-3.5 text-emerald-400" />
            <span>Edit Profil</span>
          </button>
        )}

        {/* Tampilan Statis Profil */}
        {!isEditing ? (
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 pr-0 sm:pr-24">
            
            {/* Avatar dengan Hover Kamera Overlay */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer"
                title="Klik untuk ubah foto profil"
              >
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-slate-800 border-2 border-emerald-500/60 flex items-center justify-center font-extrabold text-slate-100 text-3xl shadow-sm overflow-hidden transition-transform group-hover:scale-[1.02]">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Foto Profil" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    (userProfile.name || 'R').charAt(0).toUpperCase()
                  )}
                </div>

                {/* Overlay Ikon Kamera (📷) saat di-hover */}
                <div className="absolute inset-0 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white cursor-pointer">
                  <Camera className="w-5 h-5 text-emerald-400" />
                  <span className="text-[9px] font-semibold mt-0.5">Ubah</span>
                </div>

                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>

              {/* Action Buttons for Avatar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  {profileImage ? 'Ganti Foto' : 'Unggah Foto'}
                </button>
                {profileImage && (
                  <>
                    <span className="text-slate-600 text-xs">•</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Hapus
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Info Nama, Status, & Bio */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-0.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight break-words">
                  {userProfile.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  Free Plan
                </span>
              </div>

              {currentUser?.email && (
                <p className="text-xs text-emerald-400/80 font-mono mb-1.5">
                  {currentUser.email}
                </p>
              )}

              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed break-words">
                {userProfile.bio}
              </p>

              <p className="text-[11px] text-slate-500 mt-2 font-mono">
                {transactions.length} total transaksi tercatat
              </p>
            </div>

          </div>
        ) : (
          /* Form Input Edit Profil */
          <form onSubmit={handleSaveProfile} className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Pencil className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  Ubah Informasi Profil
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Batal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Masukkan nama lengkap..."
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Bio / Status Pekerjaan / Kampus
              </label>
              <input
                type="text"
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="Contoh: Mahasiswa Informatika, Universitas Amikom Purwokerto"
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl font-bold text-xs text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Feedback Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Menu Pengaturan (List Style ala iOS / Android) */}
      <div className="space-y-4">
        
        {/* Group 1: Data & Penyimpanan */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Data & Penyimpanan
          </h3>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden divide-y divide-slate-800/80 shadow-sm">
            
            {/* Opsi: Muat Data Demo */}
            <button
              onClick={handleLoadDemo}
              type="button"
              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/60 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    Muat Data Demo
                  </h4>
                  <p className="text-xs text-slate-400">
                    Isi aplikasi dengan contoh transaksi dummy untuk simulasi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                Muat Data
              </div>
            </button>

            {/* Opsi: Export Data (CSV) */}
            <button
              onClick={handleExportCSV}
              type="button"
              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/60 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    Export Data (CSV)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Unduh seluruh riwayat transaksi ke file spreadsheet
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-slate-300 transition-colors">
                <Download className="w-4 h-4" />
              </div>
            </button>

          </div>
        </div>

        {/* Group 2: Zona Bahaya & Akun */}
        <div>
          <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider px-2 mb-2">
            Zona Akun & Data
          </h3>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden divide-y divide-slate-800/80 shadow-sm">
            {/* Opsi: Hapus Semua Data (Merah) */}
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              type="button"
              className="w-full flex items-center justify-between p-4 hover:bg-rose-500/10 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-rose-400">
                    Hapus Semua Data
                  </h4>
                  <p className="text-xs text-slate-500">
                    Hapus permanen seluruh riwayat transaksi
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
                Hapus
              </span>
            </button>

            {/* Opsi: Keluar Akun (Logout) */}
            {onLogout && (
              <button
                onClick={() => {
                  if (window.confirm('Keluar dari sesi akun saat ini?')) {
                    onLogout();
                  }
                }}
                type="button"
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300">
                      Keluar dari Akun
                    </h4>
                    <p className="text-xs text-slate-500">
                      Kembali ke halaman login
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700">
                  Logout
                </span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 3. Info Versi Aplikasi */}
      <div className="pt-6 pb-4 text-center">
        <p className="text-xs font-mono text-slate-600 tracking-wide">
          Versi Aplikasi: 1.0.0 (MVP)
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          Catat Keuangan • Built with React & Tailwind CSS
        </p>
      </div>

      {/* Modal Konfirmasi Hapus Semua Data */}
      {isDeleteModalOpen && (
        <div 
          onClick={() => setIsDeleteModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-scaleUp"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-100">
                Hapus Semua Riwayat?
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tindakan ini akan menghapus permanen seluruh catatan transaksi yang telah tersimpan. Data yang dihapus tidak dapat dikembalikan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                type="button"
                className="py-3 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                type="button"
                className="py-3 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer active:scale-95"
              >
                Ya, Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
