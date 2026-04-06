'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { resetPasswordRequest } from '@/lib/api/auth-client';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await resetPasswordRequest({ token, password });
      setMessage('Password updated. You can sign in with the new password now.');
      setPassword('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,#162432,#101a24)] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
      <p className="text-[24px] font-semibold text-white">Choose a new password</p>
      <p className="mt-3 text-[14px] leading-7 text-[#8ba0b4]">
        Paste the reset token from the previous step and set a fresh password for your account.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-[12px] font-medium text-[#d7e2ec]">Reset token</span>
          <textarea
            value={token}
            onChange={(event) => setToken(event.target.value)}
            rows={3}
            className="w-full rounded-[12px] border border-[#304252] bg-[#0d1721] px-4 py-3 text-[13px] text-white outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[12px] font-medium text-[#d7e2ec]">New password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-[12px] border border-[#304252] bg-[#0d1721] px-4 text-[13px] text-white outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-[12px] bg-[#17ae7c] px-4 py-3 text-[13px] font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Updating...' : 'Reset password'}
        </button>
      </form>

      {message ? (
        <div className="mt-5 rounded-[12px] border border-white/8 bg-[#0d1721] p-4 text-[13px] text-white">
          {message}
        </div>
      ) : null}

      <Link href="/signin" className="mt-5 block text-[12px] text-[#8ea3b6] hover:text-white">
        Back to sign in
      </Link>
    </div>
  );
}
