import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGroup, useExpenses } from '../../../../hooks/useSplits';
import { ArrowLeft, Loader2, Filter, ChevronDown, Tag, Utensils, Plane, Zap, Film, ShoppingBag, Home, HeartPulse, MoreHorizontal, Calendar, ReceiptText } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../../../../utils/formatters';
import { useUIStore } from '../../../../store/useUIStore';

const CATEGORY_STYLES: Record<string, { color: string, icon: any }> = {
  Dining: { color: 'text-emerald-600 bg-emerald-50', icon: Utensils },
  Travel: { color: 'text-blue-600 bg-blue-50', icon: Plane },
  Home: { color: 'text-indigo-600 bg-indigo-50', icon: Home },
  Shopping: { color: 'text-rose-600 bg-rose-50', icon: ShoppingBag },
  Utilities: { color: 'text-yellow-600 bg-yellow-50', icon: Zap },
  Fun: { color: 'text-purple-600 bg-purple-50', icon: Film },
  Health: { color: 'text-red-600 bg-red-50', icon: HeartPulse },
  Others: { color: 'text-slate-600 bg-slate-50', icon: MoreHorizontal },
};

export default function ExpenseHistory() {
  const { id } = useParams<{ id: string }>();
  const { preferredCurrency, preferredLocale } = useUIStore();
  const { data: group, isLoading: isLoadingGroup } = useGroup(id || '');
  const { data: expenses = [], isLoading: isLoadingExpenses } = useExpenses(id || '');

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPaidBy, setFilterPaidBy] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(exp => (filterCategory === 'All' || exp.category === filterCategory))
      .filter(exp => (filterPaidBy === 'All' || exp.paidById === filterPaidBy))
      .sort((a, b) => sortOrder === 'desc' 
        ? b.date.getTime() - a.date.getTime() 
        : a.date.getTime() - b.date.getTime());
  }, [expenses, filterCategory, filterPaidBy, sortOrder]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  // Grouping logic by month
  const groupedExpenses = useMemo(() => {
    const groups: { month: string, items: typeof filteredExpenses }[] = [];
    filteredExpenses.forEach(exp => {
      const monthStr = format(exp.date, 'MMMM yyyy');
      const existing = groups.find(g => g.month === monthStr);
      if (existing) existing.items.push(exp);
      else groups.push({ month: monthStr, items: [exp] });
    });
    return groups;
  }, [filteredExpenses]);

  if (isLoadingGroup || isLoadingExpenses) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Rewinding time...</p>
      </div>
    );
  }

  if (!group) return <div className="text-center py-20"><h2 className="text-xl font-black">Group not found</h2></div>;

  const categories = ['All', ...Object.keys(CATEGORY_STYLES)];

  return (
    <div className="page-transition pb-20">
      <header className="sticky top-0 z-40 -mx-6 px-6 pt-8 pb-4 bg-[#F8FAFC]/90 backdrop-blur-xl mb-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to={`/groups/${id}`} className="p-2 -ml-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Expense History 🕰️</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{group.name}</p>
          </div>
        </div>

        {/* Dynamic Summary Card */}
        <div className="bg-slate-900 rounded-[2rem] p-6 text-white mb-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Filtered Total</span>
            <p className="text-3xl font-black tabular-nums">{formatCurrency(totalFilteredAmount, preferredCurrency, preferredLocale)}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{filteredExpenses.length} transactions</p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
             <Filter size={24} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {/* Category Filter */}
          <div className="relative shrink-0">
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none bg-white border border-slate-100 rounded-xl pl-10 pr-10 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:border-emerald-500 transition-all shadow-sm"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>
            <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Member Filter */}
          <div className="relative shrink-0">
            <select 
              value={filterPaidBy}
              onChange={(e) => setFilterPaidBy(e.target.value)}
              className="appearance-none bg-white border border-slate-100 rounded-xl pl-10 pr-10 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:border-emerald-500 transition-all shadow-sm"
            >
              <option value="All">All Paid By</option>
              {group.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort Order */}
          <button 
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="shrink-0 bg-white border border-slate-100 rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-emerald-500 transition-all shadow-sm flex items-center gap-2"
          >
            {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </header>

      <div className="space-y-10 mt-4">
        {groupedExpenses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
            <ReceiptText size={48} className="text-slate-200 mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-1">No expenses match your filters</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Try adjusting your filters, bes!</p>
          </div>
        ) : (
          // Fix: Renamed loop variable 'group' to 'mGroup' to avoid shadowing the outer 'group' state object
          groupedExpenses.map((mGroup) => (
            <section key={mGroup.month} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <span className="h-px flex-1 bg-slate-100"></span>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{mGroup.month}</h3>
                <span className="h-px flex-1 bg-slate-100"></span>
              </div>
              <div className="space-y-3">
                {mGroup.items.map((expense) => {
                  const style = CATEGORY_STYLES[expense.category] || { color: 'text-slate-600 bg-slate-50', icon: Tag };
                  const Icon = style.icon;
                  // 'group' now correctly refers to the outer scope variable representing the group data
                  const paidByMember = group.members.find(m => m.id === expense.paidById);
                  
                  return (
                    <div key={expense.id} className="bg-white rounded-3xl p-5 border border-slate-50 shadow-sm hover:border-emerald-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${style.color}`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-slate-900 truncate">{expense.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{format(expense.date, 'MMM dd, yyyy')}</span>
                            <span className="text-slate-200">•</span>
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tight">Paid by {paidByMember?.name || 'Someone'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-black text-slate-900">{formatCurrency(expense.amount, preferredCurrency, preferredLocale)}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{expense.splitType} Split</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}