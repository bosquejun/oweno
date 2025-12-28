"use client";

import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import { ThemeProvider } from "./ThemeProvider";

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<ThemeProvider>
			<ClerkProvider>{children}</ClerkProvider>
		</ThemeProvider>
	);
};
