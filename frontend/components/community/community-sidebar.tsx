'use client';

import { useMemo, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { toggleProfileFollow } from '@/lib/api/client';
import { getAccessTokenFromBrowser } from '@/lib/auth';

type SuggestedProfile = {
  id: string;
  name: string;
  handle: string;
  meta: string;
};

type PopularThread = {
  id: string;
  title: string;
  meta: string;
};

export function CommunitySidebar({
  threads,
  suggestedProfiles,
  initialFollowingIds,
}: {
  threads: PopularThread[];
  suggestedProfiles: SuggestedProfile[];
  initialFollowingIds: string[];
}) {
  const [followingIds, setFollowingIds] = useState<string[]>(initialFollowingIds);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const followingSet = useMemo(() => new Set(followingIds), [followingIds]);

  const handleFollow = async (targetUserId: string) => {
    const token = getAccessTokenFromBrowser();
    if (!token) return;

    setPendingId(targetUserId);
    try {
      const result = await toggleProfileFollow(targetUserId, token);
      setFollowingIds((current) =>
        result.following
          ? [...new Set([...current, targetUserId])]
          : current.filter((item) => item !== targetUserId)
      );
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[22px] border border-[#273543] bg-[#1b2530] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-white">Popular Threads</h2>
          <span className="rounded-full bg-[#174b3d] px-3 py-1 text-[11px] font-semibold text-[#31d09d]">
            Live
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {threads.length > 0 ? (
            threads.map((thread) => (
              <div key={thread.id} className="rounded-[14px] border border-white/8 bg-[#222d39] px-4 py-3">
                <p className="text-[13px] font-semibold text-white">#{thread.title}</p>
                <p className="mt-1 text-[11px] text-[#8ea0b1]">{thread.meta}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[14px] border border-white/8 bg-[#222d39] px-4 py-4 text-[12px] text-[#8ea0b1]">
              Threads will appear here once traders begin publishing and discussing setups.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[22px] border border-[#273543] bg-[#1b2530] p-5">
        <h2 className="text-[18px] font-semibold text-white">People To Follow</h2>
        <div className="mt-4 space-y-4">
          {suggestedProfiles.length > 0 ? (
            suggestedProfiles.map((profile) => {
              const isFollowing = followingSet.has(profile.id);
              const isPending = pendingId === profile.id;

              return (
                <div key={profile.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-white">{profile.name}</p>
                    <p className="text-[11px] text-[#90a1b2]">
                      {profile.handle} · {profile.meta}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleFollow(profile.id)}
                    disabled={isPending}
                    className="inline-flex min-w-[84px] items-center justify-center rounded-full border border-[#2d5d50] px-3 py-1.5 text-[11px] font-semibold text-[#2bd7a2] transition hover:bg-[#12392f] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isPending ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    ) : isFollowing ? (
                      'Following'
                    ) : (
                      'Follow'
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="rounded-[14px] border border-white/8 bg-[#222d39] px-4 py-4 text-[12px] text-[#8ea0b1]">
              New trader suggestions will appear here once more profiles are active.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
