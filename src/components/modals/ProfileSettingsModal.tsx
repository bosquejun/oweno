'use client';

import React, { useState, useEffect } from 'react';
import { X, Globe, CreditCard, User, Check, Sparkles, Mail, AtSign, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUIStore } from '../../contexts/UIContext';
import { UserSchema } from '../../schemas';
import { User as UserType } from '../../types';
import { Input } from '../ui/Input';

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

export const ProfileSettingsModal: React.FC = () => {
  const { 
    currentUser, 
    preferredCurrency, 
    preferredLocale, 
    isSettingsOpen, 
    setSettingsOpen, 
    updateSettings, 
    updateUser 
  } = useUIStore();

  const [tempCurrency, setTempCurrency] = useState(preferredCurrency);
  const [tempLocale, setTempLocale] = useState(preferredLocale);
  const [currentAvatar, setCurrentAvatar] = useState(currentUser.avatar);
  const [isRotating, setIsRotating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserType>({
    resolver: zodResolver(UserSchema),
  });

  useEffect(() => {
    if (isSettingsOpen) {
      reset(currentUser);
      setCurrentAvatar(currentUser.avatar);
      setTempCurrency(preferredCurrency);
      setTempLocale(preferredLocale);
    }
  }, [isSettingsOpen, currentUser, reset, preferredCurrency, preferredLocale]);

  if (!isSettingsOpen) return null;

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
    setSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center z-[10000] p-0 md:p-6">
      <div className="bg-white rounded-t-[2.5rem] md:rounded-[3rem] w-full md:max-w-xl h-[90dvh] md:h-auto md:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        
        <header className="flex items-center justify-between p-6 md:p-10 border-b border-slate-50 shrink-0 bg-white/80 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Profile Settings ⚙️</h2>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Customize your experience</p>
          </div>
          <button onClick={() => setSettingsOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-300 hover:text-slate-600">
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 no-scrollbar">
            
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <User size={18} className="text-slate-400" />
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Your Identity</h3>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 mb-2">
                  <div className="relative group/avatar">
                    <img src={currentAvatar} className="w-24 h-24 rounded-[2.5rem] border-4 border-slate-50 shadow-xl group-hover/avatar:scale-105 transition-transform" alt="" />
                    <button 
                      type="button"
                      onClick={handleRegenerateAvatar}
                      className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2.5 rounded-2xl shadow-lg hover:bg-emerald-700 active:scale-90 transition-all border-4 border-white"
                      title="New Avatar"
                    >
                      <RefreshCw size={16} strokeWidth={3} className={isRotating ? 'animate-spin' : ''} />
                    </button>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Click to change your vibe, bes!</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Your Email"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-slate-400" />
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Preferred Currency</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {CURRENCIES.map((c) => (
                  <button 
                    key={c.code}
                    type="button"
                    onClick={() => setTempCurrency(c.code)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      tempCurrency === c.code 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                        : 'bg-white border-slate-50 text-slate-400 hover:border-emerald-200'
                    }`}
                  >
                    <span className={`text-xl font-black ${tempCurrency === c.code ? 'text-white' : 'text-slate-900'}`}>{c.symbol}</span>
                    <span className="text-[9px] font-black uppercase tracking-tight">{c.code}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-slate-400" />
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Regional Format</h3>
              </div>
              <div className="space-y-2">
                {LOCALES.map((l) => (
                  <button 
                    key={l.code}
                    type="button"
                    onClick={() => setTempLocale(l.code)}
                    className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all ${
                      tempLocale === l.code 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                        : 'bg-white border-slate-50 text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-black">{l.label}</span>
                      <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Primary Support</span>
                    </div>
                    {tempLocale === l.code && <Check size={16} className="text-emerald-600" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </section>

            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 blur-2xl rounded-full"></div>
               <div className="relative z-10 flex items-center gap-4">
                  <Sparkles size={24} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm md:text-base font-black italic">"Looking sharp, bes!"</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Your changes will apply instantly.</p>
                  </div>
               </div>
            </div>
          </div>

          <footer className="p-6 md:p-10 bg-white/95 backdrop-blur-md border-t border-slate-50 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-emerald-100 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Preferences'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

