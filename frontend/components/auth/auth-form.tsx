'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    handle: '',
    email: '',
    password: '',
  });

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'signin') {
        await signIn({ email: form.email, password: form.password });
      } else {
        await signUp(form);
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to continue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,#162432,#101a24)] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
      <div className="flex items-center gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0d6c59] text-[14px] font-semibold text-white">
          TP
        </div>
        <div>
          <p className="text-[20px] font-semibold text-white">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
          <p className="mt-1 text-[12px] text-[#88a0b5]">
            {mode === 'signin'
              ? 'Sign in to continue into your trading workspace.'
              : 'Start tracking trades, reviews, analytics, and your public profile.'}
          </p>
        </div>
      </div>

      <div className="mt-6 inline-flex rounded-[10px] border border-white/8 bg-[#0d1721] p-1">
        <Link
          href="/signin"
          className={`rounded-[8px] px-4 py-2 text-[12px] font-medium ${mode === 'signin' ? 'bg-[#143629] text-[#1ec99f]' : 'text-[#7f93a8]'}`}
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className={`rounded-[8px] px-4 py-2 text-[12px] font-medium ${mode === 'signup' ? 'bg-[#143629] text-[#1ec99f]' : 'text-[#7f93a8]'}`}
        >
          Sign up
        </Link>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === 'signup' ? (
          <>
            <Field
              label="Name"
              value={form.name}
              onChange={(value) => setForm((current) => ({ ...current, name: value }))}
              placeholder="Siddha Pepe"
            />
            <Field
              label="Handle"
              value={form.handle}
              onChange={(value) => setForm((current) => ({ ...current, handle: value }))}
              placeholder="@siddhapepe"
            />
          </>
        ) : null}
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => setForm((current) => ({ ...current, email: value }))}
          placeholder="pepe@tradepepe.dev"
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(value) => setForm((current) => ({ ...current, password: value }))}
          placeholder="••••••••"
        />

        {error ? (
          <div className="rounded-[10px] border border-[#713b45] bg-[#321921] px-3 py-2 text-[12px] text-[#ffb2bf]">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[#17ae7c] text-[13px] font-semibold text-white transition hover:bg-[#1bc58a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {mode === 'signin' ? 'Sign in to TradePepe' : 'Create account'}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-[12px] text-[#7f93a8]">
        <span>
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
        </span>
        <Link href={mode === 'signin' ? '/signup' : '/signin'} className="text-[#1ec99f]">
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </Link>
      </div>

      {mode === 'signin' ? (
        <div className="mt-3 text-right">
          <Link href="/forgot-password" className="text-[12px] text-[#8ea3b6] hover:text-white">
            Forgot password?
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-medium text-[#d7e2ec]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-[12px] border border-[#304252] bg-[#0d1721] px-4 text-[13px] text-white outline-none placeholder:text-[#697f94] focus:border-[#1ec99f]"
      />
    </label>
  );
}
