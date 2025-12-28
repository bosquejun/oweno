import { ArrowLeft, FileText } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Terms of Service - OweNah",
	description: "Owenah Terms of Service - Rules and guidelines for using our platform",
	icons: {
		icon: "/favicon.ico",
	},
	openGraph: {
		title: "Terms of Service - OweNah",
		description: "OweNah Terms of Service - Rules and guidelines for using our platform",
	},
};

export default function TermsOfServicePage() {
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
							<FileText size={28} className="text-emerald-600" />
						</div>
						<div>
							<h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
								Terms of Service
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
							<h2 className="text-xl font-black text-slate-900 mb-4">1. Acceptance of Terms</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								By accessing or using Owenah ("the Service"), you agree to be bound by these Terms
								of Service ("Terms"). If you disagree with any part of these terms, you may not
								access the Service.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">2. Description of Service</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								Owenah is an expense tracking and bill-splitting application that allows users to
								create groups, track shared expenses, calculate balances, and manage settlements
								between group members.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">3. User Accounts</h2>
							<div className="space-y-4">
								<div>
									<h3 className="text-lg font-black text-slate-800 mb-2">3.1 Account Creation</h3>
									<p className="text-slate-700 font-medium leading-relaxed">
										To use the Service, you must create an account. You agree to provide accurate,
										current, and complete information during registration and to update such
										information to keep it accurate, current, and complete.
									</p>
								</div>
								<div>
									<h3 className="text-lg font-black text-slate-800 mb-2">3.2 Account Security</h3>
									<p className="text-slate-700 font-medium leading-relaxed">
										You are responsible for maintaining the confidentiality of your account
										credentials and for all activities that occur under your account. You agree to
										notify us immediately of any unauthorized use of your account.
									</p>
								</div>
								<div>
									<h3 className="text-lg font-black text-slate-800 mb-2">
										3.3 Account Termination
									</h3>
									<p className="text-slate-700 font-medium leading-relaxed">
										You may delete your account at any time through the settings page. We reserve
										the right to suspend or terminate your account if you violate these Terms or
										engage in fraudulent, abusive, or illegal activity.
									</p>
								</div>
							</div>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">4. User Conduct</h2>
							<p className="text-slate-700 font-medium leading-relaxed mb-4">You agree not to:</p>
							<ul className="list-disc list-inside space-y-2 text-slate-700 font-medium">
								<li>Use the Service for any illegal purpose or in violation of any laws</li>
								<li>
									Impersonate any person or entity or falsely state or misrepresent your affiliation
									with any person or entity
								</li>
								<li>
									Interfere with or disrupt the Service or servers or networks connected to the
									Service
								</li>
								<li>
									Attempt to gain unauthorized access to any portion of the Service or any other
									accounts, computer systems, or networks
								</li>
								<li>Upload or transmit any viruses, worms, or other malicious code</li>
								<li>Harass, abuse, or harm other users</li>
								<li>Create false or misleading expense records</li>
								<li>Use the Service to facilitate any fraudulent financial activity</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">5. Financial Information</h2>
							<div className="space-y-4">
								<div>
									<h3 className="text-lg font-black text-slate-800 mb-2">5.1 Accuracy of Data</h3>
									<p className="text-slate-700 font-medium leading-relaxed">
										You are solely responsible for the accuracy of all expense and financial
										information you enter into the Service. Owenah is a tracking tool and does not
										verify the accuracy of your financial data.
									</p>
								</div>
								<div>
									<h3 className="text-lg font-black text-slate-800 mb-2">
										5.2 No Financial Services
									</h3>
									<p className="text-slate-700 font-medium leading-relaxed">
										Owenah is not a financial institution, payment processor, or money transmitter.
										We do not hold, transfer, or process payments. The Service only tracks and
										calculates expenses and balances between users.
									</p>
								</div>
								<div>
									<h3 className="text-lg font-black text-slate-800 mb-2">5.3 Settlement Records</h3>
									<p className="text-slate-700 font-medium leading-relaxed">
										Settlement records in the Service are for tracking purposes only and do not
										constitute actual payment transactions. Users are responsible for completing
										actual payments outside of the Service.
									</p>
								</div>
							</div>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">6. Group Management</h2>
							<div className="space-y-4">
								<div>
									<h3 className="text-lg font-black text-slate-800 mb-2">6.1 Group Creation</h3>
									<p className="text-slate-700 font-medium leading-relaxed">
										Users can create groups and invite other users to join. Group creators have
										administrative privileges to manage group settings and members.
									</p>
								</div>
								<div>
									<h3 className="text-lg font-black text-slate-800 mb-2">
										6.2 Member Responsibilities
									</h3>
									<p className="text-slate-700 font-medium leading-relaxed">
										All group members are responsible for accurately reporting expenses and settling
										debts as calculated by the Service. Disputes between group members should be
										resolved directly between the parties involved.
									</p>
								</div>
								<div>
									<h3 className="text-lg font-black text-slate-800 mb-2">6.3 Group Data</h3>
									<p className="text-slate-700 font-medium leading-relaxed">
										Group data, including expenses and member information, is visible to all members
										of that group. When you leave a group, you will no longer have access to that
										group's data, but historical records may remain visible to other members.
									</p>
								</div>
							</div>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">7. Intellectual Property</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								The Service and its original content, features, and functionality are owned by
								Owenah and are protected by international copyright, trademark, patent, trade
								secret, and other intellectual property laws. You may not copy, modify, distribute,
								sell, or lease any part of the Service without our prior written consent.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">
								8. Disclaimer of Warranties
							</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
								EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF
								MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT
								WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">9. Limitation of Liability</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								TO THE MAXIMUM EXTENT PERMITTED BY LAW, OWENAH SHALL NOT BE LIABLE FOR ANY INDIRECT,
								INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
								REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE,
								GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">10. Indemnification</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								You agree to indemnify and hold harmless Owenah, its officers, directors, employees,
								and agents from any claims, damages, losses, liabilities, and expenses (including
								legal fees) arising out of or relating to your use of the Service, violation of
								these Terms, or infringement of any rights of another.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">
								11. Modifications to Service
							</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								We reserve the right to modify, suspend, or discontinue the Service (or any part
								thereof) at any time with or without notice. We shall not be liable to you or any
								third party for any modification, suspension, or discontinuation of the Service.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">12. Changes to Terms</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								We reserve the right to modify these Terms at any time. We will notify users of any
								material changes by posting the new Terms on this page and updating the "Last
								updated" date. Your continued use of the Service after such changes constitutes
								acceptance of the new Terms.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">13. Governing Law</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								These Terms shall be governed by and construed in accordance with the laws of the
								Philippines, without regard to its conflict of law provisions. Any disputes arising
								from these Terms or the Service shall be subject to the exclusive jurisdiction of
								the courts of the Philippines.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-black text-slate-900 mb-4">14. Contact Information</h2>
							<p className="text-slate-700 font-medium leading-relaxed">
								If you have any questions about these Terms of Service, please contact us through
								the settings page in the application or visit our support page.
							</p>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
