'use client';

import { useAcceptInvite } from '@/hooks/useInvites';
import { getInviteByToken } from '@/services/inviteService';
import { SignInButton, SignOutButton, SignUpButton, useUser } from '@clerk/nextjs';
import { CheckCircle2, Loader2, Mail, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function InviteAcceptPage({ 
  invite, 
  token,
  isAuthenticated 
}: { 
  invite: Awaited<ReturnType<typeof getInviteByToken>>;
  token: string;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const acceptInviteMutation = useAcceptInvite();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && isLoaded && user && invite?.status === 'PENDING') {
      // Auto-accept if user is authenticated and email matches
      if (user.emailAddresses[0]?.emailAddress.toLowerCase() === invite.email.toLowerCase()) {
        handleAccept();
      }
    }
  }, [isAuthenticated, isLoaded, user, invite]);

  const handleAccept = async () => {
    if (!user) return;

    try {
    
        const response = await fetch(`/api/invites/accept/${token}`, {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Failed to accept invite');
        }
        const result = await response.json();
        if (result.success) {
          setAccepted(true);
          await user.reload();
          // Redirect after a short delay
        setTimeout(() => {
            if (invite?.groupId) {
            router.push(`/groups/${invite?.groupId}`);
            } else {
            router.push('/dashboard');
            }
        }, 2000);
        } else {
          throw new Error(result.error);
        }
      
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite');
    }
  };

  if (invite?.status !== 'PENDING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-100 shadow-xl">
          <h1 className="text-2xl font-black text-slate-900 mb-4">
            {invite?.status === 'ACCEPTED' ? 'Already Accepted' : 'Invite Expired'}
          </h1>
          <p className="text-slate-600 mb-6">
            {invite?.status === 'ACCEPTED' 
              ? 'This invitation has already been accepted.'
              : 'This invitation has expired or been cancelled.'}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-100 shadow-xl">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-600" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-4">
            Welcome to OweNo! 🎉
          </h1>
          <p className="text-slate-600 mb-6">
            {invite.groupId 
              ? `You've been added to "${invite?.group?.name}"!`
              : 'Your invitation has been accepted. Redirecting...'}
          </p>
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
      <div className="bg-white rounded-3xl p-8 md:p-10 max-w-lg w-full border border-slate-100 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-6 shadow-xl shadow-emerald-100">
            O
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            You're Invited! 🎉
          </h1>
          <p className="text-slate-500 font-medium">
            {invite.inviter.displayName} invited you to join OweNo
          </p>
        </div>

        {invite.group && (
          <div className="bg-emerald-50 rounded-2xl p-6 mb-6 border border-emerald-100">
            <div className="flex items-center gap-3 mb-3">
              <Users size={20} className="text-emerald-600" />
              <h3 className="font-black text-slate-900">Group Invitation</h3>
            </div>
            <p className="text-lg font-black text-slate-900 mb-1">{invite.group.name}</p>
            {invite.group.description && (
              <p className="text-sm text-slate-600">{invite.group.description}</p>
            )}
          </div>
        )}

        <div className="bg-slate-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            {invite.inviter.avatar ? (
              <img 
                src={invite.inviter.avatar} 
                className="w-12 h-12 rounded-xl border-2 border-white shadow-sm" 
                alt={invite.inviter.displayName}
              />
            ) : (
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Mail size={20} className="text-emerald-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-black text-slate-900">{invite.inviter.displayName}</p>
              <p className="text-xs text-slate-500">{invite.inviter.email}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6">
            <p className="text-rose-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="space-y-3">
            <SignUpButton mode="modal">
              <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
                <Sparkles size={20} />
                Create Account & Accept
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="w-full py-3 border-2 border-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-50 transition-all">
                Sign In to Accept
              </button>
            </SignInButton>
          </div>
        ) : (
          <div className="space-y-3">
            {user?.emailAddresses[0]?.emailAddress.toLowerCase() === invite.email.toLowerCase() ? (
              <button
                onClick={handleAccept}
                disabled={acceptInviteMutation.isPending}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {acceptInviteMutation.isPending ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Accepting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} strokeWidth={3} />
                    <span>Accept Invitation</span>
                  </>
                )}
              </button>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-amber-700 text-sm font-medium text-center">
                  This invitation was sent to <strong>{invite.email}</strong>, but you're signed in as <strong>{user?.emailAddresses[0]?.emailAddress}</strong>.
                </p>
              </div>
            )}
            <SignOutButton>
              <button className="w-full py-3 border-2 border-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-50 transition-all text-center">Sign out</button>
            </SignOutButton>
            {/* <Link
              href="/dashboard"
              className="block w-full py-3 border-2 border-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-50 transition-all text-center"
            >
              Go to Dashboard
            </Link> */}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">
            Invited to <strong>{invite.email}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

