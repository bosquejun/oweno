import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  isTextArea?: boolean;
  prefix?: string;
}

export const Input = forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(
  ({ label, icon: Icon, error, isTextArea, prefix, className = '', type, ...props }, ref) => {
    const Component = isTextArea ? 'textarea' : 'input';
    
    return (
      <div className="space-y-1.5 w-full min-w-0">
        {label && (
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
            {label}
          </label>
        )}
        <div className="relative group w-full min-w-0">
          {Icon && (
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none z-10 ${error ? 'text-rose-400' : 'text-slate-300 group-focus-within:text-emerald-500'}`}>
              <Icon size={18} />
            </div>
          )}
          {prefix && !Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-600 text-lg pointer-events-none z-10">
              {prefix}
            </div>
          )}
          
          <Component
            ref={ref as any}
            type={type}
            className={`
              w-full max-w-full min-w-0 rounded-2xl border-2 transition-all font-bold text-sm
              ${isTextArea ? 'py-4 px-5 min-h-[100px] resize-none' : 'py-4 px-5'}
              ${Icon ? 'pl-12' : prefix ? 'pl-10' : 'px-5'}
              ${error 
                ? 'border-rose-100 bg-rose-50/30 text-rose-900 focus:border-rose-400 focus:bg-white' 
                : 'border-slate-50 bg-slate-50/30 text-slate-900 focus:bg-white focus:border-emerald-500'
              }
              focus:outline-none focus:ring-4 focus:ring-emerald-500/5
              ${className}
            `}
            {...(props as any)}
          />
        </div>
        {error && (
          <p className="text-[10px] text-rose-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';