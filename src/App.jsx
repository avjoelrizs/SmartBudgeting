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
const getUserAvatarKey = (uid) => `catat_avatar_${uid || 'guest'}`;
const getUserTransactionsKey = (uid) => `catat_txs_${uid || 'guest'}`;

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
    name: 'Pengguna',
    bio: 'Pengguna Catat Keuangan',
  });

  // 5. Profile Image State (Default: null)
  const [profileImage, setProfileImage] = useState(null);

  // 6. Budget State: Default Semuanya NOL (0)
  const [budget, setBudget] = useState({
    monthlyIncome: 0,
    savingsTarget: 0,
  });

  // 7. Transactions State: Default Kosong []
  const [transactions, setTransactions] = useState([]);

  // 8. Modal Catat Transaksi Controls
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Helper untuk memuat cache instan berdasarkan user ID yang login saat ini
  const applyCachedUserData = useCallback((user) => {
    if (!user?.id) return;
    try {
      // 1. Status Setup
      const savedSetup = localStorage.getItem(getUserSetupKey(user.id));
      if (savedSetup === 'true' || savedSetup === true) {
        setIsSetupComplete(true);
      } else {
        setIsSetupComplete(false);
      }

      // 2. Budget
      const savedBudget = localStorage.getItem(getUserBudgetKey(user.id));
      if (savedBudget) {
        const parsed = JSON.parse(savedBudget);
        if (parsed && (parsed.monthlyIncome > 0 || parsed.savingsTarget > 0)) {
          setBudget(parsed);
          setIsSetupComplete(true);
        } else {
          setBudget({ monthlyIncome: 0, savingsTarget: 0 });
        }
      } else if (Number(user.user_metadata?.monthly_income) > 0 || Number(user.user_metadata?.savings_target) > 0) {
        const metaBudget = {
          monthlyIncome: Number(user.user_metadata.monthly_income) || 0,
          savingsTarget: Number(user.user_metadata.savings_target) || 0,
        };
        setBudget(metaBudget);
        setIsSetupComplete(true);
        try {
          localStorage.setItem(getUserBudgetKey(user.id), JSON.stringify(metaBudget));
          localStorage.setItem(getUserSetupKey(user.id), 'true');
        } catch (e) {}
      } else {
        setBudget({ monthlyIncome: 0, savingsTarget: 0 });
      }

      // 3. Transaksi Cache Terisolasi per User
      const savedTxs = localStorage.getItem(getUserTransactionsKey(user.id));
      if (savedTxs) {
        const parsedTxs = JSON.parse(savedTxs);
        if (Array.isArray(parsedTxs)) {
          setTransactions(parsedTxs);
          if (parsedTxs.length > 0) {
            setIsSetupComplete(true);
          }
        } else {
          setTransactions([]);
        }
      } else {
        setTransactions([]);
      }

      // 4. Profil User (Nama & Bio)
      const defaultName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Pengguna';
      const savedProfile = localStorage.getItem(getUserProfileKey(user.id));
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setUserProfile({
          name: parsedProfile.name || defaultName,
          bio: parsedProfile.bio || 'Pengguna Catat Keuangan',
        });
      } else {
        setUserProfile({
          name: defaultName,
          bio: 'Pengguna Catat Keuangan',
        });
      }

      // 5. Foto Profil Kustom
      const savedAvatar = localStorage.getItem(getUserAvatarKey(user.id));
      if (savedAvatar) {
        setProfileImage(savedAvatar);
      } else if (user.user_metadata?.avatar_url) {
        setProfileImage(user.user_metadata.avatar_url);
      } else {
        setProfileImage(null);
      }
    } catch (e) {
      console.error('Error applyCachedUserData:', e);
    }
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
      } else {
        setCurrentUser(null);
        setTransactions([]);
        setBudget({ monthlyIncome: 0, savingsTarget: 0 });
        setIsSetupComplete(false);
        setProfileImage(null);
        setUserProfile({ name: 'Pengguna', bio: 'Pengguna Catat Keuangan' });
      }
      setAuthLoading(false);
    }).catch(() => setAuthLoading(false));

    // 2. Pasang event listener perubahan status login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        applyCachedUserData(user);
      } else {
        // Bersihkan seluruh state ketika logout agar tidak bocor ke akun berikutnya
        setCurrentUser(null);
        setTransactions([]);
        setBudget({ monthlyIncome: 0, savingsTarget: 0 });
        setIsSetupComplete(false);
        setProfileImage(null);
        setUserProfile({ name: 'Pengguna', bio: 'Pengguna Catat Keuangan' });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [applyCachedUserData]);

  // Simpan transaksi secara terisolasi ke key user_id yang sedang aktif
  useEffect(() => {
    if (currentUser?.id) {
      try {
        localStorage.setItem(getUserTransactionsKey(currentUser.id), JSON.stringify(transactions));
      } catch (e) {}
    }
  }, [transactions, currentUser?.id]);

  // ============================================================================
  // SUPABASE: Ambil Data User Profile (Multi-User by user_id)
  // ============================================================================
  const fetchUserProfile = useCallback(async (userId) => {
    const uid = userId || currentUser?.id;
    if (!uid) return;

    try {
      const { data: profileData, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      const userMetaName = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Pengguna';

      if (!error && profileData) {
        const income = Number(profileData.monthly_income) || Number(currentUser?.user_metadata?.monthly_income) || 0;
        const savings = Number(profileData.savings_target) || Number(currentUser?.user_metadata?.savings_target) || 0;
        const isComplete = profileData.is_setup_complete !== undefined && profileData.is_setup_complete !== null
          ? Boolean(profileData.is_setup_complete)
          : (income > 0 || savings > 0);

        const finalName = profileData.name || userMetaName;

        setUserProfile({
          name: finalName,
          bio: profileData.bio || 'Pengguna Catat Keuangan',
        });

        // Hanya timpa budget jika bernilai > 0
        if (income > 0 || savings > 0) {
          setBudget({
            monthlyIncome: income,
            savingsTarget: savings,
          });
          try {
            localStorage.setItem(getUserBudgetKey(uid), JSON.stringify({ monthlyIncome: income, savingsTarget: savings }));
          } catch (e) {}
        }

        // Muat foto profil kustom yang pernah diunggah pengguna ke Supabase
        const customAvatar = profileData.avatar_url || profileData.avatar || currentUser?.user_metadata?.avatar_url || null;
        if (customAvatar) {
          setProfileImage(customAvatar);
          try {
            localStorage.setItem(getUserAvatarKey(uid), customAvatar);
          } catch (e) {}
        }

        if (isComplete) {
          setIsSetupComplete(true);
        }

        try {
          localStorage.setItem(getUserSetupKey(uid), JSON.stringify(isComplete));
          localStorage.setItem(getUserProfileKey(uid), JSON.stringify({
            name: finalName,
            bio: profileData.bio || 'Pengguna Catat Keuangan',
          }));
        } catch (e) {}
      } else {
        // User baru belum punya baris di cloud -> Pasang default nama dari metadata akun
        setUserProfile((prev) => ({
          name: userMetaName || prev.name,
          bio: prev.bio || 'Pengguna Catat Keuangan',
        }));
      }
    } catch (err) {
      console.error('Exception saat fetch user_profile:', err);
    }
  }, [currentUser]);

  // ============================================================================
  // SUPABASE: Simpan / Update User Profile (Multi-User by user_id)
  // ============================================================================
  const updateUserProfileInSupabase = async ({ name, monthly_income, savings_target, is_setup_complete, bio, avatar_url }) => {
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
      if (avatar_url !== undefined) {
        updatePayload.avatar_url = avatar_url;
      } else if (profileImage) {
        updatePayload.avatar_url = profileImage;
      }

      // 1. Simpan di cache lokal khusus user_id ini
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
        if (updatePayload.avatar_url) {
          localStorage.setItem(getUserAvatarKey(currentUser.id), updatePayload.avatar_url);
        }
      } catch (e) {}

      // 2. Simpan ke database Supabase KHUSUS user_id ini (TIDAK BOLEH menimpa user lain)
      const { data: existingRows } = await supabase
        .from('user_profile')
        .select('id')
        .eq('user_id', currentUser.id);

      if (existingRows && existingRows.length > 0) {
        await supabase
          .from('user_profile')
          .update(updatePayload)
          .eq('user_id', currentUser.id);
      } else {
        await supabase
          .from('user_profile')
          .insert([updatePayload]);
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
        try {
          localStorage.setItem(getUserTransactionsKey(uid), JSON.stringify(sanitized));
        } catch (e) {}

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

      // Simpan ke Supabase Auth User Metadata (Pasti Aman & Lintas Perangkat)
      try {
        await supabase.auth.updateUser({
          data: {
            monthly_income: newBudget.monthlyIncome,
            savings_target: newBudget.savingsTarget,
          },
        });
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

    if (currentUser?.id) {
      try {
        localStorage.setItem(getUserSetupKey(currentUser.id), 'true');
        localStorage.setItem(getUserBudgetKey(currentUser.id), JSON.stringify(newBudget));
      } catch (e) {}

      // Simpan ke Supabase Auth User Metadata (Pasti Aman & Lintas Perangkat)
      try {
        await supabase.auth.updateUser({
          data: {
            monthly_income: newBudget.monthlyIncome,
            savings_target: newBudget.savingsTarget,
          },
        });
      } catch (e) {}
    }

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
      avatar_url: profileImage || '',
    });
  };

  // Handler: Update Foto Profil (Simpan ke Cache & Cloud Supabase Auth Metadata)
  const handleUpdateProfileImage = async (newImage) => {
    setProfileImage(newImage);
    if (currentUser?.id) {
      try {
        if (newImage) {
          localStorage.setItem(getUserAvatarKey(currentUser.id), newImage);
        } else {
          localStorage.removeItem(getUserAvatarKey(currentUser.id));
        }
      } catch (e) {}
    }

    // 1. Simpan ke Supabase Auth User Metadata (Pasti Berhasil Lintas Perangkat 100%)
    try {
      await supabase.auth.updateUser({
        data: {
          avatar_url: newImage || '',
        },
      });
    } catch (e) {
      console.warn('Supabase auth metadata update note:', e);
    }

    // 2. Simpan juga ke user_profile table
    await updateUserProfileInSupabase({
      name: userProfile.name,
      monthly_income: budget.monthlyIncome,
      savings_target: budget.savingsTarget,
      is_setup_complete: isSetupComplete,
      bio: userProfile.bio,
      avatar_url: newImage || '',
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

    if (currentUser?.id) {
      try {
        localStorage.removeItem(getUserSetupKey(currentUser.id));
        localStorage.removeItem(getUserBudgetKey(currentUser.id));
        localStorage.removeItem(getUserAvatarKey(currentUser.id));
      } catch (e) {}
    }

    try {
      await updateUserProfileInSupabase({
        name: defaultUser.name,
        monthly_income: 0,
        savings_target: 0,
        is_setup_complete: false,
        bio: defaultUser.bio,
        avatar_url: '',
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
              onUpdateProfileImage={handleUpdateProfileImage}
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
