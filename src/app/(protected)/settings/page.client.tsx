"use client";

import { Input } from "@/components/ui/Input";
import { User } from "@/generated/prisma/client";
import { UserSchema } from "@/schemas";
import { UserType } from "@/types";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	ArrowLeft,
	AtSign,
	Check,
	CreditCard,
	Globe,
	Mail,
	RefreshCw,
	RotateCcw,
	Save,
	Sparkles,
	User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const CURRENCIES = [
	{ code: "PHP", symbol: "₱", label: "Philippine Peso" },
	// { code: "USD", symbol: "$", label: "US Dollar" },
	// { code: "EUR", symbol: "€", label: "Euro" },
	// { code: "JPY", symbol: "¥", label: "Japanese Yen" },
	// { code: "GBP", symbol: "£", label: "British Pound" },
];

const LOCALES = [{ code: "en-PH", label: "English (Philippines)" }];

export default function SettingsPage({ user }: { user: User }) {
	const router = useRouter();
	const [isRotating, setIsRotating] = useState(false);
	const { user: clerkUser } = useUser();
	const [isSaved, setIsSaved] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isSubmitting, isDirty },
	} = useForm<UserType>({
		resolver: zodResolver(UserSchema),
		values: {
			id: user.id,
			displayName: user.displayName,
			email: user.email,
			avatar: user.avatar || undefined,
			preferredCurrency: user.preferredCurrency || "PHP",
			preferredLocale: user.preferredLocale || "en-PH",
		},
	});

	const { avatar, preferredCurrency, preferredLocale } = watch();

	const handleRegenerateAvatar = () => {
		setIsRotating(true);
		const newSeed = Math.random().toString(36).substring(7);
		const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}_${newSeed}&backgroundColor=a4f4cf`;
		setValue("avatar", newAvatar, { shouldDirty: true });
		setTimeout(() => setIsRotating(false), 500);
	};

	const onFormSubmit = async (data: UserType) => {
		setError(null);

		try {
			const response = await fetch("/api/users/me", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					displayName: data.displayName,
					preferredCurrency: data.preferredCurrency,
					preferredLocale: data.preferredLocale,
					avatar: data.avatar,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update profile");
			}

			// Reload user to get updated metadata
			await clerkUser?.reload();

			// Fetch updated user data from the server
			const updatedUserResponse = await fetch("/api/users/me");
			if (updatedUserResponse.ok) {
				const updatedUser = await updatedUserResponse.json();
				// Update form with fresh data
				reset(
					{
						id: updatedUser.id,
						displayName: updatedUser.displayName,
						email: updatedUser.email,
						avatar: updatedUser.avatar || undefined,
						preferredCurrency:
							updatedUser.preferredCurrency || "PHP",
						preferredLocale: updatedUser.preferredLocale || "en-PH",
					},
					{ keepValues: false }
				);
			} else {
				// Fallback: just reset with submitted data
				reset(data, { keepValues: true });
			}

			// Refresh the server component to get fresh data
			router.refresh();

			setIsSaved(true);
			setTimeout(() => setIsSaved(false), 3000);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Something went wrong. Please try again."
			);
		}
	};
	return (
		<div className='page-transition pb-24'>
			{/* Header */}
			<header className='sticky top-0 z-30 -mx-6 md:-mx-12 px-6 md:px-12 pt-8 md:pt-4 pb-6 bg-[#F8FAFC]/90 backdrop-blur-xl flex items-center justify-between gap-4 mb-8 md:mb-10'>
				<div className='flex items-center gap-4'>
					<Link
						href='/dashboard'
						className='p-2 -ml-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shrink-0'
					>
						<ArrowLeft size={22} />
					</Link>
					<div>
						<h1 className='text-3xl md:text-4xl font-black text-slate-900 tracking-tight'>
							Settings ⚙️
						</h1>
						<p className='text-sm md:text-base text-slate-500 font-medium mt-1'>
							Customize your OweNah experience
						</p>
					</div>
				</div>
				{isDirty && !isSaved && (
					<div className='hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl'>
						<div className='w-2 h-2 rounded-full bg-amber-500 animate-pulse'></div>
						<span className='text-xs font-black text-amber-700 uppercase tracking-widest'>
							Unsaved changes
						</span>
					</div>
				)}
			</header>

			<form
				id='settings-form'
				onSubmit={handleSubmit(onFormSubmit, (errors) => {
					console.error("Form validation errors:", errors);
					const firstError = Object.values(errors)[0];
					if (firstError?.message) {
						setError(firstError.message as string);
					} else {
						setError(
							"Please fix the form errors before submitting."
						);
					}
				})}
				className='space-y-8'
			>
				{/* Hidden field for id */}
				<input type='hidden' {...register("id")} />

				{/* Profile Section */}
				<section className='bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm'>
					<div className='flex items-center gap-3 mb-8'>
						<div className='w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center'>
							<UserIcon size={24} className='text-emerald-600' />
						</div>
						<div>
							<h2 className='text-xl md:text-2xl font-black text-slate-900 tracking-tight'>
								Profile Information
							</h2>
							<p className='text-xs text-slate-500 font-medium mt-0.5'>
								Update your personal details and avatar
							</p>
						</div>
					</div>

					<div className='space-y-8'>
						{/* Avatar Section */}
						<div className='flex flex-col items-center gap-6 pb-8 border-b border-slate-100'>
							<div className='relative group/avatar'>
								<div className='absolute inset-0 bg-emerald-500/10 rounded-[2.5rem] blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity'></div>
								<img
									src={avatar}
									className='relative w-32 h-32 rounded-[2.5rem] border-4 border-slate-50 shadow-xl group-hover/avatar:scale-105 transition-transform'
									alt='Profile avatar'
								/>
								<button
									type='button'
									onClick={handleRegenerateAvatar}
									className='absolute -bottom-2 -right-2 bg-emerald-600 text-white p-3 rounded-2xl shadow-lg hover:bg-emerald-700 active:scale-90 transition-all border-4 border-white z-10'
									title='Generate new avatar'
								>
									<RefreshCw
										size={18}
										strokeWidth={3}
										className={
											isRotating ? "animate-spin" : ""
										}
									/>
								</button>
							</div>
							<div className='text-center'>
								<p className='text-sm font-black text-slate-900 mb-1'>
									Your Avatar
								</p>
								<p className='text-xs text-slate-500 font-medium'>
									Click the refresh button to generate a new
									avatar
								</p>
							</div>
						</div>

						{/* Name and Email */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<Input
								label='Display Name'
								icon={AtSign}
								placeholder='Your Name'
								error={errors.displayName?.message}
								{...register("displayName")}
							/>
							<Input
								label='Email Address'
								icon={Mail}
								placeholder='your@email.com'
								error={errors.email?.message}
								{...register("email", {
									required: false,
									disabled: true,
								})}
								disabled
							/>
						</div>
					</div>
				</section>

				{/* Preferences Section */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					{/* Currency Selection */}
					<section className='bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-sm'>
						<div className='flex items-center gap-3 mb-8'>
							<div className='w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center shadow-sm'>
								<CreditCard
									size={24}
									className='text-blue-600'
								/>
							</div>
							<div>
								<h3 className='text-xl font-black text-slate-900 tracking-tight'>
									Preferred Currency
								</h3>
								<p className='text-xs text-slate-500 font-medium mt-0.5'>
									Choose how amounts are displayed
								</p>
							</div>
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
							{CURRENCIES.map((c) => {
								const isSelected = preferredCurrency === c.code;
								return (
									<button
										key={c.code}
										type='button'
										onClick={() =>
											setValue("preferredCurrency", c.code, {
												shouldDirty: true,
											})
										}
										className={`group relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
											isSelected
												? "bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-600 text-white shadow-xl shadow-emerald-100/50 scale-[1.02]"
												: "bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-md"
										}`}
									>
										{/* Selection Indicator */}
										{isSelected && (
											<div className='absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg'>
												<Check size={12} className='text-white' strokeWidth={3} />
											</div>
										)}
										
										{/* Currency Symbol */}
										<div className={`flex items-center gap-3 w-full ${
											isSelected ? 'text-white' : 'text-slate-900'
										}`}>
											<div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black ${
												isSelected 
													? 'bg-white/20 backdrop-blur-sm' 
													: 'bg-slate-100 group-hover:bg-emerald-100'
											} transition-colors`}>
												{c.symbol}
											</div>
											<div className='flex-1 min-w-0'>
												<div className='flex items-center gap-2'>
													<span className={`text-lg font-black ${
														isSelected ? 'text-white' : 'text-slate-900'
													}`}>
														{c.code}
													</span>
												</div>
												<p className={`text-xs font-medium mt-0.5 truncate ${
													isSelected ? 'text-white/80' : 'text-slate-500'
												}`}>
													{c.label}
												</p>
											</div>
										</div>
										
										{/* Hover effect indicator */}
										{!isSelected && (
											<div className='absolute inset-0 rounded-2xl bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors pointer-events-none'></div>
										)}
									</button>
								);
							})}
						</div>
					</section>

					{/* Locale Selection */}
					<section className='bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-sm'>
						<div className='flex items-center gap-3 mb-6'>
							<div className='w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center'>
								<Globe size={20} className='text-purple-600' />
							</div>
							<div>
								<h3 className='text-lg font-black text-slate-900 tracking-tight'>
									Regional Format
								</h3>
								<p className='text-xs text-slate-500 font-medium'>
									Choose your locale preference
								</p>
							</div>
						</div>
						<div className='space-y-3'>
							{LOCALES.map((l) => (
								<button
									key={l.code}
									type='button'
									onClick={() =>
										setValue("preferredLocale", l.code, {
											shouldDirty: true,
										})
									}
									className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
										preferredLocale === l.code
											? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-md"
											: "bg-white border-slate-200 text-slate-400 hover:border-emerald-300 hover:bg-slate-50"
									}`}
								>
									<div className='flex flex-col items-start'>
										<span className='text-sm font-black'>
											{l.label}
										</span>
										<span className='text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1'>
											Primary Support
										</span>
									</div>
									{preferredLocale === l.code && (
										<div className='w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center'>
											<Check
												size={14}
												className='text-white'
												strokeWidth={3}
											/>
										</div>
									)}
								</button>
							))}
						</div>
					</section>
				</div>

				{/* Info Card */}
				<div className='bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden'>
					<div className='absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full -mr-20 -mt-20'></div>
					<div className='relative z-10 flex items-start gap-4'>
						<div className='w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/30'>
							<Sparkles size={24} className='text-emerald-400' />
						</div>
						<div>
							<h3 className='text-lg font-black mb-2'>
								All Set, Bes! ✨
							</h3>
							<p className='text-sm text-slate-300 font-medium leading-relaxed'>
								Your preferences are saved automatically.
								Changes take effect immediately across all your
								groups and expenses.
							</p>
						</div>
					</div>
				</div>

				{/* Error Display */}
				{error && (
					<div className='bg-rose-50 border-2 border-rose-200 rounded-2xl p-4'>
						<p className='text-rose-600 text-sm font-bold'>
							{error}
						</p>
					</div>
				)}
			</form>

			{/* Floating Save/Reset Buttons - Only shows when dirty */}
			{isDirty && (
				<div className='fixed bottom-24 md:bottom-8 left-1/2 md:left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-auto z-50 animate-slide-up'>
					<div className='bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-4 flex gap-3'>
						<button
							type='button'
							onClick={() => {
								reset(
									{
										id: user.id,
										displayName: user.displayName,
										email: user.email,
										avatar: user.avatar || undefined,
										preferredCurrency:
											user.preferredCurrency || "PHP",
										preferredLocale:
											user.preferredLocale || "en-PH",
									},
									{ keepValues: false }
								);
								setError(null);
							}}
							disabled={isSubmitting}
							className='px-6 py-4 bg-slate-100 text-slate-700 rounded-xl font-black active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-slate-200'
						>
							<RotateCcw size={16} strokeWidth={3} />
							<span className='hidden sm:inline'>Reset</span>
						</button>
						<button
							type='submit'
							form='settings-form'
							disabled={isSubmitting}
							className={`flex-1 md:flex-none md:px-8 py-4 bg-emerald-600 text-white rounded-xl font-black shadow-xl shadow-emerald-100 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:bg-emerald-700 ${
								isSubmitting ? "opacity-75" : ""
							}`}
						>
							{isSubmitting ? (
								<>
									<div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
									<span>Saving...</span>
								</>
							) : (
								<>
									<Save size={18} strokeWidth={3} />
									<span>Save Changes</span>
								</>
							)}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
