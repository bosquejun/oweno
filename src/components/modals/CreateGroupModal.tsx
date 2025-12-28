'use client';

import { Group, User } from '@/generated/prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar, Check, Plus, Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '../ui/Input';

// Extended Group type that includes members
type GroupWithMembers = Group & {
  members?: User[];
};


interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGroup?: GroupWithMembers;
  user: User;
  friends: User[];
  onSuccess?: (groupId: string) => void;
}

const GroupFormSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters long"),
  description: z.string().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

type GroupFormData = z.infer<typeof GroupFormSchema>;

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, initialGroup, user, friends,onSuccess }) => {
  const isEditing = !!initialGroup;
  const [members, setMembers] = useState<User[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isFriendPickerOpen, setIsFriendPickerOpen] = useState(false);
  const friendPickerRef = useRef<HTMLDivElement>(null);


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormData>({
    resolver: zodResolver(GroupFormSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (initialGroup) {
        reset({
          name: initialGroup.name,
          description: initialGroup.description || '',
          startDate: initialGroup.startDate ? format(initialGroup.startDate, 'yyyy-MM-dd') : '',
          endDate: initialGroup.endDate ? format(initialGroup.endDate, 'yyyy-MM-dd') : '',
        });
        setMembers((initialGroup?.members as User[]) || []);
      } else {
        reset({
          name: '',
          description: '',
          startDate: '',
          endDate: '',
        });
        setMembers([user]);
      }
      setMemberSearchQuery('');
    }
  }, [isOpen, initialGroup, user, reset]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (friendPickerRef.current && !friendPickerRef.current.contains(event.target as Node)) {
        setIsFriendPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleAddMemberByEmail = async () => {
    const email = memberSearchQuery.trim();
    if (!email || !email.includes('@')) return;
    
    if (members.some(m => m.email === email)) {
      setMemberSearchQuery('');
      return;
    }

    // For existing groups, send invite; for new groups, add as pending member
    if (isEditing && initialGroup) {
      // Send invite for existing group
      try {
        const response = await fetch('/api/invites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, groupId: initialGroup.id }),
        });
        if (response.ok) {
          // Add as pending member for UI
          const newMember = {
            id: `pending_${email}`,
            displayName: email.split('@')[0],
            email: email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
          } as User;
          setMembers(prev => [...prev, newMember]);
          setMemberSearchQuery('');
          setIsFriendPickerOpen(false);
        }
      } catch (error) {
        console.error('Error sending invite:', error);
      }
    } else {
      // For new groups, add as pending member (will be invited after group creation)
      const newMember = {
        id: `pending_${email}`,
        displayName: email.split('@')[0],
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      } as User;
      setMembers(prev => [...prev, newMember]);
      setMemberSearchQuery('');
      setIsFriendPickerOpen(false);
    }
  };

  const toggleMemberSelection = (user: User) => {
    setMembers(prev => {
      if (prev.some(m => m.id === user.id)) {
        if (user.id === user.id) return prev; // Cannot remove self
        return prev.filter(m => m.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const onFormSubmit = async (formData: GroupFormData) => {
    if (members.length < 1) return;

    // Separate existing members from pending invites (emails without user IDs)
    const existingMembers = members.filter(m => !m.id.startsWith('pending_')) satisfies User[];
    const pendingInvites = members.filter(m => m.id.startsWith('pending_')) satisfies User[];

    const finalData = {
      id: initialGroup?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name,
      description: formData.description || null,
      members: existingMembers,
      createdAt: initialGroup?.createdAt || new Date(),
      updatedAt: initialGroup?.updatedAt || new Date(),
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      endDate: formData.endDate ? new Date(formData.endDate) : null,
    } satisfies GroupWithMembers;

    try {
      let groupId: string;
      if (isEditing) {
        
        const response = await fetch(`/api/groups/${finalData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalData),
        });
        if (!response.ok) {
          throw new Error('Failed to update group');
        }
        const updatedGroup = await response.json();
        groupId = updatedGroup.id;
      } else {
        const response = await fetch('/api/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalData),
        });
        if (!response.ok) {
          throw new Error('Failed to create group');
        }
        const createdGroup = await response.json();
        groupId = createdGroup.id;
      }

      // Send invites to pending members
      if (pendingInvites.length > 0) {
        await Promise.all(
          pendingInvites.map(async (member) => {
            try {
              await fetch('/api/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  email: member.email, 
                  groupId 
                }),
              });
            } catch (error) {
              console.error(`Error inviting ${member.email}:`, error);
            }
          })
        );
      }


      onSuccess?.(groupId);

      onClose();
    } catch (e) {
      console.error("Group save error:", e);
    }
  };

  const filteredFriends = friends?.filter(f => 
    (f.displayName || f.email).toLowerCase().includes(memberSearchQuery.toLowerCase()) || 
    f.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
  ) || [];

  const isEmailInput = memberSearchQuery.includes('@');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center z-[9999] p-0 md:p-6">
      <div className="bg-white rounded-t-[2.5rem] md:rounded-[3rem] w-full md:max-w-lg h-[85dvh] md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
        
        <div className="flex items-center justify-between p-6 md:p-10 border-b border-slate-50 bg-emerald-50/20 shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{isEditing ? 'Edit Group 🫂' : 'Create Group 🫂'}</h2>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Split expenses easily</p>
          </div>
          <button onClick={onClose} type="button" className="text-slate-400 hover:text-slate-600 p-2.5 hover:bg-white rounded-xl transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-9 no-scrollbar">
            <section className="space-y-6">
              <Input
                label="Group Name"
                placeholder="e.g. Siargao 2024"
                error={errors.name?.message}
                {...register('name')}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  icon={Calendar}
                  error={errors.startDate?.message}
                  {...register('startDate')}
                />
                <Input
                  label="End Date"
                  type="date"
                  icon={Calendar}
                  error={errors.endDate?.message}
                  {...register('endDate')}
                />
              </div>
              
              <Input
                label="Description"
                isTextArea
                placeholder="A bit about this group..."
                error={errors.description?.message}
                {...register('description')}
              />
            </section>

            <section className="space-y-4 pb-10" ref={friendPickerRef}>
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Barkada Members ({members.length})</label>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-2.5 bg-emerald-50/80 px-4 py-2 rounded-xl text-[10px] font-black text-emerald-700 border border-emerald-100 shadow-sm animate-in zoom-in-95">
                    <img src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.id}`} className="w-5 h-5 rounded-md" alt="" />
                    <span className="truncate max-w-[120px]">{m.id === user.id ? 'You' : m.displayName}</span>
                    {m.id !== user.id && (
                      <button type="button" onClick={() => setMembers(members.filter(mem => mem.id !== m.id))} className="text-emerald-300 hover:text-rose-500 transition-colors">
                        <X size={14} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isFriendPickerOpen ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <input
                      type="text"
                      placeholder="Search friends or add email..."
                      value={memberSearchQuery}
                      onChange={(e) => {
                        setMemberSearchQuery(e.target.value);
                        setIsFriendPickerOpen(true);
                      }}
                      onFocus={() => setIsFriendPickerOpen(true)}
                      className="w-full bg-slate-50 border-2 border-slate-50 focus:border-emerald-500 focus:bg-white rounded-2xl pl-12 pr-5 py-4 font-bold text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none"
                    />
                  </div>
                  {isEmailInput && (
                    <button 
                      type="button" 
                      onClick={handleAddMemberByEmail}
                      className="h-[56px] px-6 bg-slate-900 text-white rounded-2xl font-black active:scale-95 transition-all shadow-lg text-[10px] uppercase tracking-widest"
                    >
                      Add
                    </button>
                  )}
                </div>

                {isFriendPickerOpen && (memberSearchQuery.length > 0 || friends.length > 0) && (
                  <div className="absolute top-full mt-3 left-0 right-0 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 z-[10001] overflow-hidden flex flex-col max-h-64 animate-in slide-in-from-top-2">
                    <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                      <p className="px-3 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Select from Barkada</p>
                      {filteredFriends.length > 0 ? filteredFriends.map((f) => {
                        const isSelected = members.some(m => m.id === f.id);
                        return (
                          <button 
                            key={f.id} 
                            type="button" 
                            onClick={() => toggleMemberSelection(f)} 
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isSelected ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50'}`}
                          >
                            <div className="flex items-center gap-3">
                              <img src={f.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.id}`} className="w-8 h-8 rounded-lg" alt="" />
                              <div className="text-left">
                                <p className="text-xs font-black">{f.displayName}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase truncate">{f.email}</p>
                              </div>
                            </div>
                            {isSelected && <Check size={18} strokeWidth={3} />}
                          </button>
                        );
                      }) : !isEmailInput && (
                        <div className="p-6 text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching friends, bes!</p>
                        </div>
                      )}
                      
                      {isEmailInput && (
                        <button 
                          type="button" 
                          onClick={handleAddMemberByEmail}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-emerald-600 transition-all border-t border-slate-50 mt-1"
                        >
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Plus size={16} strokeWidth={3} />
                          </div>
                          <p className="text-xs font-black">Add "{memberSearchQuery}"</p>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="p-6 md:p-10 bg-white border-t border-slate-50 shrink-0 pb-8 md:pb-12 shadow-[0_-15px_40px_rgba(0,0,0,0.04)]">
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-4 border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-400 uppercase tracking-widest text-[10px] transition-all active:scale-95 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={isSubmitting || members.length < 1} className="flex-1 px-4 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black hover:bg-emerald-700 shadow-2xl shadow-emerald-100 transition-all active:scale-95 text-[10px] uppercase tracking-widest disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Confirm Group'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

