'use client';

import Link from 'next/link';
import { useState } from 'react';
import { forgotPasswordRequest } from '@/lib/api/auth-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('pepe@tradepepe.dev');
  const [message, setMessage] = useState<string | null>(null);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setPreviewToken(null);

    try {
      const result = await forgotPasswordRequest(email);
      setMessage('If the email exists, a reset link has been prepared.');
      setPreviewToken(result.resetPreviewToken ?? null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to request reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,#162432,#101a24)] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
      <p className="text-[24px] font-semibold text-white">Password reset</p>
      <p className="mt-3 text-[14px] leading-7 text-[#8ba0b4]">
        Request a reset link. Until email delivery is wired, TradePepe shows the generated reset token here so you can complete the flow locally.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-[12px] font-medium text-[#d7e2ec]">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 w-full rounded-[12px] border border-[#304252] bg-[#0d1721] px-4 text-[13px] text-white outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-[12px] bg-[#17ae7c] px-4 py-3 text-[13px] font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Preparing reset...' : 'Send reset link'}
        </button>
      </form>

      {message ? (
        <div className="mt-5 rounded-[12px] border border-white/8 bg-[#0d1721] p-4 text-[13px] text-white">
          <p>{message}</p>
          {previewToken ? (
            <p className="mt-3 break-all text-[#1ec99f]">
              Preview token: {previewToken}
            </p>
          ) : null}
        </div>
      ) : null}

      {previewToken ? (
        <Link
          href={`/reset-password?token=${encodeURIComponent(previewToken)}`}
          className="mt-5 inline-flex rounded-[12px] border border-[#1ec99f]/25 bg-[#12372c] px-4 py-3 text-[13px] font-semibold text-[#1ec99f]"
        >
          Continue to reset form
        </Link>
      ) : null}

      <Link href="/signin" className="mt-5 block text-[12px] text-[#8ea3b6] hover:text-white">
        Back to sign in
      </Link>
    </div>
  );
}
