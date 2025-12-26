import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	env: {
		GEMINI_API_KEY: process.env.GEMINI_API_KEY,
	},
	images: {
		remotePatterns: [
			{
				hostname: "api.dicebear.com",
			},
		],
	},
};

export default nextConfig;
