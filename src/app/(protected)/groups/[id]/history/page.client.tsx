'use client';

import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { SettleDebtModal } from '@/components/modals/SettleDebtModal';
import { Group, User } from '@/generated/prisma/client';
import { CATEGORY_STYLES } from '@/lib/category-styles';
import { Debt } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, ChevronDown, Edit2, Filter, ReceiptText, Tag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DetailedExpense } from '../page.client';

export default function ExpenseHistory({expenses,group,user}: {expenses: DetailedExpense[], user: User, group: Group & {members: User[]}}) {
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPaidBy, setFilterPaidBy] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<DetailedExpense | undefined>(undefined);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>(undefined);
  const [editingSettlementId, setEditingSettlementId] = useState<string | undefined>(undefined);
  const [editingSettlementDate, setEditingSettlementDate] = useState<Date | undefined>(undefined);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(exp => (filterCategory === 'All' || exp.category === filterCategory))
      .filter(exp => (filterPaidBy === 'All' || exp.paidById === filterPaidBy))
      .sort((a, b) => {
        if (sortOrder === 'desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [expenses, filterCategory, filterPaidBy, sortOrder]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => {
      // Settlement expenses should be deducted (they represent payments, not expenses)
      if (exp.category === 'Settlement') {
        return sum - exp.amount;
      }
      return sum + exp.amount;
    }, 0);
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



  const categories = ['All', ...Object.keys(CATEGORY_STYLES)];

  return (
    <div className="page-transition pb-20">
      <header className="sticky top-0 z-40 -mx-6 px-6 pt-8 pb-4 bg-[#F8FAFC]/90 backdrop-blur-xl mb-4">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/groups/${group.id}`} className="p-2 -ml-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Expense History 🕰️</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{group.name}</p>
          </div>
        </div>

        {/* Dynamic Summary Card */}
        <div className="bg-slate-900 rounded-[2rem] p-6 text-white mb-6 shadow-xl flex items-center justify-between  min-w-full sm:min-w-2xl max-w-2xl mx-auto">
          <div>
            <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Filtered Total</span>
            <p className={`text-3xl font-black tabular-nums`}>
              {formatCurrency(Math.abs(totalFilteredAmount), user.preferredCurrency, user.preferredLocale)}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{filteredExpenses.length} transactions</p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
             <Filter size={24} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar  min-w-full sm:min-w-2xl max-w-2xl mx-auto px-1">
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
              {group.members.map(m => <option key={m.id} value={m.id}>{m.displayName}</option>)}
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

      <div className="space-y-10 mt-4  min-w-full sm:min-w-2xl max-w-2xl mx-auto">
        {groupedExpenses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
            <ReceiptText size={48} className="text-slate-200 mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-1">No expenses match your filters</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Try adjusting your filters, bes!</p>
          </div>
        ) : (
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
                  const paidByMember = group.members.find(m => m.id === expense.paidById);
                  
                  return (
                    <div key={expense.id} className="group bg-white rounded-3xl p-5 border border-slate-50 shadow-sm hover:border-emerald-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${style.color}`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-slate-900 truncate">{expense.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{format(expense.date, 'MMM dd, yyyy')}</span>
                            <span className="text-slate-200">•</span>
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tight">Paid by {paidByMember?.displayName || 'Someone'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`text-base font-black tabular-nums ${expense.category === 'Settlement' ? 'text-rose-500' : 'text-slate-900'}`}>
                              {expense.category === 'Settlement' ? '-' : '+'}{formatCurrency(expense.amount, user.preferredCurrency, user.preferredLocale)}
                            </p>
                            {expense.category !== 'Settlement' && <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{expense.splitType} Split</p>}
                          </div>
                          <button
                            onClick={() => {
                              if (expense.category === 'Settlement') {
                                // Convert settlement expense to Debt format
                                const creditorId = expense.splits[0]?.userId;
                                if (creditorId) {
                                  setEditingDebt({
                                    from: expense.paidById,
                                    to: creditorId,
                                    amount: expense.amount
                                  });
                                  setEditingSettlementId(expense.id);
                                  setEditingSettlementDate(new Date(expense.date));
                                  setIsSettleModalOpen(true);
                                }
                              } else {
                                setEditingExpense(expense);
                                setIsModalOpen(true);
                              }
                            }}
                            className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                            title="Edit expense"
                          >
                            <Edit2 size={16} />
                          </button>
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
      
      <AddExpenseModal
        user={user}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(undefined);
        }}
        group={group}
        initialExpense={editingExpense}
        onSuccess={() => {
          router.refresh();
        }}
      />
      
      <SettleDebtModal
        user={user}
        isOpen={isSettleModalOpen}
        onClose={() => {
          setIsSettleModalOpen(false);
          setEditingDebt(undefined);
          setEditingSettlementId(undefined);
          setEditingSettlementDate(undefined);
        }}
        group={group}
        debt={editingDebt}
        expenseId={editingSettlementId}
        originalDate={editingSettlementDate}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}

