'use client';

import { CreateGroupModal } from '@/components/modals/CreateGroupModal';
import { Group, User } from '@/generated/prisma/client';
import { format } from 'date-fns';
import { Calendar, ChevronRight, Heart, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


type GroupWithMembers = Group & {
  members: User[];
};

export default function GroupsList({groups = [], friends = [], user}: {groups: GroupWithMembers[], user: User, friends: User[]}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  return (
    <>
      <div className="page-transition">
        <header className="sticky top-0 z-30 -mx-6 px-6 pt-8 pb-4 bg-[#F8FAFC]/90 backdrop-blur-xl flex items-center justify-between gap-3 mb-8 md:mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Your Groups 🫂</h1>
            <p className="text-[10px] md:text-sm text-slate-500 font-medium truncate uppercase tracking-widest">Keep things simple.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95 text-xs md:text-sm"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New Group</span>
            <span className="sm:hidden">New</span>
          </button>
        </header>

        <div className="space-y-6 md:space-y-8">
          {/* <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Find a group..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-3.5 md:py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm"
            />
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {groups.map((group) => {
              const hasDates = group.startDate && group.endDate;
              const dateRange = hasDates 
                ? `${format(group.startDate!, 'MMM dd')} - ${format(group.endDate!, 'MMM dd, yyyy')}`
                : format(group.createdAt, 'MMM yyyy');

              return (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="group block bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50 hover:border-emerald-200 hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl font-black shadow-inner">
                      {group.name.charAt(0)}
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors truncate">{group.name}</h3>
                  <p className="text-xs text-slate-500 mb-6 line-clamp-2 h-8 font-medium">{group.description || "Just a fun group spending together!"}</p>
                  
                  {hasDates && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                      <Calendar size={12} className="text-emerald-600" />
                      <span className="text-[9px] font-black text-emerald-700 uppercase tracking-tight">{dateRange}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex -space-x-2.5">
                      {group.members.slice(0, 4).map((m) => (
                        <img key={m.id} src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m?.clerkId}&backgroundColor=b6e3f4`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt={m.displayName} />
                      ))}
                      {group.members.length > 4 && <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-50 flex items-center justify-center text-[10px] font-black text-emerald-700 shadow-sm">+{group.members.length - 4}</div>}
                    </div>
                    {!hasDates && (
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider"><Calendar size={12} />{dateRange}</div>
                    )}
                  </div>
                </Link>
              );
            })}
            {groups.length === 0 && (
              <div className="col-span-full py-16 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-4">
                <Heart size={32} className="text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">No groups yet</h3>
                <p className="text-xs text-slate-500 font-medium">Create a group to track your next adventure!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <CreateGroupModal
      onSuccess={(groupId)=>{
        router.push(`/groups/${groupId}`);
      }}
      friends={friends}
      user={user}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

