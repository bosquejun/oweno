'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';
import { useGroup, useExpenses, useFriends, useAddFriend } from '@/hooks/useSplits';
import { ArrowLeft, Plus, Receipt, Sparkles, CreditCard, Utensils, Plane, Zap, Film, ShoppingBag, Tag, Loader2, Home, HeartPulse, MoreHorizontal, Edit2, UserPlus, Check, History, Share2, Link as LinkIcon, ArrowRight, Wallet, Search, Calendar } from 'lucide-react';
import Link from 'next/link';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { CreateGroupModal } from '@/components/modals/CreateGroupModal';
import { SettleDebtModal } from '@/components/modals/SettleDebtModal';
import { calculateBalances, simplifyDebts } from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatters';
import { getSmartSettleInsights } from '@/services/geminiService';
import { format } from 'date-fns';
import { Expense, Debt } from '@/types';

const CATEGORY_STYLES: Record<string, { color: string, icon: any }> = {
  Dining: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: Utensils },
  Travel: { color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Plane },
  Home: { color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: Home },
  Shopping: { color: 'bg-rose-50 text-rose-600 border-rose-100', icon: ShoppingBag },
  Utilities: { color: 'bg-yellow-50 text-yellow-600 border-yellow-100', icon: Zap },
  Fun: { color: 'bg-purple-50 text-purple-600 border-purple-100', icon: Film },
  Health: { color: 'bg-red-50 text-red-600 border-red-100', icon: HeartPulse },
  Others: { color: 'bg-slate-50 text-slate-600 border-slate-100', icon: MoreHorizontal },
  Settlement: { color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Wallet },
};

export default function GroupDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { currentUser, preferredCurrency, preferredLocale } = useUIStore();
  const { data: group, isLoading: isLoadingGroup, isError: isGroupError } = useGroup(id || '');
  const { data: expenses = [], isLoading: isLoadingExpenses } = useExpenses(id || '');
  const { data: friends = [] } = useFriends();
  const addFriendMutation = useAddFriend();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | undefined>(undefined);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (isLoadingGroup || isLoadingExpenses) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-400 font-bold uppercase text-[10px]">Loading barkada details...</p>
      </div>
    );
  }
  
  if (!group || isGroupError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-6">
           <Search size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Group not found, bes! 🔍</h2>
        <p className="text-sm text-slate-500 font-medium mb-8 max-w-xs">We couldn't find the group with ID: <span className="font-bold text-slate-700">{id}</span>. Maybe it was deleted or the link is wrong.</p>
        <Link href="/groups" className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all active:scale-95 text-xs uppercase tracking-widest">
           Back to My Groups
        </Link>
      </div>
    );
  }

  const balances = calculateBalances(group.members, expenses);
  const debts = simplifyDebts(balances);
  const myBalance = balances.find(b => b.userId === currentUser.id)?.net || 0;

  const isFriend = (userId: string) => friends.some(f => f.id === userId);

  const handleAskAI = async () => {
    setIsLoadingAI(true);
    const insights = await getSmartSettleInsights(group, expenses, debts, preferredCurrency);
    setAiInsights(insights);
    setIsLoadingAI(false);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: `Join ${group.name} on OweNo`,
      text: `Let's split our expenses for "${group.name}" using OweNo! 💸`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSettleDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsSettleModalOpen(true);
  };

  return (
    <>
      <div className="page-transition">
        <header className="sticky top-0 z-30 -mx-6 px-6 pt-8 pb-4 bg-[#F8FAFC]/90 backdrop-blur-xl flex flex-row items-center justify-between gap-4 mb-6 md:mb-10">
          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
            <Link href="/groups" className="p-2 -ml-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shrink-0">
              <ArrowLeft size={22} />
            </Link>
            <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-lg md:text-xl text-white font-black shadow-lg shadow-emerald-100 shrink-0">
                {group.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h1 className="text-lg md:text-xl font-black text-slate-900 truncate leading-none">
                  {group.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => setIsEditGroupModalOpen(true)} className="text-[9px] md:text-[10px] text-emerald-600 font-black uppercase tracking-widest hover:underline">
                    Edit Group
                  </button>
                  <span className="text-slate-200 text-[9px]">|</span>
                  <button 
                    onClick={handleCopyLink} 
                    className={`flex items-center gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${copySuccess ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {copySuccess ? <Check size={10} strokeWidth={3} /> : <LinkIcon size={10} />}
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={handleShare}
                className={`p-3 rounded-2xl transition-all shadow-xl md:hidden ${copySuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-600 border border-slate-100'}`}
                title="Share Group"
              >
                {copySuccess ? <Check size={20} strokeWidth={3} /> : <Share2 size={20} />}
             </button>
             <button onClick={() => { setEditingExpense(undefined); setIsModalOpen(true); }} className="p-3 md:px-6 md:py-3 bg-slate-900 text-white rounded-2xl font-black active:scale-95 transition-all shadow-xl shrink-0">
                <Plus size={20} />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24 md:pb-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white flex items-center justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <span className="text-emerald-200 text-[9px] font-black uppercase tracking-widest">Net Standing</span>
                <p className="text-4xl font-black tabular-nums">{formatCurrency(Math.abs(myBalance), preferredCurrency, preferredLocale)}</p>
                <p className="text-[10px] font-bold text-emerald-100/60 uppercase tracking-widest mt-1">
                  {myBalance >= 0 ? "Others owe you" : "You owe others"}
                </p>
              </div>
              <CreditCard size={32} className="text-emerald-200 relative z-10" />
            </div>

            {group.startDate && group.endDate && (
              <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trip Duration</p>
                  <p className="text-sm font-black text-slate-700">
                    {format(group.startDate, 'MMMM dd')} — {format(group.endDate, 'MMMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {debts.length > 0 && (
              <section className="bg-amber-50 rounded-[2.5rem] p-6 md:p-8 border border-amber-100 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                   <Wallet size={80} className="text-amber-900" />
                </div>
                <h2 className="text-lg md:text-xl font-black text-amber-900 flex items-center gap-3 mb-6 relative z-10">
                  <Wallet size={24} className="text-amber-400" />
                  Barkada Debts
                </h2>
                <div className="space-y-3 relative z-10">
                  {debts.map((debt, idx) => {
                    const debtor = group.members.find(m => m.id === debt.from);
                    const creditor = group.members.find(m => m.id === debt.to);
                    const isMyDebt = debt.from === currentUser.id;
                    const isMyCredit = debt.to === currentUser.id;
                    
                    return (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-100 shadow-sm">
                        <div className="flex items-center gap-3">
                          <img src={debtor?.avatar} className="w-8 h-8 rounded-lg border border-slate-100" alt="" />
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-black ${isMyDebt ? 'text-rose-600' : 'text-slate-700'}`}>
                              {isMyDebt ? 'You' : debtor?.name}
                            </span>
                            <ArrowRight size={12} className="text-amber-400" />
                            <span className={`text-[11px] font-black ${isMyCredit ? 'text-emerald-600' : 'text-slate-700'}`}>
                              {isMyCredit ? 'You' : creditor?.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm font-black text-slate-900 tabular-nums">
                            {formatCurrency(debt.amount, preferredCurrency, preferredLocale)}
                          </p>
                          {(isMyDebt || isMyCredit) && (
                            <button 
                              onClick={() => handleSettleDebt(debt)}
                              className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all active:scale-95 shadow-lg shadow-amber-200"
                            >
                              Settle
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-3">
                  <Receipt size={24} className="text-slate-300" />
                  Group Activities
                </h2>
                <Link href={`/groups/${group.id}/history`} className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 px-3 py-2 rounded-xl transition-all">
                  <History size={14} />
                  History
                </Link>
              </div>

              <div className="space-y-3 md:space-y-4">
                {expenses.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                    <h3 className="text-base font-black text-slate-300 uppercase tracking-widest">No expenses yet.</h3>
                    <p className="text-xs text-slate-400 font-bold mt-2">Start by adding a bill above, lods!</p>
                  </div>
                ) : (
                  [...expenses].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10).map((expense) => {
                    const style = CATEGORY_STYLES[expense.category] || { color: 'bg-emerald-50 text-emerald-600', icon: Tag };
                    const Icon = style.icon;
                    const payer = group.members.find(m => m.id === expense.paidById);
                    
                    return (
                      <div key={expense.id} className="group relative flex items-center gap-4 p-4 md:p-5 bg-white hover:bg-slate-50 transition-all rounded-[1.5rem] md:rounded-[2rem] border-2 border-slate-50 hover:border-emerald-100">
                        <div className="w-12 md:w-14 h-12 md:h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-slate-100">
                          <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 leading-none">{format(expense.date, 'MMM')}</span>
                          <span className="text-lg md:text-xl font-black text-slate-900 leading-none mt-0.5">{format(expense.date, 'dd')}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-slate-900 truncate text-sm md:text-base leading-tight">{expense.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                            <span className={`inline-flex items-center gap-1 text-[8px] px-2.5 py-1 rounded-lg font-black uppercase border border-current opacity-70 ${style.color}`}>
                              <Icon size={10} />
                              {expense.category}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                              Paid by <span className="text-slate-600 font-black">{payer?.name || 'Unknown'}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                          <p className="text-base md:text-lg font-black text-slate-900 tabular-nums">
                            {formatCurrency(expense.amount, preferredCurrency, preferredLocale)}
                          </p>
                          <button 
                            onClick={() => { setEditingExpense(expense); setIsModalOpen(true); }} 
                            className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all md:opacity-0 md:group-hover:opacity-100"
                            title="Edit bill"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
                {expenses.length > 10 && (
                  <Link href={`/groups/${group.id}/history`} className="block text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-emerald-600 transition-colors">
                    + {expenses.length - 10} more expenses in history
                  </Link>
                )}
              </div>
            </section>
          </div>
          
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-emerald-500/20 rounded-xl">
                    <Sparkles size={20} className="text-emerald-400" />
                  </span>
                  <h3 className="font-black text-xl tracking-tight">Bes' Insights</h3>
                </div>
                {aiInsights ? (
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-emerald-50/90 text-sm font-bold leading-relaxed italic">
                      "{aiInsights}"
                    </p>
                  </div>
                ) : (
                  <button 
                    disabled={isLoadingAI || expenses.length === 0} 
                    onClick={handleAskAI} 
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black active:scale-95 disabled:opacity-30 text-[10px] uppercase tracking-widest transition-all shadow-lg hover:bg-emerald-500"
                  >
                    {isLoadingAI ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Analyzing...</span>
                      </div>
                    ) : 'Ask your financial bes'}
                  </button>
                )}
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-900 text-base">Barkada Members</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{group.members.length} Total</span>
              </div>
              <div className="space-y-4">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={member.avatar} className="w-9 h-9 rounded-xl border border-slate-100 shadow-sm shrink-0" alt="" />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">
                          {member.id === currentUser.id ? 'You' : member.name}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{member.email}</p>
                      </div>
                    </div>
                    {member.id !== currentUser.id && (
                      <button
                        onClick={() => !isFriend(member.id) && addFriendMutation.mutate(member)}
                        disabled={isFriend(member.id)}
                        className={`p-2 rounded-lg transition-all ${
                          isFriend(member.id) 
                            ? 'bg-emerald-50 text-emerald-600 cursor-default' 
                            : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                        title={isFriend(member.id) ? "Friend added" : "Add to barkada"}
                      >
                        {isFriend(member.id) ? <Check size={16} strokeWidth={3} /> : <UserPlus size={16} />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      <AddExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} group={group} initialExpense={editingExpense} />
      <CreateGroupModal isOpen={isEditGroupModalOpen} onClose={() => setIsEditGroupModalOpen(false)} initialGroup={group} />
      <SettleDebtModal isOpen={isSettleModalOpen} onClose={() => setIsSettleModalOpen(false)} group={group} debt={selectedDebt} />
    </>
  );
}

