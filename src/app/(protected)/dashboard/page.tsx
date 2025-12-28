import { getCachedExpensesByUserId } from "@/services/expenseService";
import { getCachedUserById } from "@/services/userService";
import { auth } from "@clerk/nextjs/server";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const Loading = () => (
	<div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
		<Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
		<p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
			Getting your bills ready...
		</p>
	</div>
);

const ClientPage = dynamic(() => import("./page.client"), {
	loading: () => <Loading />,
});

export default async function Page() {
	const { userId } = await auth();

	if (!userId) {
		return <Loading />;
	}

	const user = await getCachedUserById(userId);

	if (!user) {
		return <Loading />;
	}

	const expenses = await getCachedExpensesByUserId(user.id);

	return <ClientPage user={user} expenses={expenses} />;
}
