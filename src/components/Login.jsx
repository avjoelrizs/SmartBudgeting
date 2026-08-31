import React, { useState } from 'react';
import { 
  Wallet, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../supabaseClient';

// Google Official 4-Color SVG Icon
const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.25 21.36 7.35 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const Login = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ========================================================
  // 1. SUPABASE LOGIN GOOGLE (OAuth)
  // ========================================================
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      setErrorMessage(err.message || 'Gagal masuk menggunakan Google.');
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================
  // 2. FORM SUBMIT (Email & Password: Login / Register)
  // ========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Silakan isi email dan kata sandi Anda.');
      return;
    }

    if (isRegisterMode) {
      if (!name.trim()) {
        setErrorMessage('Silakan masukkan nama lengkap Anda.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Kata sandi minimal 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Konfirmasi kata sandi tidak cocok.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isRegisterMode) {
        // SUPABASE REGISTER
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              name: name.trim(),
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data?.user) {
          try {
            await supabase.from('user_profile').upsert({
              user_id: data.user.id,
              name: name.trim(),
              monthly_income: 0,
              savings_target: 0,
              is_setup_complete: false,
              bio: 'Pengguna Catat Keuangan',
            }, { onConflict: 'user_id' });
          } catch (profileErr) {
            console.warn('Initial profile note:', profileErr);
          }

          if (data.session) {
            setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke aplikasi...');
            if (onLoginSuccess) {
              onLoginSuccess(data.user);
            }
          } else {
            setSuccessMessage('Pendaftaran berhasil! Silakan periksa email Anda atau masuk langsung.');
            setIsRegisterMode(false);
          }
        }
      } else {
        // SUPABASE LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          throw error;
        }

        if (data?.user && onLoginSuccess) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      let msg = err.message || 'Terjadi kesalahan pada autentikasi.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Email atau kata sandi salah. Silakan periksa kembali.';
      } else if (msg.includes('User already registered')) {
        msg = 'Email ini sudah terdaftar. Silakan login ke akun Anda.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Container Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scaleUp">
        
        {/* Brand & Logo Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <Wallet className="w-8 h-8 stroke-[2]" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              {isRegisterMode ? 'Buat Akun Baru' : 'Masuk ke Akun'}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {isRegisterMode 
                ? 'Daftar untuk mulai mencatat keuangan pribadi Anda' 
                : 'Kelola anggaran harian dan pantau pengeluaran Anda'}
            </p>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Input Email & Sandi */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Input Nama Lengkap (Hanya saat Register) */}
          {isRegisterMode && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative flex items-center p-3.5 bg-slate-950 rounded-2xl border border-slate-800 focus-within:border-emerald-500 transition-colors">
                <UserIcon className="w-4 h-4 text-slate-500 mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Contoh: Rizko Juli"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-600 focus:outline-none border-none"
                  required={isRegisterMode}
                />
              </div>
            </div>
          )}

          {/* Input Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <div className="relative flex items-center p-3.5 bg-slate-950 rounded-2xl border border-slate-800 focus-within:border-emerald-500 transition-colors">
              <Mail className="w-4 h-4 text-slate-500 mr-3 shrink-0" />
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-600 focus:outline-none border-none"
                required
              />
            </div>
          </div>

          {/* Input Kata Sandi */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Kata Sandi
            </label>
            <div className="relative flex items-center p-3.5 bg-slate-950 rounded-2xl border border-slate-800 focus-within:border-emerald-500 transition-colors">
              <Lock className="w-4 h-4 text-slate-500 mr-3 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-600 focus:outline-none border-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-slate-300 p-1 transition-colors cursor-pointer"
                title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Input Konfirmasi Sandi (Saat Register) */}
          {isRegisterMode && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative flex items-center p-3.5 bg-slate-950 rounded-2xl border border-slate-800 focus-within:border-emerald-500 transition-colors">
                <Lock className="w-4 h-4 text-slate-500 mr-3 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ulangi kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-600 focus:outline-none border-none"
                  required={isRegisterMode}
                />
              </div>
            </div>
          )}

          {/* Tombol Submit Form (Masuk ke Akun / Daftar Akun Baru) */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isRegisterMode ? 'Daftar Akun Baru' : 'Masuk ke Akun'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

        {/* Divider & Tombol Masuk Menggunakan Google di Bawah Form */}
        <div className="space-y-4 pt-1">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <span className="relative bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              atau
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-100 font-semibold text-sm transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-95 shadow-sm disabled:opacity-60"
          >
            <GoogleIcon />
            <span>{isRegisterMode ? 'Daftar dengan Google' : 'Masuk menggunakan Google'}</span>
          </button>
        </div>

        {/* Footer Info: Belum memiliki akun? Daftar sekarang */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            {isRegisterMode ? 'Sudah memiliki akun?' : 'Belum memiliki akun?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 cursor-pointer transition-colors"
            >
              {isRegisterMode ? 'Masuk di sini' : 'Daftar sekarang'}
            </button>
          </p>
        </div>

      </div>

    </div>
  );
};
