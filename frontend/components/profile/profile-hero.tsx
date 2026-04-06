'use client';

import Image from 'next/image';
import { Bell, Globe2, LoaderCircle, Upload } from 'lucide-react';
import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import type { UserProfile } from '@/lib/api/types';
import { getProfileMediaSignature, updateMyProfile } from '@/lib/api/client';
import { getAccessTokenFromBrowser } from '@/lib/auth';
import { useAuth } from '@/components/auth/auth-provider';

async function uploadToCloudinary(
  file: File,
  kind: 'avatar' | 'cover',
  token: string
) {
  const signature = await getProfileMediaSignature(token, kind);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('folder', signature.folder);
  formData.append('signature', signature.signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error?.message ?? 'Image upload failed');
  }

  const payload = (await response.json()) as { secure_url?: string };
  if (!payload.secure_url) {
    throw new Error('Image upload did not return a URL');
  }

  return payload.secure_url;
}

export function ProfileHero({ profile }: { profile?: UserProfile | null }) {
  const { refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<'avatar' | 'cover' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: profile?.name ?? '',
    handle: profile?.handle ?? '@trader',
    bio: profile?.bio ?? '',
    avatarUrl: profile?.avatarUrl ?? '',
    coverUrl: profile?.coverUrl ?? '',
  });

  useEffect(() => {
    setDraft({
      name: profile?.name ?? '',
      handle: profile?.handle ?? '@trader',
      bio: profile?.bio ?? '',
      avatarUrl: profile?.avatarUrl ?? '',
      coverUrl: profile?.coverUrl ?? '',
    });
  }, [profile]);

  const activeSince = profile?.activeSince ?? new Date().getFullYear().toString();
  const stats = profile?.stats ?? { trades: 0, following: 0, followers: 0, published: 0 };
  const avatar =
    draft.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile?.name ?? draft.handle.replace('@', '') ?? 'Trader'
    )}&background=1f2d39&color=ffffff`;
  const cover =
    draft.coverUrl ||
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80';
  const isDirty = useMemo(
    () =>
      draft.name !== (profile?.name ?? '') ||
      draft.handle !== (profile?.handle ?? '@trader') ||
      draft.bio !== (profile?.bio ?? '') ||
      draft.avatarUrl !== (profile?.avatarUrl ?? '') ||
      draft.coverUrl !== (profile?.coverUrl ?? ''),
    [draft, profile]
  );

  const onFileSelected = async (
    event: ChangeEvent<HTMLInputElement>,
    kind: 'avatar' | 'cover'
  ) => {
    const file = event.target.files?.[0];
    const token = getAccessTokenFromBrowser();
    if (!file || !token) return;

    setError(null);
    setUploading(kind);
    try {
      const secureUrl = await uploadToCloudinary(file, kind, token);
      setDraft((current) => ({
        ...current,
        [kind === 'avatar' ? 'avatarUrl' : 'coverUrl']: secureUrl,
      }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
    } finally {
      setUploading(null);
      event.target.value = '';
    }
  };

  const saveProfile = async () => {
    const token = getAccessTokenFromBrowser();
    if (!token) return;

    setSubmitting(true);
    setError(null);
    try {
      await updateMyProfile(token, {
        name: draft.name.trim(),
        handle: draft.handle.trim(),
        bio: draft.bio.trim() || null,
        avatarUrl: draft.avatarUrl || null,
        coverUrl: draft.coverUrl || null,
      });
      await refreshUser();
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Profile update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#273543] bg-[#171f28]">
      <div className="flex h-12 items-center justify-between border-b border-white/6 bg-[#1b232d] px-5">
        <div className="flex items-center gap-3">
          <button className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-white/10 bg-[#222b36] text-[#9aabbb]">
            <span className="text-sm leading-none">‹</span>
          </button>
          <h1 className="text-[22px] font-semibold text-white">Profile</h1>
        </div>
        <Bell className="h-4 w-4 text-[#8ea0b2]" />
      </div>

      <div className="relative h-[190px] overflow-hidden">
        <Image src={cover} alt="Profile cover" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,22,31,0.25),rgba(15,22,31,0.1),rgba(15,22,31,0.2))]" />
        {isEditing ? (
          <label className="absolute right-4 top-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/12 bg-[#0f1822]/80 px-3 py-2 text-[11px] font-semibold text-white">
            <Upload className="h-3.5 w-3.5" />
            {uploading === 'cover' ? 'Uploading cover...' : 'Change cover'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void onFileSelected(event, 'cover')}
            />
          </label>
        ) : null}
      </div>

      <div className="relative px-6 pb-6 pt-4">
        <div className="absolute -top-14 left-6 h-24 w-24 overflow-hidden rounded-full border-[3px] border-[#d8e1ea]/20 bg-[#24303b] shadow-[0_18px_35px_rgba(0,0,0,0.35)]">
          <Image src={avatar} alt={draft.handle} fill unoptimized className="object-cover" />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsEditing((current) => !current);
            }}
            className="rounded-full bg-[#1baa78] px-5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#20c187]"
          >
            {isEditing ? 'Close Editor' : 'Edit Profile'}
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 border-b border-white/8 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="pl-[110px]">
            {isEditing ? (
              <div className="space-y-3">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-[#8293a3]">Name</span>
                  <input
                    value={draft.name}
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                    className="mt-1 w-full rounded-[10px] border border-[#314252] bg-[#202b36] px-3 py-2 text-[13px] text-white outline-none focus:border-[#1baa78]"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-[#8293a3]">Handle</span>
                  <input
                    value={draft.handle}
                    onChange={(event) => setDraft((current) => ({ ...current, handle: event.target.value }))}
                    className="mt-1 w-full rounded-[10px] border border-[#314252] bg-[#202b36] px-3 py-2 text-[13px] text-white outline-none focus:border-[#1baa78]"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-[#8293a3]">Bio</span>
                  <textarea
                    value={draft.bio}
                    onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))}
                    rows={3}
                    className="mt-1 w-full rounded-[10px] border border-[#314252] bg-[#202b36] px-3 py-2 text-[13px] text-white outline-none focus:border-[#1baa78]"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/12 bg-[#202b36] px-3 py-2 text-[11px] font-semibold text-white">
                    <Upload className="h-3.5 w-3.5" />
                    {uploading === 'avatar' ? 'Uploading avatar...' : 'Change avatar'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => void onFileSelected(event, 'avatar')}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={!isDirty || submitting}
                    onClick={() => void saveProfile()}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1baa78] px-4 py-2 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
                    Save changes
                  </button>
                </div>
                {error ? <p className="text-[12px] text-[#f08a8a]">{error}</p> : null}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[16px] font-semibold text-white">{draft.handle}</p>
                  <p className="text-[11px] text-[#95a3b4]">Active since {activeSince}</p>
                  <span className="text-[#536273]">/</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#95a3b4]">
                    <Globe2 className="h-3.5 w-3.5" />
                    tradepepe.social
                  </span>
                </div>
                <p className="mt-2 text-[13px] text-[#d3dee8]">{profile?.name ?? draft.name}</p>
                {profile?.bio ? <p className="mt-2 max-w-[560px] text-[12px] leading-6 text-[#9cb0c2]">{profile.bio}</p> : null}

                <div className="mt-4 flex gap-8">
                  {[
                    ['Trades', String(stats.trades)],
                    ['Following', String(stats.following)],
                    ['Followers', String(stats.followers)],
                    ['Published', String(stats.published)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] text-[#8293a3]">{label}</p>
                      <p className="mt-1 text-[12px] font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-8 text-[11px] text-[#7f91a3]">
          <button className="min-w-[84px] rounded-[2px] border border-[#596878] px-5 py-1.5 text-white">
            Trades
          </button>
          <button className="transition hover:text-white">Dashboard</button>
        </div>
      </div>
    </div>
  );
}
