
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Tag, Utensils, Plane, Zap, Film, ShoppingBag, ChevronDown, Check, Home, HeartPulse, MoreHorizontal, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUIStore } from '../../store/useUIStore';
import { useAddExpense, useUpdateExpense } from '../../hooks/useSplits';
import { SplitType, Expense, Group, Split } from '../../types';
import { formatCurrency, CURRENCY_SYMBOLS } from '../../utils/formatters';
import { Input } from '../ui/Input';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  initialExpense?: Expense;
}

const PRESET_CATEGORIES = [
  { name: 'Dining', icon: Utensils },
  { name: 'Travel', icon: Plane },
  { name: 'Home', icon: Home },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Utilities', icon: Zap },
  { name: 'Fun', icon: Film },
  { name: 'Health', icon: HeartPulse },
  { name: 'Others', icon: MoreHorizontal },
];

const ExpenseFormSchema = z.object({
  title: z.string().min(3, "Bill title must be at least 3 characters long"),
  amount: z.number().positive("Amount must be greater than zero"),
});

type ExpenseFormData = z.infer<typeof ExpenseFormSchema>;

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, group, initialExpense }) => {
  const { currentUser, preferredCurrency, preferredLocale } = useUIStore();
  const addExpenseMutation = useAddExpense(group?.id || '');
  const updateExpenseMutation = useUpdateExpense(group?.id || '');
  const isEditing = !!initialExpense;

  const [paidBy, setPaidBy] = useState(currentUser?.id || '');
  const [splitType, setSplitType] = useState<SplitType>(SplitType.EQUAL);
  const [category, setCategory] = useState('Dining');
  const [involvedUserIds, setInvolvedUserIds] = useState<Set<string>>(new Set());
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [shares, setShares] = useState<Record<string, string>>({});

  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(ExpenseFormSchema),
  });

  const amount = watch('amount');
  const numAmount = useMemo(() => {
    const val = parseFloat(amount?.toString() || '0');
    return isNaN(val) ? 0 : val;
  }, [amount]);

  useEffect(() => {
    if (isOpen) {
      if (initialExpense) {
        reset({
          title: initialExpense.title,
          amount: initialExpense.amount,
        });
        setPaidBy(initialExpense.paidById);
        setSplitType(initialExpense.splitType);
        setCategory(initialExpense.category);
        const involved = new Set<string>(initialExpense.splits.map(s => s.userId));
        setInvolvedUserIds(involved);
        const metadata = initialExpense.splitMetadata || {};
        const exacts: Record<string, string> = {};
        const percs: Record<string, string> = {};
        const shs: Record<string, string> = {};
        initialExpense.splits.forEach(s => {
          exacts[s.userId] = metadata[s.userId] || s.amount.toString();
          percs[s.userId] = metadata[s.userId] || ((s.amount / initialExpense.amount) * 100).toFixed(1);
          shs[s.userId] = metadata[s.userId] || '1';
        });
        setExactAmounts(exacts);
        setPercentages(percs);
        setShares(shs);
      } else {
        reset({
          title: '',
          amount: 0,
        });
        setPaidBy(currentUser?.id || '');
        setSplitType(SplitType.EQUAL);
        setCategory('Dining');
        setInvolvedUserIds(new Set(group.members.map(m => m.id)));
        const initialShares: Record<string, string> = {};
        group.members.forEach(m => initialShares[m.id] = '1');
        setShares(initialShares);
        setExactAmounts({});
        setPercentages({});
      }
      setUserSearchQuery('');
      clearErrors();
    }
  }, [isOpen, initialExpense, group, currentUser, reset, clearErrors]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsUserPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totals = useMemo(() => {
    let exactSum = 0;
    let percentSum = 0;
    let totalShares = 0;
    group.members.forEach(m => {
      if (involvedUserIds.has(m.id)) {
        exactSum += parseFloat(exactAmounts[m.id]) || 0;
        percentSum += parseFloat(percentages[m.id]) || 0;
        totalShares += parseFloat(shares[m.id]) || 0;
      }
    });
    return { exactSum, percentSum, totalShares };
  }, [exactAmounts, percentages, shares, involvedUserIds, group.members]);

  const isMismatch = useMemo(() => {
    if (numAmount <= 0) return false;
    if (splitType === SplitType.EXACT) {
      return Math.abs(numAmount - totals.exactSum) > 0.01;
    }
    if (splitType === SplitType.PERCENT) {
      return Math.abs(100 - totals.percentSum) > 0.1;
    }
    return false;
  }, [numAmount, splitType, totals]);

  const onFormSubmit = async (formData: ExpenseFormData) => {
    let splits: Split[] = [];
    const metadata: Record<string, string> = {};
    const involved = group.members.filter(m => involvedUserIds.has(m.id));

    if (splitType === SplitType.EQUAL) {
      const count = involved.length;
      const base = Math.floor((numAmount / count) * 100) / 100;
      const remainder = Number((numAmount - (base * count)).toFixed(2));
      splits = involved.map((m, i) => ({
        userId: m.id,
        amount: i === 0 ? Number((base + remainder).toFixed(2)) : base
      }));
    } else if (splitType === SplitType.EXACT) {
      if (isMismatch) {
        setError('root', { message: `Mismatch: Total is ${formatCurrency(numAmount, preferredCurrency, preferredLocale)}` });
        return;
      }
      splits = involved.map(m => {
        metadata[m.id] = exactAmounts[m.id];
        return { userId: m.id, amount: parseFloat(exactAmounts[m.id]) || 0 };
      });
    } else if (splitType === SplitType.PERCENT) {
      if (isMismatch) {
        setError('root', { message: `Total must be 100%` });
        return;
      }
      let runningTotal = 0;
      splits = involved.map((m, i) => {
        metadata[m.id] = percentages[m.id];
        let share = i === involved.length - 1 ? Number((numAmount - runningTotal).toFixed(2)) : Number((numAmount * ((parseFloat(percentages[m.id]) || 0) / 100)).toFixed(2));
        runningTotal += share;
        return { userId: m.id, amount: share };
      });
    } else if (splitType === SplitType.SHARES) {
      if (totals.totalShares <= 0) {
        setError('root', { message: "At least one share needed!" });
        return;
      }
      let runningTotal = 0;
      splits = involved.map((m, i) => {
        metadata[m.id] = shares[m.id];
        let share = i === involved.length - 1 ? Number((numAmount - runningTotal).toFixed(2)) : Number((numAmount * ((parseFloat(shares[m.id]) || 0) / totals.totalShares)).toFixed(2));
        runningTotal += share;
        return { userId: m.id, amount: share };
      });
    }

    const finalExpense: Expense = {
      id: initialExpense?.id || Math.random().toString(36).substr(2, 9),
      groupId: group.id,
      title: formData.title,
      amount: numAmount,
      paidById: paidBy,
      date: initialExpense?.date || new Date(),
      splitType,
      splits,
      category,
      splitMetadata: metadata,
    };

    try {
      if (isEditing) await updateExpenseMutation.mutateAsync(finalExpense);
      else await addExpenseMutation.mutateAsync(finalExpense);
      onClose();
    } catch (e) {
      console.error("Submission error:", e);
      setError('root', { message: "Failed to save expense. Please try again." });
    }
  };

  const handleSplitValueChange = (userId: string, val: string) => {
    clearErrors('root');
    if (splitType === SplitType.EXACT) setExactAmounts(prev => ({ ...prev, [userId]: val }));
    if (splitType === SplitType.PERCENT) setPercentages(prev => ({ ...prev, [userId]: val }));
    if (splitType === SplitType.SHARES) setShares(prev => ({ ...prev, [userId]: val }));
  };

  const toggleUserInvolvement = (userId: string) => {
    const newSet = new Set(involvedUserIds);
    if (newSet.has(userId)) {
      if (newSet.size > 1) newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setInvolvedUserIds(newSet);
  };

  const filteredMembers = group.members.filter(m => 
    m.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  const selectedUser = group.members.find(m => m.id === paidBy) || group.members[0];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center z-[9999] p-0 md:p-6">
      <div className="bg-white rounded-t-[2.5rem] md:rounded-[3.5rem] w-full md:max-w-xl h-[92dvh] md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
        
        <div className="flex items-center justify-between p-6 md:p-10 border-b border-slate-50 shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{isEditing ? 'Edit Bill ✏️' : 'Add Bill 💸'}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mt-1">Track and split right.</p>
          </div>
          <button onClick={onClose} type="button" className="text-slate-300 hover:text-slate-600 p-2.5 hover:bg-slate-50 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 md:p-10 pt-4 space-y-9 md:space-y-12 no-scrollbar">
            
            <section className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center text-[10px] font-black">1</div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">The Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  icon={Tag}
                  placeholder="Expense title"
                  error={errors.title?.message}
                  {...register('title')}
                />
                <Input
                  prefix={CURRENCY_SYMBOLS[preferredCurrency] || '₱'}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.amount?.message}
                  {...register('amount', { valueAsNumber: true })}
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center text-[10px] font-black">2</div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                 {PRESET_CATEGORIES.map((cat) => (
                   <button key={cat.name} type="button" onClick={() => setCategory(cat.name)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${category === cat.name ? `bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100` : 'bg-white border-slate-50 text-slate-400 hover:border-emerald-200'}`}>
                     <cat.icon size={14} />
                     <span className="text-[10px] font-black uppercase tracking-tight">{cat.name}</span>
                   </button>
                 ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center text-[10px] font-black">3</div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Who Paid?</h3>
              </div>
              <div className="relative" ref={pickerRef}>
                <button type="button" onClick={() => setIsUserPickerOpen(!isUserPickerOpen)} className="w-full flex items-center justify-between p-4 bg-slate-900 text-white rounded-[1.5rem] shadow-xl active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-3.5">
                    <img src={selectedUser?.avatar} className="w-9 h-9 rounded-xl border-2 border-white/20" alt="" />
                    <div className="text-left">
                      <p className="text-[11px] font-black uppercase tracking-widest text-white/50 mb-0.5">Settled By</p>
                      <p className="text-sm font-black">{paidBy === currentUser.id ? 'You' : selectedUser?.name}</p>
                    </div>
                  </div>
                  <ChevronDown size={18} className={`text-white/40 transition-transform ${isUserPickerOpen ? 'rotate-180' : ''}`} />
                </button>
                {isUserPickerOpen && (
                  <div className="absolute top-full mt-3 left-0 right-0 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 z-[10001] overflow-hidden flex flex-col max-h-72">
                    <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="Search members..." 
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          className="w-full bg-white border border-slate-100 rounded-xl pl-9 pr-4 py-2 text-xs font-bold outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                      {filteredMembers.length > 0 ? filteredMembers.map((m) => (
                        <button key={m.id} type="button" onClick={() => { setPaidBy(m.id); setIsUserPickerOpen(false); }} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${paidBy === m.id ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50'}`}>
                          <div className="flex items-center gap-3">
                            <img src={m.avatar} className="w-8 h-8 rounded-lg" alt="" />
                            <span className="text-sm font-black">{m.id === currentUser.id ? 'You' : m.name}</span>
                          </div>
                          {paidBy === m.id && <Check size={18} strokeWidth={3} />}
                        </button>
                      )) : (
                        <div className="p-6 text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No members found, bes!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4 pb-12">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center text-[10px] font-black">4</div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">The Split</h3>
              </div>
              <div className="bg-slate-100/80 p-1.5 rounded-2xl flex gap-1.5">
                {[
                  { id: SplitType.EQUAL, label: 'Equal' },
                  { id: SplitType.EXACT, label: 'Exact' },
                  { id: SplitType.PERCENT, label: '%' },
                  { id: SplitType.SHARES, label: 'Shares' },
                ].map((strat) => (
                  <button key={strat.id} type="button" onClick={() => setSplitType(strat.id as SplitType)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${splitType === strat.id ? 'bg-white text-emerald-600 shadow-lg shadow-black/5' : 'text-slate-400'}`}>{strat.label}</button>
                ))}
              </div>

              {(splitType === SplitType.EXACT || splitType === SplitType.PERCENT) && numAmount > 0 && (
                <div className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all animate-in slide-in-from-top-2 ${isMismatch ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                   <div className="flex items-center gap-2.5">
                     {isMismatch ? <AlertCircle size={18} className="text-rose-500" /> : <CheckCircle2 size={18} className="text-emerald-500" />}
                     <div className="min-w-0">
                       <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                         {splitType === SplitType.EXACT ? 'Exact Amount Reconciliation' : 'Percentage Reconciliation'}
                       </p>
                       <p className="text-xs font-bold mt-1">
                         {splitType === SplitType.EXACT 
                           ? `Sum: ${formatCurrency(totals.exactSum, preferredCurrency, preferredLocale)} / ${formatCurrency(numAmount, preferredCurrency, preferredLocale)}`
                           : `Total: ${totals.percentSum.toFixed(1)}% / 100%`}
                       </p>
                     </div>
                   </div>
                   {isMismatch && (
                     <span className="text-[10px] font-black uppercase tracking-tight bg-rose-500 text-white px-2 py-0.5 rounded-lg shrink-0">
                       Mismatch
                     </span>
                   )}
                </div>
              )}

              <div className="space-y-2.5">
                {group.members.map((member) => {
                  const isInvolved = involvedUserIds.has(member.id);
                  let calculatedAmount = 0;
                  if (splitType === SplitType.EQUAL) calculatedAmount = numAmount / (involvedUserIds.size || 1);
                  else if (splitType === SplitType.EXACT) calculatedAmount = parseFloat(exactAmounts[member.id]) || 0;
                  else if (splitType === SplitType.PERCENT) calculatedAmount = numAmount * ((parseFloat(percentages[member.id]) || 0) / 100);
                  else if (splitType === SplitType.SHARES) calculatedAmount = numAmount * ((parseFloat(shares[member.id]) || 0) / (totals.totalShares || 1));
                  
                  return (
                    <div key={member.id} className={`flex items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all ${isInvolved ? 'bg-white border-emerald-100 shadow-sm' : 'bg-slate-50/30 border-transparent opacity-40'}`}>
                      <button type="button" onClick={() => toggleUserInvolvement(member.id)} className="shrink-0 relative">
                        <img src={member.avatar} className={`w-10 h-10 rounded-xl border-2 transition-all ${isInvolved ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-50' : 'border-slate-200'}`} alt="" />
                        {isInvolved && <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5"><Check size={8} strokeWidth={4} /></div>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">{member.name}</p>
                        {isInvolved && <p className="text-[10px] font-bold text-emerald-600">{formatCurrency(calculatedAmount, preferredCurrency, preferredLocale)}</p>}
                      </div>
                      {isInvolved && splitType !== SplitType.EQUAL && (
                        <div className="relative">
                          <input 
                            type="number" 
                            value={(splitType === SplitType.EXACT ? exactAmounts[member.id] : splitType === SplitType.PERCENT ? percentages[member.id] : shares[member.id]) || ''} 
                            onChange={(e) => handleSplitValueChange(member.id, e.target.value)} 
                            className="w-20 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-right outline-none focus:border-emerald-500 focus:bg-white transition-all" 
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {errors.root && (
                <p className="text-[10px] text-rose-500 font-black text-center mt-4 uppercase tracking-widest bg-rose-50 p-3 rounded-xl border border-rose-100">{errors.root.message}</p>
              )}
            </section>
          </div>

          <div className="p-6 md:p-10 bg-white border-t border-slate-50 shrink-0 pb-8 md:pb-12 shadow-[0_-15px_40px_rgba(0,0,0,0.04)]">
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-400 uppercase tracking-widest text-[10px] transition-all active:scale-95 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={isSubmitting || isMismatch} className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-emerald-100 uppercase tracking-widest text-[10px] transition-all active:scale-95 hover:bg-emerald-700 disabled:opacity-50 disabled:grayscale">
                {isSubmitting ? 'Saving...' : isMismatch ? 'Check Split Sum' : 'Confirm Bill'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
