"use client";

import { User } from "@/generated/prisma/client";
import { useAuth } from "@clerk/nextjs";
import {
	LayoutDashboard,
	Loader2,
	LogOut,
	Settings,
	UserCheck,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

export const Layout: React.FC<{
	children: React.ReactNode;
	user: User | null;
}> = ({ children, user }) => {
	const pathname = usePathname();
	const { signOut } = useAuth();
	const [isSigningOut, setIsSigningOut] = useState(false);

	const navItems = [
		{ path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
		{ path: "/groups", icon: Users, label: "My Groups" },
		{ path: "/friends", icon: UserCheck, label: "My Barkada" },
	];

	const handleSignOut = async () => {
		setIsSigningOut(true);
		await signOut();
		setIsSigningOut(false);
	};

	// User is managed by Clerk, no need to sync to UI store

	return (
		<div className='flex flex-col md:flex-row h-screen bg-[#F8FAFC] overflow-hidden relative'>
			{/* Sidebar - Desktop */}
			<aside className='hidden md:flex flex-col w-72 h-full bg-white border-r border-slate-100 px-8 py-10 z-20 shrink-0'>
				<div className='px-2 mb-12'>
					<Link href='/' className='flex items-center gap-4 group'>
						<div className='w-11 h-11 bg-emerald-600 rounded-[1rem] flex items-center justify-center text-white shadow-xl shadow-emerald-100 group-hover:rotate-6 transition-transform'>
							<span className='font-black text-xl'>O</span>
						</div>
						<div>
							<h1 className='text-2xl font-black text-slate-900 tracking-tight leading-none'>
								OweNo
							</h1>
							<p className='text-[9px] font-black text-emerald-500 uppercase tracking-tight leading-none mt-2'>
								Split the bills. OweNo one.
							</p>
						</div>
					</Link>
				</div>

				<nav className='flex-1 space-y-2'>
					<p className='px-4 text-[10px] font-black uppercase text-slate-300 tracking-[0.3em] mb-6'>
						Main Menu
					</p>
					{navItems.map((item) => (
						<Link
							key={item.path}
							href={item.path}
							className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
								pathname === item.path
									? "bg-emerald-600 text-white font-black shadow-lg shadow-emerald-100"
									: "text-slate-400 hover:bg-slate-50 hover:text-slate-900 font-bold"
							}`}
						>
							<item.icon
								size={20}
								strokeWidth={pathname === item.path ? 3 : 2.5}
							/>
							<span className='text-sm tracking-tight'>
								{item.label}
							</span>
						</Link>
					))}
				</nav>

				<div className='mt-auto space-y-6 pt-10'>
					<Link
						href='/settings'
						className={`w-full bg-slate-50/80 hover:bg-slate-100 rounded-[1.5rem] p-5 border border-slate-100/50 backdrop-blur-sm transition-all group/profile flex items-center gap-4 ${
							pathname === "/settings"
								? "bg-emerald-50 border-emerald-200"
								: ""
						}`}
					>
						<div className='relative shrink-0'>
							<Image
								unoptimized
								src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.clerkId}&backgroundColor=b6e3f4`}
								width={48}
								height={48}
								alt={user?.displayName || ""}
								className='w-12 h-12 rounded-[1.1rem] border-2 border-white shadow-md group-hover/profile:scale-105 transition-transform'
							/>
							<div className='absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm'></div>
						</div>
						<div className='flex-1 min-w-0 text-left'>
							<p className='text-sm font-black text-slate-900 truncate'>
								{user?.displayName || user?.email}
							</p>
							<div className='flex items-center gap-1.5 mt-0.5'>
								<Settings
									size={12}
									className='text-slate-400'
								/>
								<p className='text-[10px] text-slate-400 font-black uppercase tracking-widest'>
									Settings
								</p>
							</div>
						</div>
					</Link>

					<button
						disabled={isSigningOut}
						onClick={handleSignOut}
						className='w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-black transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest'
					>
						{isSigningOut ? (
							<Loader2
								size={16}
								strokeWidth={3}
								className='animate-spin'
							/>
						) : (
							<LogOut size={16} strokeWidth={3} />
						)}
						{isSigningOut ? "Signing Out..." : "Sign Out"}
					</button>
				</div>
			</aside>

			{/* Main content area */}
			<main className='flex-1 h-full overflow-y-auto scroll-smooth bg-[#F8FAFC]'>
				<div className='max-w-7xl mx-auto pb-32 md:pb-16 pt-0 md:pt-10 px-6 md:px-12'>
					{children}
				</div>
			</main>

			{/* Mobile Bottom Nav */}
			<nav className='md:hidden fixed bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-lg rounded-3xl border border-white/10 flex justify-around items-center py-4 px-4 z-40 shadow-2xl'>
				{navItems.map((item) => (
					<Link
						key={item.path}
						href={item.path}
						className={`flex flex-col items-center gap-1 transition-all ${
							pathname === item.path
								? "text-emerald-400 scale-110"
								: "text-slate-500"
						}`}
					>
						<item.icon
							size={24}
							strokeWidth={pathname === item.path ? 3 : 2}
						/>
					</Link>
				))}
				<Link
					href='/settings'
					className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
						pathname === "/settings"
							? "border-emerald-400"
							: "border-white/20"
					} active:scale-95`}
				>
					<Image
								src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.clerkId}&backgroundColor=b6e3f4`}
								width={36}
						height={36}
						className='w-full h-full object-cover'
						alt={user?.displayName || ""}
						unoptimized
					/>
				</Link>
			</nav>
		</div>
	);
};
