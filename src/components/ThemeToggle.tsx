"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export const ThemeToggle = () => {
	const { theme, setTheme, resolvedTheme } = useTheme();

	const cycleTheme = () => {
		if (theme === "light") {
			setTheme("dark");
		} else if (theme === "dark") {
			setTheme("system");
		} else {
			setTheme("light");
		}
	};

	const getIcon = () => {
		if (theme === "system") {
			return <Monitor size={18} />;
		}
		return resolvedTheme === "dark" ? <Moon size={18} /> : <Sun size={18} />;
	};

	const getLabel = () => {
		if (theme === "system") {
			return "System";
		}
		return theme === "dark" ? "Dark" : "Light";
	};

	return (
		<button
			onClick={cycleTheme}
			className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all"
			title={`Theme: ${getLabel()} (click to cycle)`}
			aria-label={`Switch to ${theme === "light" ? "dark" : theme === "dark" ? "system" : "light"} mode`}
		>
			{getIcon()}
		</button>
	);
};
