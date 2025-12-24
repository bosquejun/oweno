import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUIStore } from '../store/useUIStore';
import { useGroup, useExpenses, useDeleteExpense, useFriends, useAddFriend } from '../hooks/useSplits';
import { ArrowLeft, Plus, Receipt, Sparkles, Info, CreditCard, Utensils, Plane, Zap, Film, ShoppingBag, Tag, Loader2, Home, HeartPulse, MoreHorizontal, Edit2, Trash2, Settings, UserPlus, Check } from 'lucide-react';
import { AddExpenseModal } from '../components/modals/AddExpenseModal';
import { CreateGroupModal } from '../components/modals/CreateGroupModal';
import { calculateBalances, simplifyDebts } from '../utils/calculations';
import { getSmartSettleInsights } from '../services/geminiService';
import { format } from 'date-fns';
import { Expense, User } from '../types';

const CATEGORY_STYLES: Record<string, { color: string, icon: any }> = {
  Dining: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: Utensils },
  Travel: { color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Plane },
  Home: { color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: Home },
  Shopping: { color: 'bg-rose-50 text-rose-600 border-rose-100', icon: ShoppingBag },
  Utilities: { color: 'bg-yellow-50 text-yellow-600 border-yellow-100', icon: Zap },
  Fun: { color: 'bg-purple-50 text-purple-600 border-purple-100', icon: Film },
  Health: { color: 'bg-red-50 text-red-600 border-red-100', icon: HeartPulse },
  Others: { color: 'bg-slate-50 text-slate-600 border-slate-100', icon: MoreHorizontal },
};

export const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useUIStore();
  const { data: group, isLoading: isLoadingGroup } = useGroup(id || '');
  const { data: expenses = [], isLoading: isLoadingExpenses } = useExpenses(id || '');
  const { data: friends = [] } = useFriends();
  const addFriendMutation = useAddFriend();
  
  const deleteExpenseMutation = useDeleteExpense(id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  if (isLoadingGroup || isLoadingExpenses) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /><p className="text-slate-400 font-bold uppercase text-[10px]">Loading...</p></div>;
  }
  if (!group) return <div className="text-center py-20"><h2 className="text-xl font-black">Group not found</h2></div>;

  const balances = calculateBalances(group.members, expenses);
  const debts = simplifyDebts(balances);
  const myBalance = balances.find(b => b.userId === currentUser.id)?.net || 0;

  const isFriend = (userId: string) => friends.some(f => f.id === userId);

  return (
    <>
      <div className="page-transition">
        <header className="sticky top-0 z-30 -mx-6 px-6 pt-8 pb-4 bg-[#F8FAFC]/90 backdrop-blur-xl flex flex-row items-center justify-between gap-4 mb-8 md:mb-10">
          <div className="flex items-center gap-4">
            <Link to="/groups" className="p-2 -ml-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><ArrowLeft size={22} /></Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-xl text-white font-black shadow-lg shadow-emerald-100">{group.name.charAt(0)}</div>
              <div>
                <h1 className="text-xl font-black text-slate-900 truncate max-w-[150px] md:max-w-xs leading-none">{group.name}</h1>
                <button onClick={() => setIsEditGroupModalOpen(true)} className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1 hover:underline">Edit Group</button>
              </div>
            </div>
          </div>
          <button onClick={() => { setEditingExpense(undefined); setIsModalOpen(true); }} className="p-3 md:px-6 md:py-3 bg-slate-900 text-white rounded-2xl font-black active:scale-95 transition-all shadow-xl">
            <Plus size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white flex items-center justify-between shadow-xl">
              <div><span className="text-emerald-200 text-[9px] font-black uppercase tracking-widest">Net Standing</span><p className="text-4xl font-black">₱{Math.abs(myBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
              <CreditCard size={32} className="text-emerald-200" />
            </div>

            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-8"><Receipt size={24} className="text-slate-300" />Activities</h2>
              <div className="space-y-4">
                {expenses.length === 0 ? <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100"><h3 className="text-base font-black">Walang gastusan?</h3></div> :
                  [...expenses].sort((a, b) => b.date.getTime() - a.date.getTime()).map((expense) => {
                    const style = CATEGORY_STYLES[expense.category] || { color: 'bg-emerald-50 text-emerald-600', icon: Tag };
                    const Icon = style.icon;
                    return (
                      <div key={expense.id} className="group flex items-center gap-5 p-5 bg-white hover:bg-slate-50 transition-all rounded-[2rem] border-2 border-slate-50 hover:border-emerald-100">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center shrink-0"><span className="text-[9px] font-black uppercase">{format(expense.date, 'MMM')}</span><span className="text-xl font-black text-slate-900">{format(expense.date, 'dd')}</span></div>
                        <div className="flex-1 min-w-0"><h4 className="font-black text-slate-900 truncate text-base">{expense.title}</h4><span className={`inline-flex items-center gap-1.5 text-[8px] px-3 py-1 rounded-xl font-black uppercase ${style.color}`}><Icon size={10} />{expense.category}</span></div>
                        <div className="flex items-center gap-3"><p className="text-xl font-black text-slate-900">₱{expense.amount.toLocaleString()}</p><div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setEditingExpense(expense); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-emerald-600"><Edit2 size={14} /></button></div></div>
                      </div>
                    );
                  })}
              </div>
            </section>
          </div>
          
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3"><Sparkles size={24} className="text-emerald-400" /><h3 className="font-black text-xl">Bes' Insights</h3></div>
                {aiInsights ? <p className="text-emerald-50/90 text-sm font-bold border-l-4 border-emerald-500 pl-4 italic">{aiInsights}</p> :
                  <button disabled={isLoadingAI || expenses.length === 0} onClick={async () => { setIsLoadingAI(true); setAiInsights(await getSmartSettleInsights(group, expenses, debts)); setIsLoadingAI(false); }} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black active:scale-95 disabled:opacity-30 text-[10px] uppercase tracking-widest">{isLoadingAI ? 'Analyzing...' : 'Ask the Bes'}</button>}
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-900">Barkada Members</h3>
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
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                        title={isFriend(member.id) ? "Already a friend" : "Add Friend"}
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
    </>
  );
};