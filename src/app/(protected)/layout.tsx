import { Layout } from "@/components/Layout";
import { getCachedUserById } from "@/services/userService";
import { auth } from "@clerk/nextjs/server";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

const Loading = () => {
	return (
		<div className='min-h-screen bg-[#F8FAFC] flex items-center justify-center'>
			<div className='flex flex-col items-center gap-3'>
				<Loader2 className='w-8 h-8 text-emerald-600 animate-spin' />
			</div>
		</div>
	);
};

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isAuthenticated, userId } = await auth();

	if (!isAuthenticated) {
		return <Loading />;
	}

	const user = await getCachedUserById(userId);


	return (
		<Suspense fallback={<Loading />}>
			<Layout user={user}>{children}</Layout>
		</Suspense>
	);
}
