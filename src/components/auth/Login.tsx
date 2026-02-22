import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, Lock, Eye, EyeOff, Sparkles, ArrowLeft, LogIn, Palette } from 'lucide-react';
import { useTheme, THEMES, ThemeKey } from '../../hooks/useTheme';

type LoginMethod = 'email' | 'phone';

const Login = () => {
    const { c, theme, setTheme } = useTheme();
    const themeKeys = Object.keys(THEMES) as ThemeKey[];
    const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');

    // Email login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Phone login state
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<string | null>(null);

    // Unified login state
    const [identifier, setIdentifier] = useState('');

    // Shared state
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const isTestMode = import.meta.env.VITE_AUTH_TEST_MODE === 'true';

    // --- Unified Login (Test Mode) ---
    const handleUnifiedLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let isPhone = false;
            let loginIdentifier = identifier.trim();

            if (/^[\d+]+$/.test(loginIdentifier)) {
                isPhone = true;
                if (!loginIdentifier.startsWith('+')) {
                    loginIdentifier = `+966${loginIdentifier.replace(/^0/, '')}`;
                }
            }

            const credentials = isPhone
                ? { phone: loginIdentifier, password }
                : { email: loginIdentifier, password };

            const { error: signInError } = await supabase.auth.signInWithPassword(credentials);
            if (signInError) throw signInError;
            navigate('/');
        } catch (err: any) {
            console.error(err);
            if (err.message?.includes('Invalid login credentials')) {
                setError('المعرف أو كلمة المرور غير صحيحة');
            } else if (err.message?.includes('Email not confirmed')) {
                setError('البريد غير مؤكد (تجاوز هذا الخطأ يتطلب الإعداد المسبق)');
            } else {
                setError(err.message || 'فشل تسجيل الدخول');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- Email Login ---
    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (signInError) throw signInError;
            navigate('/');
        } catch (err: any) {
            console.error(err);
            if (err.message?.includes('Invalid login credentials')) {
                setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            } else {
                setError(err.message || 'فشل تسجيل الدخول');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- Phone OTP Login ---
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+966${phoneNumber.replace(/^0/, '')}`;
            const { error: otpError } = await supabase.auth.signInWithOtp({
                phone: formattedPhone
            });
            if (otpError) throw otpError;
            setConfirmationResult(formattedPhone);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "فشل إرسال الرمز");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                phone: confirmationResult!,
                token: verificationCode,
                type: 'sms'
            });
            if (verifyError) throw verifyError;
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError("الرمز غير صحيح");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'فشل تسجيل الدخول بواسطة جوجل');
            setIsLoading(false);
        }
    };

    // If test mode is enabled, we force the UI to the unified login (no toggle).
    // Otherwise keep standard Email / Phone toggle.

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden transition-colors duration-500" dir="rtl" style={{ backgroundColor: c.authBgFrom }}>
            {/* Animated gradient background */}
            <div
                className="absolute inset-0 opacity-80 transition-all duration-500"
                style={{ background: `linear-gradient(to bottom right, ${c.authBgFrom}, ${c.authBgVia}, ${c.authBgTo})` }}
            />
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full filter blur-3xl opacity-40 animate-pulse transition-colors duration-500" style={{ backgroundColor: c.authBlob1 }} />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full filter blur-3xl opacity-40 animate-pulse transition-colors duration-500" style={{ backgroundColor: c.authBlob2, animationDelay: '2s' }} />
            <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full filter blur-3xl opacity-30 animate-pulse transition-colors duration-500" style={{ backgroundColor: c.authBlob3, animationDelay: '4s' }} />

            <div className="w-full max-w-sm relative z-10 flex flex-col gap-6">
                {/* Logo / Header */}
                <div className="text-center">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl transform hover:scale-105 transition-all duration-500"
                        style={{ background: `linear-gradient(to bottom right, ${c.gradientFrom}, ${c.gradientTo})`, boxShadow: `0 20px 25px -5px ${c.primaryShadow}` }}
                    >
                        <Sparkles className="text-[#ffffff]" size={28} />
                    </div>
                    <h1 className="text-2xl font-black" style={{ color: c.heading }}>تسجيل الدخول</h1>
                    <p className="text-sm mt-1" style={{ color: c.muted }}>مرحباً بعودتك إلى مُسابقَة</p>
                    {isTestMode && <p className="text-amber-600 text-xs font-bold mt-2 bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-200">الوضع التجريبي نشط: استخدم البريد أو الجوال مباشرة مع كلمة المرور</p>}
                </div>

                {/* Card */}
                <div
                    className="p-6 rounded-3xl shadow-xl backdrop-blur-xl border transition-colors duration-500"
                    style={{ backgroundColor: c.authCard, borderColor: c.authCardBorder, boxShadow: `0 20px 25px -5px ${c.primaryShadow}` }}
                >
                    {/* Method Toggle - Hidden in Test Mode */}
                    {!isTestMode && (
                        <div className="flex rounded-xl p-1 mb-5" style={{ backgroundColor: c.toggleBg }}>
                            <button
                                type="button"
                                onClick={() => { setLoginMethod('email'); setError(''); setConfirmationResult(null); }}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${loginMethod === 'email' ? 'shadow-sm' : ''}`}
                                style={{
                                    backgroundColor: loginMethod === 'email' ? c.toggleActive : 'transparent',
                                    color: loginMethod === 'email' ? c.primary : c.muted
                                }}
                            >
                                <Mail size={16} />
                                البريد الإلكتروني
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLoginMethod('phone'); setError(''); }}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${loginMethod === 'phone' ? 'shadow-sm' : ''}`}
                                style={{
                                    backgroundColor: loginMethod === 'phone' ? c.toggleActive : 'transparent',
                                    color: loginMethod === 'phone' ? c.primary : c.muted
                                }}
                            >
                                <Phone size={16} />
                                رقم الجوال
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Unified Login Form (Test Mode) */}
                    {isTestMode && (
                        <form onSubmit={handleUnifiedLogin} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1.5">البريد الإلكتروني أو الجوال</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="البريد أو 05XXXXXXXX"
                                        className="w-full p-3 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-left"
                                        dir="ltr"
                                        value={identifier}
                                        onChange={e => setIdentifier(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1.5">كلمة المرور</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="w-full p-3 pr-10 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white/50 backdrop-blur-sm transition-all"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95"
                                style={{ background: `linear-gradient(to left, ${c.gradientFrom}, ${c.gradientTo})`, boxShadow: `0 10px 15px -3px ${c.primaryShadow}` }}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <LogIn size={20} />
                                        دخول سريع
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Email Login Form */}
                    {!isTestMode && loginMethod === 'email' && (
                        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1.5">البريد الإلكتروني</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        placeholder="example@email.com"
                                        className="w-full p-3 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-left"
                                        dir="ltr"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1.5">كلمة المرور</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="w-full p-3 pr-10 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white/50 backdrop-blur-sm transition-all"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95"
                                style={{ background: `linear-gradient(to left, ${c.gradientFrom}, ${c.gradientTo})`, boxShadow: `0 10px 15px -3px ${c.primaryShadow}` }}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <LogIn size={20} />
                                        تسجيل الدخول
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Phone Login Form */}
                    {!isTestMode && loginMethod === 'phone' && !confirmationResult && (
                        <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1.5">رقم الجوال (السعودي)</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="tel"
                                        placeholder="05XXXXXXXX"
                                        className="w-full p-3 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-left"
                                        dir="ltr"
                                        value={phoneNumber}
                                        onChange={e => setPhoneNumber(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div id="recaptcha-container"></div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95"
                                style={{ background: `linear-gradient(to left, ${c.gradientFrom}, ${c.gradientTo})`, boxShadow: `0 10px 15px -3px ${c.primaryShadow}` }}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    'إرسال رمز التحقق'
                                )}
                            </button>
                        </form>
                    )}

                    {/* OTP Verification */}
                    {loginMethod === 'phone' && confirmationResult && (
                        <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
                            <div className="text-center mb-2">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Phone size={24} className="text-emerald-600" />
                                </div>
                                <p className="text-sm text-slate-500">تم إرسال رمز التحقق إلى رقمك</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1.5">رمز التحقق (OTP)</label>
                                <input
                                    type="text"
                                    placeholder="123456"
                                    className="w-full p-3 text-center tracking-[0.5em] text-lg font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white/50 backdrop-blur-sm transition-all"
                                    dir="ltr"
                                    value={verificationCode}
                                    onChange={e => setVerificationCode(e.target.value)}
                                    required
                                    maxLength={6}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95"
                                style={{ background: `linear-gradient(to left, ${c.gradientFrom}, ${c.gradientTo})`, boxShadow: `0 10px 15px -3px ${c.primaryShadow}` }}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    'تحقق وادخل'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmationResult(null)}
                                className="text-sm transition"
                                style={{ color: c.muted }}
                            >
                                إعادة إرسال الرمز
                            </button>
                        </form>
                    )}

                    {/* Google Login Section */}
                    {(!confirmationResult) && (
                        <div className="mt-6">
                            <div className="relative flex items-center mb-5">
                                <div className="flex-grow border-t border-slate-200"></div>
                                <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">أو</span>
                                <div className="flex-grow border-t border-slate-200"></div>
                            </div>
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full py-3.5 bg-white border-2 border-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-95 shadow-sm"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                تسجيل الدخول باستخدام Google
                            </button>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: c.navBorder }}>
                        <p className="text-sm" style={{ color: c.muted }}>
                            ليس لديك حساب؟{' '}
                            <Link to="/register" className="font-bold transition inline-flex items-center gap-1" style={{ color: c.primary }}>
                                إنشاء حساب جديد
                                <ArrowLeft size={14} />
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Inline Theme Selector for Login */}
                <div
                    className="p-3 rounded-2xl backdrop-blur-xl border transition-colors duration-500 animate-in slide-in-from-bottom-5 fade-in"
                    style={{ backgroundColor: c.authCard, borderColor: c.authCardBorder }}
                >
                    <div className="flex items-center justify-center gap-3">
                        {themeKeys.map((key) => {
                            const t = THEMES[key];
                            const isActive = theme === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setTheme(key)}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-md"
                                    style={{
                                        background: key === 'dark'
                                            ? `linear-gradient(135deg, #1e293b, #334155)`
                                            : `linear-gradient(135deg, ${t.colors.gradientFrom}, ${t.colors.gradientTo})`,
                                        border: isActive ? `2px solid ${c.heading}` : `2px solid transparent`,
                                    }}
                                >
                                    {isActive ? <Palette size={18} className="text-[#ffffff]" /> : <span className="text-sm">{t.icon}</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

declare global {
    interface Window {
        recaptchaVerifier: any;
    }
}
