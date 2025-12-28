
import { getCachedExpensesByGroupId } from '@/services/expenseService';
import { getCachedFriendsListByUserId } from '@/services/friendService';
import { getCachedGroupDetailsById } from '@/services/groupService';
import { getCachedUserById } from '@/services/userService';
import { auth } from '@clerk/nextjs/server';
import { Loader2, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Loading = () => <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
<Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
<p className="text-slate-400 font-bold uppercase text-[10px]">Loading barkada details...</p>
</div>


const ClientPage = dynamic(() => import("./page.client"), {
  loading: () => <Loading/>,
});

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const {userId} = await auth();
  if (!userId) {
    return <Loading/>
  }
  const user = await getCachedUserById(userId);
  if (!user) {
    return <Loading/>
  }

  const group = await getCachedGroupDetailsById(id);
  
  if (!group) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
    <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-6">
       <Search size={32} />
    </div>
    <h2 className="text-2xl font-black text-slate-900 mb-2">Group not found, bes! 🔍</h2>
    <p className="text-sm text-slate-500 font-medium mb-8 max-w-xs">We couldn't find the group with ID: <span className="font-bold text-slate-700">{id}</span>. Maybe it was deleted or the link is wrong.</p>
    <Link href="/groups" className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all active:scale-95 text-xs uppercase tracking-widest">
       Back to My Groups
    </Link>
  </div>
  }
  const friends = await getCachedFriendsListByUserId(user.id, {limit: 100, page:1});

  const expenses = await getCachedExpensesByGroupId(group.id);


  return <ClientPage friends={friends.data || []} group={group} user={user} expenses={expenses || []} />
}

