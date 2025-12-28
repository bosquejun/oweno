'use client';

import { User } from '@/generated/prisma/client';
import { PaginationResponse } from '@/types';
import { CheckCircle2, Clock, Copy, Heart, Mail, Plus, Search, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

type Tab = 'friends' | 'invited';

// Invite type matching what getInvitesByInviter returns with Clerk data
type InviteFromDB = {
  id: string;
  email: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  groupId?: string | null;
  group?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
  inviter: {
    id: string;
    displayName: string;
    email: string;
    avatar?: string | null;
  };
  invitee?: {
    id: string;
    displayName: string;
    email: string;
    avatar?: string | null;
  } | null;
  expiresAt?: Date | null;
  acceptedAt?: Date | null;
  createdAt: Date;
  clerkInvitationId?: string | null;
  clerkUrl?: string | null;
  clerkStatus?: string | null;
  clerkRevoked?: boolean;
};

export default function FriendsList({ data: friends = [], total, page, limit, invitedFriends }: PaginationResponse<User> & {
    invitedFriends: InviteFromDB[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendEmail || !newFriendEmail.includes('@')) return;
    
    try {
      
        const response = await fetch('/api/invites', {
          method: 'POST',
          body: JSON.stringify({
            email: newFriendEmail,
            groupId: null,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add friend');
        }

        const data = await response.json();
        
        router.refresh();
    } catch (error) {
      console.error('Error adding friend:', error);
    }

    setIsAdding(true);
    setNewFriendEmail('');
    setIsAdding(false);
  };

  // Filter friends and invites based on search query
  const filteredFriends = useMemo(() => {
    if (!searchQuery) return friends;
    const query = searchQuery.toLowerCase();
    return friends.filter(f => 
      f.displayName.toLowerCase().includes(query) || 
      f.email.toLowerCase().includes(query)
    );
  }, [friends, searchQuery]);

  const filteredInvites = useMemo(() => {
    if (!searchQuery) return invitedFriends;
    const query = searchQuery.toLowerCase();
    return invitedFriends.filter(invite => 
      invite.email.toLowerCase().includes(query) ||
      invite.inviter.displayName.toLowerCase().includes(query)
    );
  }, [invitedFriends, searchQuery]);

  const pendingInvites = filteredInvites.filter(inv => inv.status === 'PENDING');
  const acceptedInvites = filteredInvites.filter(inv => inv.status === 'ACCEPTED');

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // Refresh the page or update state
        window.location.reload();
      }
    } catch (error) {
      console.error('Error cancelling invite:', error);
    }
  };

  const handleCopyInviteUrl = async (url: string | null) => {
    if (!url) return;
    
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (error) {
      console.error('Error copying URL:', error);
    }
  };

  return (
    <div className="page-transition">
      <header className="sticky top-0 z-30 -mx-6 px-6 pt-8 pb-4 bg-[#F8FAFC]/90 backdrop-blur-xl flex items-center justify-between gap-3 mb-8 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Your Barkada 🤝</h1>
          <p className="text-[10px] md:text-sm text-slate-500 font-medium truncate uppercase tracking-widest">Manage your close circle.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          <span className="text-sm font-black text-emerald-600">
            {activeTab === 'friends' ? friends.length : pendingInvites.length}
          </span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {activeTab === 'friends' ? 'Friends' : 'Pending'}
          </span>
        </div>
      </header>

      <div className="space-y-8">
        {/* Tabs */}
        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 px-4 py-3 rounded-xl font-black text-sm transition-all ${
              activeTab === 'friends'
                ? 'bg-white text-emerald-600 shadow-md'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('invited')}
            className={`flex-1 px-4 py-3 rounded-xl font-black text-sm transition-all ${
              activeTab === 'invited'
                ? 'bg-white text-emerald-600 shadow-md'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Invited ({pendingInvites.length})
          </button>
        </div>

        {/* Invite Form - Only show on Invited tab */}
        {activeTab === 'invited' && (
          <section className="bg-emerald-600 rounded-[2rem] p-6 md:p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-lg font-black tracking-tight mb-1">Add to Barkada</h2>
                <p className="text-emerald-100 text-xs font-bold">Invite a friend to OweNo by their email.</p>
              </div>
              <form onSubmit={handleQuickAdd} className="flex gap-2 w-full md:w-auto">
                <input 
                  type="email" 
                  value={newFriendEmail} 
                  onChange={(e) => setNewFriendEmail(e.target.value)}
                  placeholder="friend@email.com" 
                  className="flex-1 md:w-64 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:bg-white focus:text-slate-900 focus:outline-none transition-all font-bold text-sm"
                />
                <button 
                  type="submit" 
                  disabled={isAdding || !newFriendEmail}
                  className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-black shadow-lg hover:bg-emerald-50 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Plus size={20} />
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder={activeTab === 'friends' ? 'Search your friends...' : 'Search invites...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 md:py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm"
          />
        </div>

        {/* Friends Tab Content */}
        {activeTab === 'friends' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="group bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50 hover:border-emerald-200 hover:shadow-xl transition-all flex flex-col items-center text-center"
            >
              <div className="relative mb-4">
                <Image unoptimized width={80} height={80} src={friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend?.clerkId}&backgroundColor=b6e3f4`} className="w-20 h-20 rounded-[2rem] border-4 border-slate-50 group-hover:border-emerald-100 transition-all shadow-md" alt={friend.displayName} />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white">
                  <CheckCircle2 size={14} />
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-900 truncate w-full px-2">{friend.displayName}</h3>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6">
                <Mail size={12} />
                <span className="truncate max-w-full">{friend.email}</span>
              </div>
              
              {/* <button
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl font-black transition-all text-[10px] uppercase tracking-widest"
              >
                <UserMinus size={14} />
                Unfriend
              </button> */}
            </div>
            ))}
            
            {filteredFriends.length === 0 && (
              <div className="col-span-full py-16 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-4">
                <Heart size={32} className="text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">Barkada is lonely...</h3>
                <p className="text-xs text-slate-500 font-medium">Add friends from the Invited tab or from group details!</p>
              </div>
            )}
          </div>
        )}

        {/* Invited Tab Content */}
        {activeTab === 'invited' && (
          <div className="space-y-4">
            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clock size={14} />
                  Pending Invitations ({pendingInvites.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="group bg-white rounded-[2rem] p-6 shadow-sm border border-amber-100 hover:border-amber-200 hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Mail size={16} className="text-amber-500" />
                            <h3 className="text-base font-black text-slate-900 truncate">{invite.email}</h3>
                          </div>
                          {invite.group && (
                            <div className="text-xs text-slate-500 font-medium mb-2">
                              For: <span className="font-black text-slate-700">{invite.group.name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              {invite.status}
                            </span>
                            {invite.expiresAt && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                Expires {invite.expiresAt instanceof Date ? invite.expiresAt.toLocaleDateString() : new Date(invite.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {invite.clerkUrl && (
                            <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                              <input
                                type="text"
                                readOnly
                                value={invite.clerkUrl}
                                className="flex-1 text-xs font-mono text-slate-600 bg-transparent border-none outline-none truncate"
                              />
                              <button
                                onClick={() => handleCopyInviteUrl(invite.clerkUrl || null)}
                                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                                title="Copy invite URL"
                              >
                                <Copy size={14} className="text-slate-400" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {invite.clerkUrl && (
                          <button
                            onClick={() => handleCopyInviteUrl(invite.clerkUrl || null)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl font-black transition-all text-[10px] uppercase tracking-widest"
                          >
                            <Copy size={14} />
                            Copy Link
                          </button>
                        )}
                        <button
                          onClick={() => handleCancelInvite(invite.id)}
                          className={`flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl font-black transition-all text-[10px] uppercase tracking-widest ${invite.clerkUrl ? 'px-4' : 'flex-1'}`}
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Invites */}
            {acceptedInvites.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  Accepted ({acceptedInvites.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {acceptedInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="group bg-white rounded-[2rem] p-6 shadow-sm border border-emerald-100 hover:border-emerald-200 hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Mail size={16} className="text-emerald-500" />
                            <h3 className="text-base font-black text-slate-900 truncate">{invite.email}</h3>
                          </div>
                          {invite.group && (
                            <div className="text-xs text-slate-500 font-medium mb-2">
                              For: <span className="font-black text-slate-700">{invite.group.name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              {invite.status}
                            </span>
                            {invite.acceptedAt && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                Accepted {invite.acceptedAt instanceof Date ? invite.acceptedAt.toLocaleDateString() : new Date(invite.acceptedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredInvites.length === 0 && (
              <div className="py-16 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-4">
                <Mail size={32} className="text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">No invitations yet</h3>
                <p className="text-xs text-slate-500 font-medium">Invite friends using the form above!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

