'use client';

import { useCreateInvite } from '@/hooks/useInvites';
import { AlertCircle, CheckCircle2, Loader2, Mail, Send, X } from 'lucide-react';
import React, { useState } from 'react';
import { Input } from '../ui/Input';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string;
  groupName?: string;
  onSuccess?: () => void;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const createInviteMutation = useCreateInvite();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    try {
      await createInviteMutation.mutateAsync({
        email: email.trim(),
        groupId,
      });
      setSuccess(true);
      setEmail('');
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error sending invite:', error);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center z-[9999] p-0 md:p-6">
      <div className="bg-white rounded-t-[2.5rem] md:rounded-[3rem] w-full md:max-w-md h-auto md:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
        
        <div className="flex items-center justify-between p-6 md:p-10 border-b border-slate-50 bg-emerald-50/20 shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {success ? 'Invite Sent! ✨' : 'Invite User 📧'}
            </h2>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">
              {groupId ? `Add to ${groupName || 'group'}` : 'Send invitation'}
            </p>
          </div>
          <button 
            onClick={handleClose} 
            type="button" 
            className="text-slate-400 hover:text-slate-600 p-2.5 hover:bg-white rounded-xl transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-8 md:p-10 flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={40} className="text-emerald-600" strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900 mb-2">Invitation Sent!</h3>
              <p className="text-sm text-slate-600 font-medium">
                We've sent an invitation email. They'll be able to join once they accept.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={createInviteMutation.error?.message}
              />
              
              {groupId && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                    Inviting to
                  </p>
                  <p className="text-sm font-black text-slate-900">{groupName}</p>
                </div>
              )}

              {createInviteMutation.error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-600 font-medium">
                    {createInviteMutation.error.message}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={handleClose} 
                className="flex-1 px-4 py-4 border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-400 uppercase tracking-widest text-[10px] transition-all active:scale-95 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={createInviteMutation.isPending || !email}
                className="flex-1 px-4 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black hover:bg-emerald-700 shadow-2xl shadow-emerald-100 transition-all active:scale-95 text-[10px] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createInviteMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} strokeWidth={3} />
                    <span>Send Invite</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

