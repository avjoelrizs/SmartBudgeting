import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HeroDashboard } from './components/HeroDashboard';
import { TransactionHistory } from './components/TransactionHistory';
import { FAB } from './components/FAB';
import { TransactionModal } from './components/TransactionModal';
import { WelcomeSetup } from './components/WelcomeSetup';
import { BottomNav } from './components/BottomNav';
import { Login } from './components/Login';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Laporan } from './components/tabs/Laporan';
import { Dompet } from './components/tabs/Dompet';
import { Akun } from './components/tabs/Akun';
import { INITIAL_TRANSACTIONS } from './data/dummyTransactions';
import { getRemainingDaysInMonth, formatTime, formatIndonesianDate } from './utils/formatters';
import { supabase } from './supabaseClient';

const getUserSetupKey = (uid) => `catat_setup_${uid || 'guest'}`;
const getUserBudgetKey = (uid) => `catat_budget_${uid || 'guest'}`;
const getUserProfileKey = (uid) => `catat_user_${uid || 'guest'}`;
const STORAGE_KEY_TXS = 'catatkeuangan_txs_v14';
const STORAGE_KEY_IMAGE = 'catatkeuangan_avatar_v14';

function MainApp() {
  // 1. Supabase Current User State
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // 2. Navigation Tab State (Default: 'beranda')
  const [activeTab, setActiveTab] = useState('beranda');

  // 3. Onboarding Setup State (Default: false)
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // 4. User Profile State
  const [userProfile, setUserProfile] = useState({
    name: 'Rizko Juli Afriyanto',
    bio: 'Mahasiswa Informatika, Universitas Amikom Purwokerto',
  });

  // 5. Profile Image State (Default: null)
  const [profileImage, setProfileImage] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_IMAGE) || null;
    } catch (e) {}
    return null;
  });

  // 6. Budget State: Default Semuanya NOL (0)
  const [budget, setBudget] = useState({
    monthlyIncome: 0,
    savingsTarget: 0,
  });

  // 7. Transactions State: Default Kosong []
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TXS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // 8. Modal Catat Transaksi Controls
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Helper untuk memuat cache instan berdasarkan user ID
  const applyCachedUserData = useCallback((user) => {
    if (!user?.id) return;
    try {
      const savedSetup = localStorage.getItem(getUserSetupKey(user.id));
      if (savedSetup === 'true' || savedSetup === true) {
        setIsSetupComplete(true);
      }
      const savedBudget = localStorage.getItem(getUserBudgetKey(user.id));
      if (savedBudget) {
        const parsed = JSON.parse(savedBudget);
        if (parsed && (parsed.monthlyIncome > 0 || parsed.savingsTarget > 0)) {
          setBudget(parsed);
          setIsSetupComplete(true);
        }
      }
      const savedProfile = localStorage.getItem(getUserProfileKey(user.id));
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (e) {}
  }, []);

  // ============================================================================
  // SUPABASE AUTH: Pantau Status Login Pengguna (onAuthStateChange & getSession)
  // ============================================================================
  useEffect(() => {
    // 1. Ambil session aktif saat pertama kali dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        applyCachedUserData(session.user);
        if (session.user.user_metadata?.name) {
          setUserProfile((prev) => ({
            ...prev,
            name: session.user.user_metadata.name,
          }));
        }
      }
      setAuthLoading(false);
    }).catch(() => setAuthLoading(false));

    // 2. Pasang event listener perubahan status login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        applyCachedUserData(user);
      }
      if (user?.user_metadata?.name) {
        setUserProfile((prev) => ({
          ...prev,
          name: user.user_metadata.name,
        }));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [applyCachedUserData]);

  useEffect(() => {
    try {
      if (profileImage) {
        localStorage.setItem(STORAGE_KEY_IMAGE, profileImage);
      } else {
        localStorage.removeItem(STORAGE_KEY_IMAGE);
      }
    } catch (e) {}
  }, [profileImage]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(transactions));
    } catch (e) {}
  }, [transactions]);

  // ============================================================================
  // SUPABASE: Ambil Data User Profile (Multi-User by user_id)
  // ============================================================================
  const fetchUserProfile = useCallback(async (userId) => {
    const uid = userId || currentUser?.id;
    if (!uid) return;

    try {
      let profileData = null;

      // 1. Coba cari berdasarkan user_id spesifik
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (!error && data) {
        profileData = data;
      }

      // 2. Fallback: jika belum ada data di user_id, cari di id = 1 atau row pertama
      if (!profileData || (Number(profileData.monthly_income) === 0 && Number(profileData.savings_target) === 0)) {
        const { data: fallbackData } = await supabase
          .from('user_profile')
          .select('*')
          .order('id', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (fallbackData && (Number(fallbackData.monthly_income) > 0 || Number(fallbackData.savings_target) > 0)) {
          profileData = fallbackData;
        }
      }

      if (profileData) {
        const income = Number(profileData.monthly_income) || 0;
        const savings = Number(profileData.savings_target) || 0;
        const isComplete = profileData.is_setup_complete !== undefined && profileData.is_setup_complete !== null
          ? Boolean(profileData.is_setup_complete)
          : (income > 0 || savings > 0);

        setUserProfile((prev) => ({
          ...prev,
          name: profileData.name || currentUser?.user_metadata?.name || prev.name,
          bio: profileData.bio || prev.bio,
        }));

        setBudget({
          monthlyIncome: income,
          savingsTarget: savings,
        });

        if (isComplete) {
          setIsSetupComplete(true);
        }

        try {
          localStorage.setItem(getUserSetupKey(uid), JSON.stringify(isComplete));
          localStorage.setItem(getUserBudgetKey(uid), JSON.stringify({ monthlyIncome: income, savingsTarget: savings }));
          localStorage.setItem(getUserProfileKey(uid), JSON.stringify({
            name: profileData.name || currentUser?.user_metadata?.name || 'Rizko',
            bio: profileData.bio || '',
          }));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Exception saat fetch user_profile:', err);
    }
  }, [currentUser]);

  // ============================================================================
  // SUPABASE: Simpan / Update User Profile (Multi-User by user_id)
  // ============================================================================
  const updateUserProfileInSupabase = async ({ name, monthly_income, savings_target, is_setup_complete, bio }) => {
    if (!currentUser?.id) return;

    try {
      const updatePayload = {
        user_id: currentUser.id,
        name: name || userProfile.name,
        monthly_income: Number(monthly_income) || 0,
        savings_target: Number(savings_target) || 0,
        is_setup_complete: is_setup_complete !== undefined ? Boolean(is_setup_complete) : true,
      };

      if (bio !== undefined) {
        updatePayload.bio = bio;
      }

      // 1. Simpan di cache lokal terlebih dahulu agar selalu instan
      try {
        localStorage.setItem(getUserSetupKey(currentUser.id), 'true');
        localStorage.setItem(getUserBudgetKey(currentUser.id), JSON.stringify({
          monthlyIncome: updatePayload.monthly_income,
          savingsTarget: updatePayload.savings_target,
        }));
        localStorage.setItem(getUserProfileKey(currentUser.id), JSON.stringify({
          name: updatePayload.name,
          bio: updatePayload.bio || userProfile.bio,
        }));
      } catch (e) {}

      // 2. Simpan ke database Supabase dengan berbagai skema
      let isSuccess = false;

      // Coba upsert dengan user_id
      const { error: upsertErr } = await supabase
        .from('user_profile')
        .upsert(updatePayload, { onConflict: 'user_id' });

      if (!upsertErr) {
        isSuccess = true;
      } else {
        // Coba update by user_id
        const { error: updateErr } = await supabase
          .from('user_profile')
          .update(updatePayload)
          .eq('user_id', currentUser.id);

        if (!updateErr) isSuccess = true;
      }

      // Fallback: update tabel default row (id = 1) jika tabel belum disesuaikan per user_id
      if (!isSuccess) {
        const fallbackPayload = {
          name: updatePayload.name,
          monthly_income: updatePayload.monthly_income,
          savings_target: updatePayload.savings_target,
          is_setup_complete: updatePayload.is_setup_complete,
        };
        await supabase.from('user_profile').upsert({ id: 1, ...fallbackPayload });
      }
    } catch (err) {
      console.error('Exception saat update user_profile di Supabase:', err);
    }
  };

  // ============================================================================
  // SUPABASE: Fetch Data Transaksi Multi-User (.eq('user_id', user.id))
  // ============================================================================
  const fetchTransactions = useCallback(async (userId) => {
    const uid = userId || currentUser?.id;
    if (!uid) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', uid);

      if (error) {
        console.error('Gagal mengambil data dari Supabase:', error.message);
      } else if (data && Array.isArray(data)) {
        // Format ulang data secara aman
        const sanitized = data.map((item, index) => {
          const rawAmount = Number(item.amount);
          const safeAmount = isNaN(rawAmount) ? 0 : rawAmount;
          const safeDate = item.date || item.created_at || new Date().toISOString();
          const safeCategory = item.category ? String(item.category).trim() : 'other';
          const safeTitle = item.title ? String(item.title).trim() : 'Tanpa Judul';
          const safeType = item.type === 'income' ? 'income' : 'expense';

          return {
            id: item.id || `tx-${Date.now()}-${index}`,
            user_id: item.user_id || uid,
            title: safeTitle,
            amount: safeAmount,
            type: safeType,
            category: safeCategory,
            date: safeDate,
            time: item.time || formatTime(safeDate),
            dateLabel: item.dateLabel || formatIndonesianDate(safeDate),
          };
        });

        // Urutkan transaksi terbaru di atas
        sanitized.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        setTransactions(sanitized);

        // Jika akun ini sudah memiliki riwayat transaksi di database, otomatis anggap setup sudah selesai
        if (sanitized.length > 0) {
          setIsSetupComplete(true);
          try {
            localStorage.setItem(getUserSetupKey(uid), 'true');
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Supabase fetch exception:', err);
    }
  }, [currentUser]);

  // Panggil data profil dan transaksi saat user login dengan loading tracking
  useEffect(() => {
    if (currentUser?.id) {
      setIsDataLoading(true);
      Promise.all([
        fetchUserProfile(currentUser.id),
        fetchTransactions(currentUser.id),
      ]).finally(() => {
        setIsDataLoading(false);
      });
    } else {
      setIsDataLoading(false);
    }
  }, [currentUser, fetchUserProfile, fetchTransactions]);

  // Sisa Hari Bulan Ini Safely
  const remainingDays = useMemo(() => {
    try {
      return getRemainingDaysInMonth(new Date());
    } catch (e) {
      return 30;
    }
  }, []);

  // Perhitungan Logika Keuangan Real-Time (Safe Try-Catch)
  const { maxSpendingBudget, totalExpense, sisaAnggaran, dailyBudgetLimit } = useMemo(() => {
    try {
      const incomeNum = Number(budget?.monthlyIncome) || 0;
      const savingsNum = Number(budget?.savingsTarget) || 0;
      const baseBudget = Math.max(0, incomeNum - savingsNum);

      let extraIncome = 0;
      let expenseSum = 0;

      if (Array.isArray(transactions)) {
        transactions.forEach((tx) => {
          if (!tx) return;
          const amt = Number(tx.amount) || 0;
          if (tx.type === 'income') {
            extraIncome += amt;
          } else if (tx.type === 'expense') {
            expenseSum += amt;
          }
        });
      }

      const totalMaxBudget = baseBudget + extraIncome;
      const remainingBudget = totalMaxBudget - expenseSum;
      const safeDailyLimit = remainingBudget > 0 
        ? Math.floor(remainingBudget / (remainingDays || 1)) 
        : 0;

      return {
        maxSpendingBudget: totalMaxBudget,
        totalExpense: expenseSum,
        sisaAnggaran: remainingBudget,
        dailyBudgetLimit: safeDailyLimit,
      };
    } catch (e) {
      console.error('Error calculating financial metrics:', e);
      return {
        maxSpendingBudget: 0,
        totalExpense: 0,
        sisaAnggaran: 0,
        dailyBudgetLimit: 0,
      };
    }
  }, [budget, transactions, remainingDays]);

  // ============================================================================
  // SUPABASE: Tambah Transaksi Baru Menyertakan user_id: user.id
  // ============================================================================
  const handleAddTransaction = async (newTransaction) => {
    if (!currentUser?.id) {
      alert('Silakan login terlebih dahulu untuk menambah transaksi.');
      return;
    }

    const rawAmount = Number(newTransaction.amount);
    const safeAmount = isNaN(rawAmount) ? 0 : rawAmount;
    const safeDate = newTransaction.date || new Date().toISOString();

    const payload = {
      user_id: currentUser.id,
      title: (newTransaction.title || 'Tanpa Judul').trim(),
      amount: safeAmount,
      type: newTransaction.type === 'income' ? 'income' : 'expense',
      category: newTransaction.category || 'other',
      date: safeDate,
    };

    // Optimistic UI update
    const localTx = {
      id: newTransaction.id || `tx-${Date.now()}`,
      ...payload,
      time: newTransaction.time || formatTime(safeDate),
      dateLabel: newTransaction.dateLabel || formatIndonesianDate(safeDate),
    };
    setTransactions((prev) => [localTx, ...(Array.isArray(prev) ? prev : [])]);

    // Kirim payload ke Supabase & tangkap error secara jelas
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([payload])
        .select();

      if (error) {
        console.error('Gagal simpan ke Supabase:', error.message);
        alert('Error Supabase: ' + error.message);
      } else {
        // Panggil ulang data dari Supabase agar transaksi langsung tersinkron
        await fetchTransactions(currentUser.id);
      }
    } catch (err) {
      console.error('Exception saat simpan ke Supabase:', err);
    }
  };

  // ============================================================================
  // SUPABASE: Hapus Transaksi Berdasarkan ID di Database
  // ============================================================================
  const handleDeleteTransaction = async (id) => {
    try {
      // 1. Kirim perintah API delete ke Supabase terlebih dahulu
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      // 2. Penanganan error: Jika error terjadi, tampilkan alert dan hentikan fungsi
      if (error) {
        console.error('Gagal menghapus data di server:', error.message);
        alert('Gagal menghapus data di server: ' + error.message);
        return;
      }

      // 3. Jika proses ke Supabase berhasil, baru hilangkan data dari UI & panggil ulang fetchTransactions
      setTransactions((prev) => (Array.isArray(prev) ? prev.filter((tx) => tx && tx.id !== id) : []));
      if (currentUser?.id) {
        await fetchTransactions(currentUser.id);
      }
    } catch (err) {
      console.error('Exception saat menghapus dari Supabase:', err);
      alert('Gagal menghapus data di server');
    }
  };

  // Handler: Login / Register Berhasil
  const handleLoginSuccess = (userAuth) => {
    setCurrentUser(userAuth);
    if (userAuth) {
      applyCachedUserData(userAuth);
    }
    if (userAuth?.user_metadata?.name) {
      setUserProfile((prev) => ({
        ...prev,
        name: userAuth.user_metadata.name,
      }));
    }
  };

  // ============================================================================
  // SUPABASE AUTH: Fitur Logout (supabase.auth.signOut())
  // ============================================================================
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error:', e);
    }
    // Bersihkan seluruh state aktif memori
    setCurrentUser(null);
    setTransactions([]);
    setBudget({ monthlyIncome: 0, savingsTarget: 0 });
    setIsSetupComplete(false);
    setProfileImage(null);
  };

  // Handler: Selesaikan Setup Awal Onboarding (Simpan ke Supabase)
  const handleCompleteSetup = async (newBudget) => {
    setBudget(newBudget);
    setIsSetupComplete(true);

    if (currentUser?.id) {
      try {
        localStorage.setItem(getUserSetupKey(currentUser.id), 'true');
        localStorage.setItem(getUserBudgetKey(currentUser.id), JSON.stringify(newBudget));
      } catch (e) {}
    }

    await updateUserProfileInSupabase({
      name: userProfile.name,
      monthly_income: newBudget.monthlyIncome,
      savings_target: newBudget.savingsTarget,
      is_setup_complete: true,
    });
  };

  // Handler: Simpan / Edit Budget dari Dompet.jsx (Simpan ke Supabase)
  const handleSaveBudget = async (newBudget) => {
    setBudget(newBudget);

    await updateUserProfileInSupabase({
      name: userProfile.name,
      monthly_income: newBudget.monthlyIncome,
      savings_target: newBudget.savingsTarget,
      is_setup_complete: true,
    });
  };

  // Handler: Update Profil Nama / Bio dari Akun.jsx (Simpan ke Supabase)
  const handleUpdateProfile = async (newProfile) => {
    setUserProfile(newProfile);

    await updateUserProfileInSupabase({
      name: newProfile.name,
      monthly_income: budget.monthlyIncome,
      savings_target: budget.savingsTarget,
      is_setup_complete: isSetupComplete,
      bio: newProfile.bio,
    });
  };

  // Handler: Muat Data Demo
  const handleLoadDemoData = async () => {
    setTransactions(INITIAL_TRANSACTIONS);
    if (!isSetupComplete || budget.monthlyIncome === 0) {
      const demoBudget = { monthlyIncome: 2000000, savingsTarget: 500000 };
      setBudget(demoBudget);
      setIsSetupComplete(true);
      await updateUserProfileInSupabase({
        name: userProfile.name,
        monthly_income: demoBudget.monthlyIncome,
        savings_target: demoBudget.savingsTarget,
        is_setup_complete: true,
      });
    }

    try {
      localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(INITIAL_TRANSACTIONS));
    } catch (e) {}
  };

  // Handler: Hapus Semua Data Transaksi
  const handleClearAllTransactions = async () => {
    setTransactions([]);
    try {
      localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify([]));
      if (currentUser?.id) {
        await supabase.from('transactions').delete().eq('user_id', currentUser.id);
      }
    } catch (e) {}
  };

  // Handler: Reset Data Keseluruhan
  const handleResetData = async () => {
    const defaultUser = {
      name: currentUser?.user_metadata?.name || 'Rizko Juli Afriyanto',
      bio: 'Mahasiswa Informatika, Universitas Amikom Purwokerto',
    };
    setUserProfile(defaultUser);
    setProfileImage(null);
    setBudget({ monthlyIncome: 0, savingsTarget: 0 });
    setTransactions([]);
    setIsSetupComplete(false);

    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(defaultUser));
      localStorage.removeItem(STORAGE_KEY_IMAGE);
      localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify({ monthlyIncome: 0, savingsTarget: 0 }));
      localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_SETUP, JSON.stringify(false));
      
      await updateUserProfileInSupabase({
        name: defaultUser.name,
        monthly_income: 0,
        savings_target: 0,
        is_setup_complete: false,
        bio: defaultUser.bio,
      });
    } catch (e) {}
  };

  // --------------------------------------------------------------------------
  // LOADING SESSION & DATA CHECK
  // --------------------------------------------------------------------------
  if (authLoading || (currentUser && isDataLoading)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium animate-pulse">Menyiapkan data akun Anda...</p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // JIKA BELUM LOGIN: TAMPILKAN FORM LOGIN & REGISTER
  // --------------------------------------------------------------------------
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // --------------------------------------------------------------------------
  // JIKA SUDAH LOGIN: TAMPILKAN DASHBOARD APLIKASI
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-emerald-500 selection:text-slate-950 flex">
      
      {/* 1. Desktop Sidebar Navigation (Collapsible) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col justify-between min-w-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 lg:pb-12 flex-1">
          
          {/* Minimalist Top Header Bar */}
          <div className="pb-4 sm:pb-5 border-b border-slate-800 mb-6">
            <Header 
              userName={userProfile?.name ? (userProfile.name.split(' ')[0] || userProfile.name) : (currentUser?.email?.split('@')[0] || 'Rizko')}
              profileImage={profileImage}
            />
          </div>

          {/* Conditional Active Tab Rendering */}
          {activeTab === 'beranda' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Kolom Kiri: Hero Dashboard Card */}
              <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
                <HeroDashboard
                  dailyLimit={dailyBudgetLimit}
                  sisaAnggaran={sisaAnggaran}
                  maxSpendingBudget={maxSpendingBudget}
                  savingsTarget={budget?.savingsTarget || 0}
                  totalExpense={totalExpense}
                  remainingDays={remainingDays}
                  onEditBudget={() => setActiveTab('dompet')}
                />
              </div>

              {/* Kolom Kanan: Riwayat Transaksi */}
              <div className="lg:col-span-7">
                <TransactionHistory
                  transactions={transactions}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              </div>
            </div>
          )}

          {activeTab === 'laporan' && (
            <Laporan 
              transactions={transactions} 
              totalExpense={totalExpense}
              budget={budget}
            />
          )}

          {activeTab === 'dompet' && (
            <Dompet 
              budget={budget} 
              onSaveBudget={handleSaveBudget}
              sisaAnggaran={sisaAnggaran} 
            />
          )}

          {activeTab === 'akun' && (
            <Akun 
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              profileImage={profileImage}
              onUpdateProfileImage={setProfileImage}
              transactions={transactions}
              onLoadDemoData={handleLoadDemoData}
              onClearAllTransactions={handleClearAllTransactions}
              onResetData={handleResetData}
              onLogout={handleLogout}
            />
          )}

        </div>
      </main>

      {/* Single Solid Green FAB (+) for Adding Transactions */}
      <FAB onClick={() => setIsTransactionModalOpen(true)} />

      {/* 3. Mobile Bottom Navigation (Hidden on Desktop) */}
      <div className="lg:hidden">
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenAddModal={() => setIsTransactionModalOpen(true)}
        />
      </div>

      {/* 4. Layar Setup Wajib Onboarding (Jika isSetupComplete === false) */}
      {!isDataLoading && !isSetupComplete && (
        <WelcomeSetup onCompleteSetup={handleCompleteSetup} />
      )}

      {/* Modal Catat Transaksi (FAB +) */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

    </div>
  );
}

// Wrap with ErrorBoundary to prevent blank black screen crashes
export function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

export default App;
