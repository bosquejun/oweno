import { Providers } from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "OweNah - Split the bills. OweNah one.",
	description:
		'Designed to avoid those awkward "Sino nagbayad, bes?" moments, OweNah makes splitting bills simple, transparent, and drama-free.',
	icons: {
		icon: "/favicon.ico",
	},
	openGraph: {
		title: "OweNah - Split the bills. OweNah one.",
		description:
			'Designed to avoid those awkward "Sino nagbayad, bes?" moments, OweNah makes splitting bills simple, transparent, and drama-free.',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.variable} antialiased`}>
				<Providers>{children}</Providers>
				<Analytics />
			</body>
		</html>
	);
}
