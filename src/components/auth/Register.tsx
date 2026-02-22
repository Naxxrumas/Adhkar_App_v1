import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, Phone, User, Eye, EyeOff, Sparkles, ArrowLeft, Palette } from 'lucide-react';
import { useTheme, THEMES, ThemeKey } from '../../hooks/useTheme';

const Register = () => {
    const { c, theme, setTheme } = useTheme();
    const themeKeys = Object.keys(THEMES) as ThemeKey[];
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const isTestMode = import.meta.env.VITE_AUTH_TEST_MODE === 'true';

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validations
        if (!displayName.trim()) {
            setError('يرجى إدخال الاسم');
            return;
        }
        if (!email.trim()) {
            setError('يرجى إدخال البريد الإلكتروني');
            return;
        }
        if (!phoneNumber.trim()) {
            setError('يرجى إدخال رقم الجوال');
            return;
        }
        if (password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }
        if (password !== confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }

        setIsLoading(true);

        try {
            // Format phone number
            const formattedPhone = phoneNumber.startsWith('+')
                ? phoneNumber
                : `+966${phoneNumber.replace(/^0/, '')}`;

            // Create user with email and password via Supabase
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
                options: {
                    data: {
                        full_name: displayName.trim(),
                        phone: formattedPhone
                    }
                }
            });

            if (signUpError) throw signUpError;

            // Optional: If email confirmation is enabled, you might stay on the page.
            // For now, assume auto-login if no confirmation required.
            navigate('/');
        } catch (err: any) {
            console.error(err);
            if (err.message?.includes('already registered')) {
                setError('البريد الإلكتروني مستخدم بالفعل');
            } else if (err.message?.includes('invalid')) {
                setError('البريد الإلكتروني غير صالح');
            } else if (err.message?.includes('password')) {
                setError('كلمة المرور ضعيفة جداً أو غير صالحة');
            } else {
                setError(err.message || 'حدث خطأ أثناء التسجيل');
            }
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
            setError(err.message || 'فشل التسجيل بواسطة جوجل');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden transition-colors duration-500" dir="rtl" style={{ backgroundColor: c.authBgFrom }}>
            {/* Animated gradient background */}
            <div
                className="absolute inset-0 opacity-80 transition-all duration-500"
                style={{ background: `linear-gradient(to bottom right, ${c.authBgFrom}, ${c.authBgVia}, ${c.authBgTo})` }}
            />
            <div className="absolute top-0 left-0 w-72 h-72 rounded-full filter blur-3xl opacity-40 animate-pulse transition-colors duration-500" style={{ backgroundColor: c.authBlob1 }} />
            <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full filter blur-3xl opacity-40 animate-pulse transition-colors duration-500" style={{ backgroundColor: c.authBlob2, animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full filter blur-3xl opacity-30 animate-pulse transition-colors duration-500" style={{ backgroundColor: c.authBlob3, animationDelay: '4s' }} />

            <div className="w-full max-w-sm relative z-10 flex flex-col gap-6">
                {/* Logo / Header */}
                <div className="text-center">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl transform hover:scale-105 transition-all duration-500"
                        style={{ background: `linear-gradient(to bottom right, ${c.gradientFrom}, ${c.gradientTo})`, boxShadow: `0 20px 25px -5px ${c.primaryShadow}` }}
                    >
                        <Sparkles className="text-[#ffffff]" size={28} />
                    </div>
                    <h1 className="text-2xl font-black" style={{ color: c.heading }}>إنشاء حساب جديد</h1>
                    <p className="text-sm mt-1" style={{ color: c.muted }}>انضم إلى مُسابقَة وتابع أعمالك</p>
                    {isTestMode && <p className="text-amber-600 text-xs font-bold mt-2 bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-200">الوضع التجريبي نشط: سيتم إنشاء الحساب مباشرة</p>}
                </div>

                {/* Card */}
                <div
                    className="p-6 rounded-3xl shadow-xl backdrop-blur-xl border transition-colors duration-500"
                    style={{ backgroundColor: c.authCard, borderColor: c.authCardBorder, boxShadow: `0 20px 25px -5px ${c.primaryShadow}` }}
                >
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="flex flex-col gap-4">
                        {/* Display Name */}
                        <div className="relative">
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">الاسم الكامل</label>
                            <div className="relative">
                                <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="أدخل اسمك الكامل"
                                    className="w-full p-3 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white/50 backdrop-blur-sm transition-all"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="relative">
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

                        {/* Phone Number */}
                        <div className="relative">
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">رقم الجوال</label>
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
                            <p className="text-[10px] text-slate-400 mt-1">سيتم حفظ الرقم بالصيغة الدولية +966</p>
                        </div>

                        {/* Password */}
                        <div className="relative">
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
                                    minLength={6}
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

                        {/* Confirm Password */}
                        <div className="relative">
                            <label className="block text-sm font-bold text-slate-600 mb-1.5">تأكيد كلمة المرور</label>
                            <div className="relative">
                                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full p-3 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white/50 backdrop-blur-sm transition-all"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {/* Submit */}
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
                                    <UserPlus size={20} />
                                    إنشاء الحساب
                                </>
                            )}
                        </button>
                    </form>

                    {/* Google Login Section */}
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
                            المتابعة باستخدام Google
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: c.navBorder }}>
                        <p className="text-sm" style={{ color: c.muted }}>
                            لديك حساب بالفعل؟{' '}
                            <Link to="/login" className="font-bold transition inline-flex items-center gap-1" style={{ color: c.primary }}>
                                تسجيل الدخول
                                <ArrowLeft size={14} />
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Inline Theme Selector for Register */}
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

export default Register;
