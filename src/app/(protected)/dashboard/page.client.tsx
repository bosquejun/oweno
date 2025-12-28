"use client";

import { User } from "@/generated/prisma/client";
import { CATEGORY_STYLES } from "@/lib/category-styles";
import { calculateBalances, simplifyDebts } from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import {
	ArrowRight,
	Plus,
	Receipt,
	Sparkles,
	Tag,
	TrendingDown,
	TrendingUp,
	Wallet
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { DetailedExpense } from "../groups/[id]/page.client";

export default function Dashboard({user, expenses}: {user: User; expenses: DetailedExpense[]}) {



	const {toReceive,toSettle,totalNet, myDebts, myCredits, allUsers} = useMemo(() => {
		if (!expenses || expenses.length === 0) {
			return { totalNet: 0, toReceive: 0, toSettle: 0, myDebts: [], myCredits: [], allUsers: [] };
		}

		// Collect all unique users from all expenses
		// We need to include: group members, payers, and split participants
		const userMap = new Map<string, User>();
		
		// Always include the current user
		userMap.set(user.id, user);
		
		// First pass: collect all users from group members
		expenses.forEach((exp) => {
			if (exp.group && 'members' in exp.group && Array.isArray(exp.group.members)) {
				exp.group.members.forEach((member: User) => {
					userMap.set(member.id, member);
				});
			}
		});
		
		// Second pass: ensure all payers and split participants are included
		// If they're not in group members, we need to get them from paidBy
		expenses.forEach((exp) => {
			// Add the payer (they should be in group members, but ensure they're included)
			if (exp.paidBy && !userMap.has(exp.paidBy.id)) {
				userMap.set(exp.paidBy.id, exp.paidBy);
			}
			
			// For split participants, they should be in group members
			// But if not, we'll need to handle it in calculateBalances
		});

		const allUsersArray = Array.from(userMap.values());
		
		// Use the same calculation as group detail page
		// This ensures consistency between dashboard and group detail views
		const balances = calculateBalances(allUsersArray, expenses);
		const userBalance = balances.find(b => b.userId === user.id);
		const totalNet = userBalance?.net || 0;

		// Calculate toReceive and toSettle from totalNet
		// toReceive = positive net (what others owe the user)
		// toSettle = negative net (what the user owes others)
		const toReceive = totalNet > 0 ? totalNet : 0;
		const toSettle = totalNet < 0 ? Math.abs(totalNet) : 0;

		// Calculate simplified debts
		const debts = simplifyDebts(balances);
		const myDebts = debts.filter(d => d.from === user.id);
		const myCredits = debts.filter(d => d.to === user.id);

		return {
			totalNet,
			toReceive,
			toSettle,
			myDebts,
			myCredits,
			allUsers: allUsersArray
		}
	}, [expenses, user.id])


	return (
		<div className='page-transition space-y-12'>
			<header className='sticky top-0 z-30 -mx-6 md:-mx-12 px-6 md:px-12 pt-8 md:pt-4 pb-6 bg-[#F8FAFC]/90 backdrop-blur-xl flex justify-between items-center'>
				<div>
					<h1 className='text-3xl md:text-4xl font-black text-slate-900 tracking-tight'>
						Mabuhay, {user.displayName}! 👋
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
								user.preferredCurrency,
								user.preferredLocale
							)}
						</h2>
						<p className='text-slate-400 font-bold text-sm md:text-base'>
							{totalNet >= 0
								? "You're ahead of the game, lods!"
								: "Time to pay some bills, bes!"}
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
									user.preferredCurrency,
								user.preferredLocale
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
									user.preferredCurrency,
								user.preferredLocale
								)}
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-10'>
				<div className='xl:col-span-8 space-y-6 md:space-y-10'>
					{(myDebts.length > 0 || myCredits.length > 0) && (
						<section className='bg-amber-50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-amber-100 shadow-sm overflow-hidden relative'>
							<div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
								<Wallet size={80} className="text-amber-900" />
							</div>
							<h2 className="text-lg md:text-xl font-black text-amber-900 flex items-center gap-3 mb-6 relative z-10">
								<Wallet size={24} className="text-amber-400" />
								My Debts
							</h2>
							<div className="space-y-3 relative z-10">
								{myDebts.length > 0 && (
									<div className="space-y-2">
										<h3 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-2">To Pay</h3>
										{myDebts.map((debt, idx) => {
											const creditor = allUsers.find(u => u.id === debt.to);
											return (
												<div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-100 shadow-sm">
													<div className="flex items-center gap-3 min-w-0 flex-1">
														<Image unoptimized src={creditor?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creditor?.clerkId}&backgroundColor=b6e3f4`} className="w-8 h-8 rounded-lg border border-slate-100 shrink-0" alt="" width={32} height={32} />
														<div className="flex items-center gap-2 min-w-0 flex-1">
															<span className="text-[11px] font-black text-rose-600 truncate">You</span>
															<ArrowRight size={12} className="text-amber-400 shrink-0" />
															<span className="text-[11px] font-black text-slate-700 truncate">{creditor?.displayName || 'Unknown'}</span>
														</div>
													</div>
													<p className="text-sm font-black text-slate-900 tabular-nums">
														{formatCurrency(debt.amount, user.preferredCurrency, user.preferredLocale)}
													</p>
												</div>
											);
										})}
									</div>
								)}
								{myCredits.length > 0 && (
									<div className="space-y-2">
										<h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">To Receive</h3>
										{myCredits.map((debt, idx) => {
											const debtor = allUsers.find(u => u.id === debt.from);
											return (
												<div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-100 shadow-sm">
													<div className="flex items-center gap-3 min-w-0 flex-1">
														<Image unoptimized src={debtor?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${debtor?.clerkId}&backgroundColor=b6e3f4`} className="w-8 h-8 rounded-lg border border-slate-100 shrink-0" alt="" width={32} height={32} />
														<div className="flex items-center gap-2 min-w-0 flex-1">
															<span className="text-[11px] font-black text-slate-700 truncate">{debtor?.displayName || 'Unknown'}</span>
															<ArrowRight size={12} className="text-amber-400 shrink-0" />
															<span className="text-[11px] font-black text-emerald-600 truncate">You</span>
														</div>
													</div>
													<p className="text-sm font-black text-slate-900 tabular-nums">
														{formatCurrency(debt.amount, user.preferredCurrency, user.preferredLocale)}
													</p>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</section>
					)}

				<section className='bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-slate-100 shadow-sm'>
					<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8'>
						<h3 className='text-lg md:text-xl font-black text-slate-900 flex items-center gap-3'>
							<Receipt size={20} className='md:w-6 md:h-6 text-slate-300' />
							Recent Activity
						</h3>
						<Link
							href='/groups'
							className='px-4 md:px-5 py-2 bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-slate-500 rounded-full uppercase tracking-widest transition-colors self-start sm:self-auto'
						>
							See All
						</Link>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
						{expenses.length === 0 ? (
							<div className='col-span-full py-16 md:py-20 text-center bg-slate-50/50 rounded-[1.5rem] md:rounded-[2rem] border-2 border-dashed border-slate-100'>
								<p className='text-slate-400 font-bold text-xs md:text-sm'>
									No spendings yet. Treat yourself?
								</p>
							</div>
						) : (
							expenses.slice(0, 8).map((exp) => {
								const style = CATEGORY_STYLES[exp.category || ''] || { color: 'bg-slate-100 text-slate-400 border-slate-100', icon: Tag };
								const CategoryIcon = style.icon;
								
								return (
									<Link
										key={exp.id}
										href={`/groups/${exp.groupId}`}
										className='flex items-start sm:items-center gap-3 md:gap-4 p-4 md:p-5 bg-white hover:bg-slate-50 rounded-[1.5rem] md:rounded-[1.8rem] transition-all border border-slate-50 hover:border-emerald-100 group shadow-sm hover:shadow-md'
									>
										<div className={`w-10 h-10 md:w-12 md:h-12 ${style.color} rounded-xl md:rounded-2xl flex items-center justify-center border transition-colors shrink-0 group-hover:scale-105`}>
											<CategoryIcon size={18} className='md:w-5 md:h-5' />
										</div>
										<div className='flex-1 min-w-0'>
											<p className='text-xs md:text-sm font-black text-slate-900 truncate leading-tight'>
												{exp.title}
											</p>
											<div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1 md:mt-0.5'>
												{exp.group && (
													<p className='text-[9px] md:text-[10px] text-emerald-600 font-black uppercase tracking-tight truncate'>
														{exp.group.name}
													</p>
												)}
												<p className='text-[9px] md:text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap'>
													{format(exp.date, "MMM dd, yyyy")}
												</p>
											</div>
										</div>
										<p className='text-xs md:text-sm font-black text-slate-900 shrink-0 tabular-nums'>
											{exp.category === 'Settlement' ? '-' : '+'}{formatCurrency(
												exp.amount,
												user.preferredCurrency,
								user.preferredLocale
											)}
										</p>
									</Link>
								);
							})
						)}
					</div>
				</section>
				</div>

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
								groups. Ready to see who needs to pay what in your
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
