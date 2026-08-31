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

const STORAGE_KEY_SETUP = 'catatkeuangan_setup_v14';
const STORAGE_KEY_BUDGET = 'catatkeuangan_budget_v14';
const STORAGE_KEY_TXS = 'catatkeuangan_txs_v14';
const STORAGE_KEY_USER = 'catatkeuangan_user_v14';
const STORAGE_KEY_IMAGE = 'catatkeuangan_avatar_v14';

function MainApp() {
  // 1. Supabase Current User State
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 2. Navigation Tab State (Default: 'beranda')
  const [activeTab, setActiveTab] = useState('beranda');

  // 3. Onboarding Setup State (Default: false)
  const [isSetupComplete, setIsSetupComplete] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETUP);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return false;
  });

  // 4. User Profile State
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: 'Rizko Juli Afriyanto',
      bio: 'Mahasiswa Informatika, Universitas Amikom Purwokerto',
    };
  });

  // 5. Profile Image State (Default: null)
  const [profileImage, setProfileImage] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_IMAGE) || null;
    } catch (e) {}
    return null;
  });

  // 6. Budget State: Default Semuanya NOL (0)
  const [budget, setBudget] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUDGET);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      monthlyIncome: 0,
      savingsTarget: 0,
    };
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

  // ============================================================================
  // SUPABASE AUTH: Pantau Status Login Pengguna (onAuthStateChange & getSession)
  // ============================================================================
  useEffect(() => {
    // 1. Ambil session aktif saat pertama kali dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
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
  }, []);

  // Sync state to localStorage safely
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETUP, JSON.stringify(isSetupComplete));
    } catch (e) {}
  }, [isSetupComplete]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userProfile));
    } catch (e) {}
  }, [userProfile]);

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
      localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(budget));
    } catch (e) {}
  }, [budget]);

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
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (error) {
        console.warn('Info mengambil user_profile dari Supabase:', error.message);
      } else if (data) {
        const income = Number(data.monthly_income) || 0;
        const savings = Number(data.savings_target) || 0;
        const isComplete = data.is_setup_complete !== undefined && data.is_setup_complete !== null
          ? Boolean(data.is_setup_complete)
          : income > 0;

        setUserProfile((prev) => ({
          ...prev,
          name: data.name || currentUser?.user_metadata?.name || prev.name,
          bio: data.bio || prev.bio,
        }));

        setBudget({
          monthlyIncome: income,
          savingsTarget: savings,
        });

        setIsSetupComplete(isComplete);
      } else if (currentUser?.user_metadata?.name) {
        setUserProfile((prev) => ({
          ...prev,
          name: currentUser.user_metadata.name,
        }));
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

      // Gunakan upsert dengan user_id agar otomatis membuat jika belum ada
      const { error } = await supabase
        .from('user_profile')
        .upsert(updatePayload, { onConflict: 'user_id' });

      if (error) {
        console.warn('Gagal update user_profile di Supabase:', error.message);
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
      }
    } catch (err) {
      console.error('Supabase fetch exception:', err);
    }
  }, [currentUser]);

  // Panggil data profil dan transaksi saat user login
  useEffect(() => {
    if (currentUser?.id) {
      fetchUserProfile(currentUser.id);
      fetchTransactions(currentUser.id);
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
    // Bersihkan seluruh state lokal & local storage
    setCurrentUser(null);
    setTransactions([]);
    setBudget({ monthlyIncome: 0, savingsTarget: 0 });
    setIsSetupComplete(false);
    setProfileImage(null);
    try {
      localStorage.removeItem(STORAGE_KEY_SETUP);
      localStorage.removeItem(STORAGE_KEY_BUDGET);
      localStorage.removeItem(STORAGE_KEY_TXS);
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_IMAGE);
    } catch (e) {}
  };

  // Handler: Selesaikan Setup Awal Onboarding (Simpan ke Supabase)
  const handleCompleteSetup = async (newBudget) => {
    setBudget(newBudget);
    setIsSetupComplete(true);

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
  // LOADING SESSION CHECK
  // --------------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
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
        />
      </div>

      {/* 4. Layar Setup Wajib Onboarding (Jika isSetupComplete === false) */}
      {!isSetupComplete && (
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
