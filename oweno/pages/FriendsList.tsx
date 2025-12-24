import React, { useState } from 'react';
import { useFriends, useRemoveFriend, useAddFriend } from '../hooks/useSplits';
import { UserPlus, Search, UserMinus, Loader2, Heart, Mail, CheckCircle2, Plus } from 'lucide-react';
import { User } from '../types';

export const FriendsList: React.FC = () => {
  const { data: friends = [], isLoading } = useFriends();
  const removeFriendMutation = useRemoveFriend();
  const addFriendMutation = useAddFriend();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendEmail || !newFriendEmail.includes('@')) return;
    
    setIsAdding(true);
    const newFriend: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFriendEmail.split('@')[0],
      email: newFriendEmail,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newFriendEmail}`
    };
    
    await addFriendMutation.mutateAsync(newFriend);
    setNewFriendEmail('');
    setIsAdding(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading your barkada...</p>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <header className="sticky top-0 z-30 -mx-6 px-6 pt-8 pb-4 bg-[#F8FAFC]/90 backdrop-blur-xl flex items-center justify-between gap-3 mb-8 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Your Barkada 🤝</h1>
          <p className="text-[10px] md:text-sm text-slate-500 font-medium truncate uppercase tracking-widest">Manage your close circle.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          <span className="text-sm font-black text-emerald-600">{friends.length}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Friends</span>
        </div>
      </header>

      <div className="space-y-8">
        {/* Quick Add Form */}
        <section className="bg-emerald-600 rounded-[2rem] p-6 md:p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-lg font-black tracking-tight mb-1">Add to Barkada</h2>
              <p className="text-emerald-100 text-xs font-bold">Invite a friend to SplitEase by their email.</p>
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

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search your friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 md:py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-700 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="group bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50 hover:border-emerald-200 hover:shadow-xl transition-all flex flex-col items-center text-center"
            >
              <div className="relative mb-4">
                <img src={friend.avatar} className="w-20 h-20 rounded-[2rem] border-4 border-slate-50 group-hover:border-emerald-100 transition-all shadow-md" alt={friend.name} />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white">
                  <CheckCircle2 size={14} />
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-900 truncate w-full px-2">{friend.name}</h3>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6">
                <Mail size={12} />
                <span className="truncate max-w-[150px]">{friend.email}</span>
              </div>
              
              <button
                onClick={() => removeFriendMutation.mutate(friend.id)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl font-black transition-all text-[10px] uppercase tracking-widest"
              >
                <UserMinus size={14} />
                Unfriend
              </button>
            </div>
          ))}
          
          {filteredFriends.length === 0 && (
            <div className="col-span-full py-16 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-4">
              <Heart size={32} className="text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Barkada is lonely...</h3>
              <p className="text-xs text-slate-500 font-medium">Add friends using the form above or from group details!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};