'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe, CreditCard, User, Check, Sparkles, Mail, AtSign, RefreshCw, Save, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';
import { UserSchema } from '@/schemas';
import { User as UserType } from '@/types';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

const CURRENCIES = [
  { code: 'PHP', symbol: '₱', label: 'Philippine Peso' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
];

const LOCALES = [
  { code: 'en-PH', label: 'English (Philippines)' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { 
    currentUser, 
    preferredCurrency, 
    preferredLocale, 
    updateSettings, 
    updateUser 
  } = useUIStore();

  const [tempCurrency, setTempCurrency] = useState(preferredCurrency);
  const [tempLocale, setTempLocale] = useState(preferredLocale);
  const [currentAvatar, setCurrentAvatar] = useState(currentUser.avatar);
  const [isRotating, setIsRotating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserType>({
    resolver: zodResolver(UserSchema),
  });

  const watchedName = watch('name');
  const watchedEmail = watch('email');

  useEffect(() => {
    reset(currentUser);
    setCurrentAvatar(currentUser.avatar);
    setTempCurrency(preferredCurrency);
    setTempLocale(preferredLocale);
  }, [currentUser, reset, preferredCurrency, preferredLocale]);

  // Track changes
  useEffect(() => {
    const hasNameChanged = watchedName !== currentUser.name;
    const hasEmailChanged = watchedEmail !== currentUser.email;
    const hasCurrencyChanged = tempCurrency !== preferredCurrency;
    const hasLocaleChanged = tempLocale !== preferredLocale;
    const hasAvatarChanged = currentAvatar !== currentUser.avatar;
    
    setHasChanges(hasNameChanged || hasEmailChanged || hasCurrencyChanged || hasLocaleChanged || hasAvatarChanged);
  }, [watchedName, watchedEmail, tempCurrency, tempLocale, currentAvatar, currentUser, preferredCurrency, preferredLocale]);

  const handleRegenerateAvatar = () => {
    setIsRotating(true);
    const newSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}&backgroundColor=b6e3f4`;
    setCurrentAvatar(newAvatar);
    setValue('avatar', newAvatar);
    setTimeout(() => setIsRotating(false), 500);
  };

  const onFormSubmit = (data: UserType) => {
    updateUser({ ...data, avatar: currentAvatar });
    updateSettings(tempCurrency, tempLocale);
    setIsSaved(true);
    setHasChanges(false);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="page-transition pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 -mx-6 md:-mx-12 px-6 md:px-12 pt-8 md:pt-4 pb-6 bg-[#F8FAFC]/90 backdrop-blur-xl flex items-center justify-between gap-4 mb-8 md:mb-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shrink-0">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Settings ⚙️</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium mt-1">Customize your OweNo experience</p>
          </div>
        </div>
        {hasChanges && !isSaved && (
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-xs font-black text-amber-700 uppercase tracking-widest">Unsaved changes</span>
          </div>
        )}
      </header>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Profile Section */}
        <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <User size={24} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Profile Information</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Update your personal details and avatar</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-6 pb-8 border-b border-slate-100">
              <div className="relative group/avatar">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-[2.5rem] blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
                <img 
                  src={currentAvatar} 
                  className="relative w-32 h-32 rounded-[2.5rem] border-4 border-slate-50 shadow-xl group-hover/avatar:scale-105 transition-transform" 
                  alt="Profile avatar" 
                />
                <button 
                  type="button"
                  onClick={handleRegenerateAvatar}
                  className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-3 rounded-2xl shadow-lg hover:bg-emerald-700 active:scale-90 transition-all border-4 border-white z-10"
                  title="Generate new avatar"
                >
                  <RefreshCw size={18} strokeWidth={3} className={isRotating ? 'animate-spin' : ''} />
                </button>
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-900 mb-1">Your Avatar</p>
                <p className="text-xs text-slate-500 font-medium">Click the refresh button to generate a new avatar</p>
              </div>
            </div>
            
            {/* Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Display Name"
                icon={AtSign}
                placeholder="Your Name"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Email Address"
                icon={Mail}
                placeholder="your@email.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Currency Selection */}
          <section className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <CreditCard size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Currency</h3>
                <p className="text-xs text-slate-500 font-medium">Select your preferred currency</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CURRENCIES.map((c) => (
                <button 
                  key={c.code}
                  type="button"
                  onClick={() => setTempCurrency(c.code)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    tempCurrency === c.code 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100 scale-105' 
                      : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <span className={`text-2xl font-black ${tempCurrency === c.code ? 'text-white' : 'text-slate-900'}`}>
                    {c.symbol}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-tight ${tempCurrency === c.code ? 'text-white/90' : 'text-slate-600'}`}>
                    {c.code}
                  </span>
                  {tempCurrency === c.code && (
                    <Check size={14} className="text-white mt-1" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Locale Selection */}
          <section className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Globe size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Regional Format</h3>
                <p className="text-xs text-slate-500 font-medium">Choose your locale preference</p>
              </div>
            </div>
            <div className="space-y-3">
              {LOCALES.map((l) => (
                <button 
                  key={l.code}
                  type="button"
                  onClick={() => setTempLocale(l.code)}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                    tempLocale === l.code 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-md' 
                      : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-black">{l.label}</span>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">
                      Primary Support
                    </span>
                  </div>
                  {tempLocale === l.code && (
                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Sparkles size={24} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black mb-2">All Set, Bes! ✨</h3>
              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                Your preferences are saved automatically. Changes take effect immediately across all your groups and expenses.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button - Sticky on mobile, fixed on desktop */}
        <div className="sticky md:static bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 -mx-6 md:-mx-12 px-6 md:px-12 py-4 md:py-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:shadow-none md:bg-transparent md:border-0">
          <button 
            type="submit"
            disabled={isSubmitting || (!hasChanges && !isSaved)}
            className={`w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
              isSaved ? 'bg-emerald-500' : 'hover:bg-emerald-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 size={20} strokeWidth={3} />
                <span>Saved Successfully!</span>
              </>
            ) : hasChanges ? (
              <>
                <Save size={18} strokeWidth={3} />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Check size={18} strokeWidth={3} />
                <span>All Saved</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
