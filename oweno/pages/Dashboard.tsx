import React from 'react';
import { useUIStore } from '../store/useUIStore';
import { useGroups, useAllExpenses } from '../hooks/useSplits';
import { TrendingUp, TrendingDown, Plus, Loader2, Sparkles, Receipt, Utensils, Plane, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateBalances } from '../utils/calculations';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { currentUser } = useUIStore();
  const { data: groups = [], isLoading: isLoadingGroups } = useGroups();
  const { data: allExpenses = [], isLoading: isLoadingExpenses } = useAllExpenses();
  
  if (isLoadingGroups || isLoadingExpenses) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Getting your bills ready...</p>
      </div>
    );
  }

  // Calculate global balance logic
  let totalNet = 0;
  let toReceive = 0;
  let toSettle = 0;

  groups.forEach(group => {
    const groupExpenses = allExpenses.filter(e => e.groupId === group.id);
    const groupBalances = calculateBalances(group.members, groupExpenses);
    const myGroupBalance = groupBalances.find(b => b.userId === currentUser.id)?.net || 0;
    
    totalNet += myGroupBalance;
    if (myGroupBalance > 0) toReceive += myGroupBalance;
    if (myGroupBalance < 0) toSettle += Math.abs(myGroupBalance);
  });

  const recentActivities = [...allExpenses].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <div className="page-transition space-y-8">
      <header className="sticky top-0 z-30 -mx-6 px-6 pt-8 pb-4 bg-[#F8FAFC]/90 backdrop-blur-xl flex justify-between items-center mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Mabuhay, {currentUser.name}! 👋</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">Everything's looking good today.</p>
        </div>
        <Link to="/groups" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-xs">
          <Plus size={18} />
          <span className="hidden sm:inline">New Group</span>
        </Link>
      </header>

      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl mx-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <span className="text-emerald-400 font-black uppercase tracking-widest text-[9px]">Total Net Balance</span>
            <h2 className={`text-4xl md:text-6xl font-black tabular-nums ${totalNet < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              ₱{totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
              <Sparkles size={14} className="text-emerald-400" />
              <span>{totalNet >= 0 ? "You're ahead of the game, lods!" : "Time to settle some bills, bes!"}</span>
            </div>
          </div>
          <div className="flex gap-6 md:gap-8 bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-black uppercase tracking-widest text-[8px]"><TrendingUp size={12} />To Receive</div>
              <p className="text-xl font-black">₱{toReceive.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-rose-400 font-black uppercase tracking-widest text-[8px]"><TrendingDown size={12} />To Settle</div>
              <p className="text-xl font-black">₱{toSettle.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <section className="md:col-span-7 bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><Receipt size={20} className="text-slate-300" />Recent Activity</h3>
            <Link to="/groups" className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest">Groups</Link>
          </div>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="py-12 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold text-sm">No spendings yet. Treat yourself?</p>
              </div>
            ) : (
              recentActivities.map(exp => (
                <Link key={exp.id} to={`/groups/${exp.groupId}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400"><Tag size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate">{exp.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{format(exp.date, 'MMM dd, yyyy')}</p>
                  </div>
                  <p className="text-sm font-black text-slate-900">₱{exp.amount.toLocaleString()}</p>
                </Link>
              ))
            )}
          </div>
        </section>
        
        <section className="md:col-span-5 bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm mb-6"><Sparkles size={24} /></div>
            <h3 className="text-xl font-black text-emerald-900 mb-2">Barkada Settle-up</h3>
            <p className="text-emerald-700/80 text-sm font-bold leading-relaxed">
              We track all your shared costs across all groups. Ready to see who owes what in your barkada?
            </p>
          </div>
          <Link to="/groups" className="relative z-10 mt-8 flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-[1.5rem] font-black shadow-lg hover:bg-emerald-700 transition-all text-xs uppercase tracking-widest">
            View All Groups
          </Link>
        </section>
      </div>
    </div>
  );
};