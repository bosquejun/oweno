"use client";

import { useAllExpenses, useGroups } from "@/hooks/useSplits";
import { useUIStore } from "@/contexts/UIContext";
import { calculateBalances } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import {
	Loader2,
	Plus,
	Receipt,
	Sparkles,
	Tag,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
	const { currentUser, preferredCurrency, preferredLocale } = useUIStore();
	const { data: groups = [], isLoading: isLoadingGroups } = useGroups();
	const { data: allExpenses = [], isLoading: isLoadingExpenses } =
		useAllExpenses();

	if (isLoadingGroups || isLoadingExpenses) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[60vh] gap-3'>
				<Loader2 className='w-8 h-8 text-emerald-600 animate-spin' />
				<p className='text-slate-400 font-bold uppercase tracking-widest text-[10px]'>
					Getting your bills ready...
				</p>
			</div>
		);
	}

	let totalNet = 0;
	let toReceive = 0;
	let toSettle = 0;

	groups.forEach((group) => {
		const groupExpenses = allExpenses.filter((e) => e.groupId === group.id);
		const groupBalances = calculateBalances(group.members, groupExpenses);
		const myGroupBalance =
			groupBalances.find((b) => b.userId === currentUser.id)?.net || 0;

		totalNet += myGroupBalance;
		if (myGroupBalance > 0) toReceive += myGroupBalance;
		if (myGroupBalance < 0) toSettle += Math.abs(myGroupBalance);
	});

	const recentActivities = [...allExpenses]
		.sort((a, b) => b.date.getTime() - a.date.getTime())
		.slice(0, 8);

	return (
		<div className='page-transition space-y-12'>
			<header className='sticky top-0 z-30 -mx-6 md:-mx-12 px-6 md:px-12 pt-8 md:pt-4 pb-6 bg-[#F8FAFC]/90 backdrop-blur-xl flex justify-between items-center'>
				<div>
					<h1 className='text-3xl md:text-4xl font-black text-slate-900 tracking-tight'>
						Mabuhay, {currentUser.name}! 👋
					</h1>
					<p className='text-sm md:text-base text-slate-500 font-medium mt-1'>
						Everything&apos;s looking good today.
					</p>
				</div>
				<Link
					href='/groups'
					className='flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-[1.2rem] font-black transition-all shadow-xl shadow-emerald-100 active:scale-95 text-xs uppercase tracking-widest'
				>
					<Plus size={20} strokeWidth={3} />
					<span className='hidden sm:inline'>New Group</span>
				</Link>
			</header>

			<div className='relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl'>
				<div className='absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 blur-[120px] rounded-full -mr-32 -mt-32'></div>
				<div className='relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12'>
					<div className='space-y-4'>
						<div className='inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/5'>
							<Sparkles size={14} className='text-emerald-400' />
							<span className='text-white/80 font-black uppercase tracking-widest text-[9px]'>
								Total Net Balance
							</span>
						</div>
						<h2
							className={`text-5xl md:text-7xl font-black tabular-nums tracking-tighter ${
								totalNet < 0
									? "text-rose-400"
									: "text-emerald-400"
							}`}
						>
							{formatCurrency(
								totalNet,
								preferredCurrency,
								preferredLocale
							)}
						</h2>
						<p className='text-slate-400 font-bold text-sm md:text-base'>
							{totalNet >= 0
								? "You're ahead of the game, lods!"
								: "Time to settle some bills, bes!"}
						</p>
					</div>

					<div className='flex flex-col sm:flex-row gap-6 md:gap-10 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md'>
						<div className='space-y-2'>
							<div className='flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-[9px]'>
								<TrendingUp size={14} strokeWidth={3} />
								To Receive
							</div>
							<p className='text-2xl md:text-3xl font-black'>
								{formatCurrency(
									toReceive,
									preferredCurrency,
									preferredLocale
								)}
							</p>
						</div>
						<div className='hidden sm:block w-px h-auto bg-white/10'></div>
						<div className='space-y-2'>
							<div className='flex items-center gap-2 text-rose-400 font-black uppercase tracking-widest text-[9px]'>
								<TrendingDown size={14} strokeWidth={3} />
								To Settle
							</div>
							<p className='text-2xl md:text-3xl font-black'>
								{formatCurrency(
									toSettle,
									preferredCurrency,
									preferredLocale
								)}
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 xl:grid-cols-12 gap-10'>
				<section className='xl:col-span-8 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm'>
					<div className='flex items-center justify-between mb-8'>
						<h3 className='text-xl font-black text-slate-900 flex items-center gap-3'>
							<Receipt size={24} className='text-slate-300' />
							Recent Activity
						</h3>
						<Link
							href='/groups'
							className='px-5 py-2 bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-slate-500 rounded-full uppercase tracking-widest transition-colors'
						>
							See All
						</Link>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{recentActivities.length === 0 ? (
							<div className='col-span-full py-20 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100'>
								<p className='text-slate-400 font-bold text-sm'>
									No spendings yet. Treat yourself?
								</p>
							</div>
						) : (
							recentActivities.map((exp) => (
								<Link
									key={exp.id}
									href={`/groups/${exp.groupId}`}
									className='flex items-center gap-4 p-5 bg-white hover:bg-slate-50 rounded-[1.8rem] transition-all border border-slate-50 hover:border-emerald-100 group shadow-sm hover:shadow-md'
								>
									<div className='w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0'>
										<Tag size={20} />
									</div>
									<div className='flex-1 min-w-0'>
										<p className='text-sm font-black text-slate-900 truncate'>
											{exp.title}
										</p>
										<p className='text-[10px] text-slate-400 font-bold uppercase mt-0.5'>
											{format(exp.date, "MMM dd, yyyy")}
										</p>
									</div>
									<p className='text-sm font-black text-slate-900 shrink-0'>
										{formatCurrency(
											exp.amount,
											preferredCurrency,
											preferredLocale
										)}
									</p>
								</Link>
							))
						)}
					</div>
				</section>

				<section className='xl:col-span-4 space-y-6 flex flex-col'>
					<div className='bg-emerald-600 rounded-[3rem] p-10 text-white flex-1 flex flex-col justify-between shadow-xl shadow-emerald-100/50 relative overflow-hidden'>
						<div className='absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 blur-[60px] rounded-full'></div>
						<div className='relative z-10'>
							<div className='w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-sm mb-8'>
								<Sparkles size={28} />
							</div>
							<h3 className='text-2xl font-black mb-4 leading-tight'>
								Barkada <br />
								Settle-up
							</h3>
							<p className='text-emerald-50 text-base font-medium leading-relaxed opacity-90'>
								We track all your shared costs across all
								groups. Ready to see who owes what in your
								barkada?
							</p>
						</div>
						<Link
							href='/groups'
							className='relative z-10 mt-12 flex items-center justify-center gap-3 bg-white text-emerald-700 py-5 rounded-[1.5rem] font-black shadow-2xl hover:bg-emerald-50 transition-all text-xs uppercase tracking-widest active:scale-95'
						>
							View All Groups
						</Link>
					</div>

					<div className='bg-slate-900 rounded-[3rem] p-8 text-white'>
						<div className='flex items-center gap-3 mb-4'>
							<div className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse'></div>
							<p className='text-[10px] font-black uppercase tracking-widest text-emerald-400'>
								System Status
							</p>
						</div>
						<p className='text-xs font-bold text-slate-400'>
							All syncs are active. Your shared balances are up to
							date.
						</p>
					</div>
				</section>
			</div>
		</div>
	);
}
