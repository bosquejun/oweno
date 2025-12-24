
import React, { useEffect } from 'react';
import { X, Wallet, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUIStore } from '../../store/useUIStore';
import { useAddExpense } from '../../hooks/useSplits';
import { Group, Debt, SplitType, Expense } from '../../types';
import { formatCurrency, CURRENCY_SYMBOLS } from '../../utils/formatters';
import { Input } from '../ui/Input';

interface SettleDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  debt?: Debt;
}

const SettleFormSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
});

type SettleFormData = z.infer<typeof SettleFormSchema>;

export const SettleDebtModal: React.FC<SettleDebtModalProps> = ({ isOpen, onClose, group, debt }) => {
  const { preferredCurrency, preferredLocale } = useUIStore();
  const addExpenseMutation = useAddExpense(group.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettleFormData>({
    resolver: zodResolver(SettleFormSchema),
  });

  useEffect(() => {
    if (isOpen && debt) {
      reset({ amount: debt.amount });
    }
  }, [isOpen, debt, reset]);

  if (!isOpen || !debt) return null;

  const debtor = group.members.find(m => m.id === debt.from);
  const creditor = group.members.find(m => m.id === debt.to);

  const onFormSubmit = async (formData: SettleFormData) => {
    const settlementExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      groupId: group.id,
      title: `Settle: ${debtor?.name} paid ${creditor?.name}`,
      amount: formData.amount,
      paidById: debt.from,
      date: new Date(),
      splitType: SplitType.EXACT,
      category: 'Settlement',
      splits: [
        { userId: debt.to, amount: formData.amount }
      ],
      splitMetadata: { [debt.to]: formData.amount.toString() }
    };

    try {
      await addExpenseMutation.mutateAsync(settlementExpense);
      onClose();
    } catch (e) {
      console.error("Settlement error:", e);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center z-[9999] p-0 md:p-6">
      <div className="bg-white rounded-t-[2.5rem] md:rounded-[3rem] w-full md:max-w-md h-auto md:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
        
        <header className="flex items-center justify-between p-6 md:p-10 border-b border-slate-50 bg-amber-50/20 shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Settle Debt 💰</h2>
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1">Record a payment</p>
          </div>
          <button onClick={onClose} type="button" className="text-slate-400 hover:text-slate-600 p-2.5 hover:bg-white rounded-xl transition-all shadow-sm">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 md:p-10 space-y-8 flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-center gap-6 py-6">
            <div className="flex flex-col items-center gap-3">
              <img src={debtor?.avatar} className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] border-4 border-amber-100 shadow-lg" alt="" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{debtor?.name}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 animate-pulse shrink-0">
              <ArrowRight size={24} />
            </div>
            <div className="flex flex-col items-center gap-3">
              <img src={creditor?.avatar} className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] border-4 border-emerald-100 shadow-lg" alt="" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{creditor?.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Payment Amount</label>
            <Input
              prefix={CURRENCY_SYMBOLS[preferredCurrency] || '₱'}
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />
          </div>

          <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
            <p className="text-[10px] md:text-xs font-bold text-slate-500 leading-relaxed text-center px-2">
              This records that <span className="text-slate-900 font-black">{debtor?.name}</span> paid <span className="text-slate-900 font-black">{creditor?.name}</span> directly. This balances your books instantly!
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px] transition-all hover:bg-slate-50">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 px-4 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Check size={16} strokeWidth={3} />
                  Confirm
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
