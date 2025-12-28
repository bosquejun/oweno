'use client';

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { ArrowRight, Globe, Heart, Receipt, ShieldCheck, Sparkles, Star, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <span className="font-black text-lg">O</span>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">OweNah</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Features</a>
            {/* <a href="#testimonials" className="text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Reviews</a> */}
          </div>

          <div className="flex items-center gap-4">
           <SignedOut>
           <SignInButton mode="modal">
            <div
              className="cursor-pointer text-xs font-black text-slate-600 hover:text-emerald-600 transition-colors uppercase tracking-widest"
            >
              Sign In
            </div>
            </SignInButton>
            <SignUpButton mode="modal">
            <div 
              className="cursor-pointer px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
            >
              Join Now
            </div>
            </SignUpButton>
           </SignedOut>
           <SignedIn>
            <Link href="/dashboard" className="text-xs font-black text-slate-600 hover:text-emerald-600 transition-colors uppercase tracking-widest">Dashboard</Link>
            <UserButton/>
           </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Owenah stress, bes! 🇵🇭</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700">
            Split the bills. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">OweNah one.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-medium mb-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
            Designed to avoid those awkward "Sino nagbayad, bes?" moments, OweNah makes splitting bills simple, transparent, and drama-free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-700">
           <SignedOut>
           <SignUpButton mode='modal' forceRedirectUrl="/dashboard">
            <div 

              className="cursor-pointer w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-700 hover:scale-105 transition-all shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3 group"
            >
              Start Splitting Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </div>
            </SignUpButton>
           </SignedOut>
           <SignedIn>
            <Link href="/dashboard" className="text-xs font-black text-slate-600 hover:text-emerald-600 transition-colors uppercase tracking-widest">
            <div 

className="cursor-pointer w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-700 hover:scale-105 transition-all shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3 group"
>
Get Started
<ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
</div>
</Link>
           </SignedIn>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <img 
                  key={i} 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*123}&backgroundColor=b6e3f4`} 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm" 
                  alt="" 
                />
              ))}
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black border-2 border-white">
                50k+
              </div>
            </div>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-0">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-400/10 blur-[120px] rounded-full"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-400/10 blur-[120px] rounded-full"></div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-white py-12 border-y border-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Split with anyone on</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all">
             <span className="text-2xl font-black text-slate-400">GCASH</span>
             <span className="text-2xl font-black text-slate-400">PAYMAYA</span>
             <span className="text-2xl font-black text-slate-400">GRABPAY</span>
             <span className="text-2xl font-black text-slate-400">BDO</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Split the bills. Owenah one.</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Everything you need to keep your barkada's finance drama-free and your friendships intact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="text-amber-500" />}
              title="Instant Splitting"
              description="Record expenses in 3 seconds flat. Equal split, percentages, or exact amounts—kami na bahala."
            />
            <FeatureCard 
              icon={<Users className="text-blue-500" />}
              title="Group History"
              description="Keep track of every BGC night out or Siargao trip history. Full transparency for everyone."
            />
            <FeatureCard 
              icon={<Sparkles className="text-emerald-500" />}
              title="Smart AI Insights"
              description="Gemini-powered tips to help you settle faster and manage your group's budget like a pro."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-indigo-500" />}
              title="Safe & Simple"
              description="No banks connected. Just track who owes what manually with a sleek interface you'll love."
            />
            <FeatureCard 
              icon={<Receipt className="text-rose-500" />}
              title="Settlement Receipts"
              description="Record payments between friends instantly. Clean your balances with a single tap."
            />
            <FeatureCard 
              icon={<Globe className="text-emerald-600" />}
              title="Any Currency"
              description="Planning a Japan trip? Split in JPY or PHP easily with our built-in formatters."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full -mr-48 -mt-48"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Heart size={48} className="text-rose-500 mx-auto mb-8 animate-pulse" />
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Owenah one today.</h2>
          <p className="text-slate-400 text-lg mb-12">Join 50,000+ Filipinos splitting bills the Owenah way.</p>
          <SignedOut>
          <SignUpButton mode="modal">
          <button 
            className="cursor-pointer px-12 py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-500 hover:scale-105 transition-all shadow-2xl"
          >
            Create Your Free Account
          </button>
          </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="text-xs font-black text-slate-600 hover:text-emerald-600 transition-colors uppercase tracking-widest">
            <button 
            className="cursor-pointer px-12 py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-500 hover:scale-105 transition-all shadow-2xl"
          >
            Get Started
          </button>
            </Link>
          </SignedIn>
        </div>
      </section>

      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-xs">O</div>
              <span className="font-black text-slate-900">Owenah</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">© 2024 Owenah Philippines. Gawa ng Barkada para sa Barkada.</p>
            <div className="flex gap-6">
              <Star size={16} className="text-slate-200" />
              <Star size={16} className="text-slate-200" />
              <Star size={16} className="text-slate-200" />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 border-t border-slate-100">
            <Link href="/privacy" className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-200">•</span>
            <Link href="/terms" className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all group">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}

