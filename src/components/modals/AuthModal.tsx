'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, ArrowRight, Github, Chrome, Zap } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { Input } from '../ui/Input';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signup' }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUIStore();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      login(email, mode === 'signup' ? name : undefined);
    }, 600);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('bes@oweno.ph', 'Barkada Bes');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="bg-white w-full md:max-w-md h-[85dvh] md:h-auto md:max-h-[85vh] rounded-t-[3rem] md:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 flex flex-col">
        <div className="p-8 md:p-12 relative flex flex-col h-full overflow-y-auto no-scrollbar">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 md:top-8 md:right-8 p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
          >
            <X size={24} />
          </button>

          <div className="mb-8 text-center shrink-0">
            <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-6 shadow-xl shadow-emerald-100">
              O
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
              {mode === 'signup' ? 'Join the barkada today' : 'Continue splitting bills'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Input
                label="Full Name"
                icon={User}
                placeholder="Juan Dela Cruz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="juan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              required
            />

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {mode === 'signup' ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 shrink-0">
            <div className="h-px flex-1 bg-slate-100"></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OR</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>

          <div className="space-y-3 shrink-0">
            <button 
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl hover:bg-emerald-100 transition-all active:scale-95 group"
            >
              <Zap size={18} className="text-emerald-500 fill-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Instant Demo Access</span>
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-3 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all active:scale-95">
                <Chrome size={18} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all active:scale-95">
                <Github size={18} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase">GitHub</span>
              </button>
            </div>
          </div>

          <div className="mt-8 mb-4 text-center shrink-0">
            <button 
              onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
              className="text-slate-400 font-bold text-xs"
            >
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <span className="text-emerald-600 font-black uppercase tracking-widest text-[10px] ml-1">
                {mode === 'signup' ? 'Sign In' : 'Sign Up'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

