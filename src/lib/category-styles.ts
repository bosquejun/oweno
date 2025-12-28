import {
	Film,
	HeartPulse,
	Home,
	MoreHorizontal,
	Plane,
	ShoppingBag,
	Utensils,
	Wallet,
	Zap,
} from "lucide-react";

export const CATEGORY_STYLES: Record<string, { color: string; icon: any }> = {
	Dining: { color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: Utensils },
	Travel: { color: "bg-blue-50 text-blue-600 border-blue-100", icon: Plane },
	Home: { color: "bg-indigo-50 text-indigo-600 border-indigo-100", icon: Home },
	Shopping: { color: "bg-rose-50 text-rose-600 border-rose-100", icon: ShoppingBag },
	Utilities: { color: "bg-yellow-50 text-yellow-600 border-yellow-100", icon: Zap },
	Fun: { color: "bg-purple-50 text-purple-600 border-purple-100", icon: Film },
	Health: { color: "bg-red-50 text-red-600 border-red-100", icon: HeartPulse },
	Others: { color: "bg-slate-50 text-slate-600 border-slate-100", icon: MoreHorizontal },
	Settlement: { color: "bg-amber-50 text-amber-600 border-amber-100", icon: Wallet },
};
