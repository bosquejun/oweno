"use client";

import { Input } from "@/components/ui/Input";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const displayNameSchema = z.object({
	displayName: z
		.string()
		.min(1, "Display name is required")
		.max(50, "Display name must be less than 50 characters"),
});

type DisplayNameForm = z.infer<typeof displayNameSchema>;

export default function OnboardingPage() {
	const { user, isLoaded } = useUser();
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<DisplayNameForm>({
		resolver: zodResolver(displayNameSchema),
	});

	useEffect(() => {
		if (isLoaded) {
			if (!user) {
				// User not signed in, redirect to home (middleware should handle this, but just in case)
				router.push("/");
				return;
			}
			// Check if onboarding is already complete
			const onboardingComplete = user.publicMetadata?.onboardingComplete;
			if (onboardingComplete) {
				router.push("/dashboard");
			}
		}
	}, [isLoaded, user, router]);

	const onSubmit = async (data: DisplayNameForm) => {
		if (!user) return;

		setIsSubmitting(true);
		setError(null);

		try {
			// const token = await getToken();
			const response = await fetch("/api/users/me", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					displayName: data.displayName,
					onboardingComplete: true,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update profile");
			}

			// Reload user to get updated metadata
			await user.reload();

			// Redirect to dashboard
			router.push("/dashboard");
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Something went wrong. Please try again."
			);
			setIsSubmitting(false);
		}
	};

	if (!isLoaded || !user) {
		return (
			<div className='min-h-screen bg-[#F8FAFC] flex items-center justify-center'>
				<div className='flex flex-col items-center gap-3'>
					<Loader2 className='w-8 h-8 text-emerald-600 animate-spin' />
					<p className='text-slate-400 font-bold uppercase tracking-widest text-[10px]'>
						Loading...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6'>
			<div className='w-full max-w-md'>
				<div className='bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-xl'>
					<div className='text-center mb-10'>
						<div className='w-16 h-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-emerald-100 mx-auto mb-6'>
							<span className='font-black text-2xl'>O</span>
						</div>
						<h1 className='text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3'>
							Welcome to OweNah!
						</h1>
						<p className='text-slate-500 font-medium text-sm md:text-base'>
							Let&apos;s get you set up
						</p>
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className='space-y-6'
					>
						<Input
							{...register("displayName")}
							label='Display Name'
							icon={User}
							placeholder='How do you want to be called?'
							error={errors.displayName?.message}
							autoFocus
						/>

						{error && (
							<div className='p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl'>
								<p className='text-rose-600 text-sm font-bold'>
									{error}
								</p>
							</div>
						)}

						<button
							type='submit'
							disabled={isSubmitting}
							className='w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[1.5rem] font-black transition-all shadow-xl shadow-emerald-100 active:scale-95 text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3'
						>
							{isSubmitting ? (
								<>
									<Loader2
										size={18}
										strokeWidth={3}
										className='animate-spin'
									/>
									<span>Setting up...</span>
								</>
							) : (
								"Continue"
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
