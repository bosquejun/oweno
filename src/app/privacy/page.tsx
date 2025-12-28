import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Privacy Policy - OweNah",
	description: "OweNah Privacy Policy - How we protect and handle your data",
	icons: {
		icon: "/favicon.ico",
	},
	openGraph: {
		title: "Privacy Policy - OweNah",
		description: "OweNah Privacy Policy - How we protect and handle your data",
	},
};

export default function PrivacyPolicyPage() {
	return (
		<div className="min-h-screen bg-[#F8FAFC]">
			<div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-8 transition-colors"
				>
					<ArrowLeft size={20} />
					<span className="text-sm font-black uppercase tracking-widest">Back to Home</span>
				</Link>

				<div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm">
					<div className="flex items-center gap-4 mb-8">
						<div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
							<ShieldCheck size={28} className="text-emerald-600" />
						</div>
						<div>
							<h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
								Privacy Policy
							</h1>
							<p className="text-sm text-slate-500 font-medium mt-1">
								Last updated:{" "}
								{new Date().toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>
						</div>
					</div>

					<div className="prose prose-slate max-w-none space-y-8">
						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">1. Introduction</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								Welcome to Owenah ("we," "our," or "us"). We are committed to protecting your
								privacy and ensuring the security of your personal information. This Privacy Policy
								explains how we collect, use, disclose, and safeguard your information when you use
								our expense tracking application.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">2. Information We Collect</h2>
							<div className="space-y-4">
								<div>
									<h3 className="text-lg font-black text-slate-800 mb-2">
										2.1 Personal Information
									</h3>
									<p className="text-slate-700 font-medium leading-relaxed">
										We collect information that you provide directly to us, including:
									</p>
									<ul className="list-disc list-inside space-y-2 mt-2 text-slate-700 font-medium">
										<li>Name and display name</li>
										<li>Email address</li>
										<li>Profile avatar (optional)</li>
										<li>Currency and locale preferences</li>
									</ul>
								</div>
								<div>
									<h3 className="text-lg font-black text-slate-800 mb-2">
										2.2 Financial Information
									</h3>
									<p className="text-slate-700 font-medium leading-relaxed">
										We collect expense-related data that you create, including:
									</p>
									<ul className="list-disc list-inside space-y-2 mt-2 text-slate-700 font-medium">
										<li>Group information and member lists</li>
										<li>Expense records (amounts, categories, dates)</li>
										<li>Split information and payment records</li>
										<li>Settlement transactions</li>
									</ul>
								</div>
								<div>
									<h3 className="text-lg font-black text-slate-800 mb-2">
										2.3 Authentication Data
									</h3>
									<p className="text-slate-700 font-medium leading-relaxed">
										We use Clerk for authentication, which handles your login credentials securely.
										We do not store passwords or authentication tokens directly.
									</p>
								</div>
							</div>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">
								3. How We Use Your Information
							</h2>
							<p className="text-slate-700 font-medium leading-relaxed mb-4">
								We use the information we collect to:
							</p>
							<ul className="list-disc list-inside space-y-2 text-slate-700 font-medium">
								<li>Provide, maintain, and improve our services</li>
								<li>Process and track your expense transactions</li>
								<li>Calculate balances and debts between users</li>
								<li>Send you notifications about group activities and invitations</li>
								<li>Respond to your inquiries and provide customer support</li>
								<li>Detect, prevent, and address technical issues</li>
								<li>Comply with legal obligations</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">
								4. Data Sharing and Disclosure
							</h2>
							<div className="space-y-4">
								<div>
									<h3 className="text-lg font-black text-slate-800 mb-2">4.1 Within Groups</h3>
									<p className="text-slate-700 font-medium leading-relaxed">
										When you join a group, other members of that group can see:
									</p>
									<ul className="list-disc list-inside space-y-2 mt-2 text-slate-700 font-medium">
										<li>Your name and profile information</li>
										<li>Expenses you create or are involved in</li>
										<li>Your share of group expenses and balances</li>
									</ul>
								</div>
								<div>
									<h3 className="text-lg font-black text-slate-800 mb-2">4.2 Service Providers</h3>
									<p className="text-slate-700 font-medium leading-relaxed">
										We may share your information with third-party service providers who perform
										services on our behalf, such as:
									</p>
									<ul className="list-disc list-inside space-y-2 mt-2 text-slate-700 font-medium">
										<li>Clerk (authentication and user management)</li>
										<li>Database hosting services</li>
										<li>Email delivery services (for invitations)</li>
									</ul>
								</div>
								<div>
									<h3 className="text-lg font-black text-slate-800 mb-2">4.3 Legal Requirements</h3>
									<p className="text-slate-700 font-medium leading-relaxed">
										We may disclose your information if required by law or in response to valid
										requests by public authorities.
									</p>
								</div>
							</div>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">5. Data Security</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								We implement appropriate technical and organizational security measures to protect
								your personal information against unauthorized access, alteration, disclosure, or
								destruction. However, no method of transmission over the Internet or electronic
								storage is 100% secure, and we cannot guarantee absolute security.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">6. Your Rights</h2>
							<p className="text-slate-700 font-medium leading-relaxed mb-4">
								You have the right to:
							</p>
							<ul className="list-disc list-inside space-y-2 text-slate-700 font-medium">
								<li>Access your personal information</li>
								<li>Correct inaccurate or incomplete information</li>
								<li>Request deletion of your account and associated data</li>
								<li>Export your data in a portable format</li>
								<li>Opt-out of certain communications</li>
								<li>Withdraw consent where processing is based on consent</li>
							</ul>
							<p className="text-slate-700 font-medium leading-relaxed mt-4">
								To exercise these rights, please contact us through the settings page or by email.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">7. Data Retention</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								We retain your personal information for as long as your account is active or as
								needed to provide you services. If you delete your account, we will delete or
								anonymize your personal information, except where we are required to retain it for
								legal or legitimate business purposes.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">8. Children's Privacy</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								Our service is not intended for children under 18 years of age. We do not knowingly
								collect personal information from children under 18. If you believe we have
								collected information from a child under 18, please contact us immediately.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">
								9. Changes to This Privacy Policy
							</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								We may update this Privacy Policy from time to time. We will notify you of any
								changes by posting the new Privacy Policy on this page and updating the "Last
								updated" date. You are advised to review this Privacy Policy periodically for any
								changes.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">10. Contact Us</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								If you have any questions about this Privacy Policy, please contact us through the
								settings page in the application or visit our support page.
							</p>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
