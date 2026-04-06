import Image from 'next/image';
import { Bell, Globe2 } from 'lucide-react';
import type { UserProfile } from '@/lib/api/types';

export function ProfileHero({ profile }: { profile?: UserProfile | null }) {
  const handle = profile?.handle ?? '@Siddha9912';
  const activeSince = profile?.activeSince ?? '2021';
  const avatar = profile?.avatarUrl ?? 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=200&q=80';
  const cover = profile?.coverUrl ?? 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80';
  const stats = profile?.stats ?? { trades: 300, following: 21, followers: 109, published: 1 };
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
        <Image
          src={cover}
          alt="Profile cover"
          fill
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,22,31,0.25),rgba(15,22,31,0.1),rgba(15,22,31,0.2))]" />
      </div>

      <div className="relative px-6 pb-6 pt-4">
        <div className="absolute -top-14 left-6 h-24 w-24 overflow-hidden rounded-full border-[3px] border-[#d8e1ea]/20 bg-[#24303b] shadow-[0_18px_35px_rgba(0,0,0,0.35)]">
          <Image
            src={avatar}
            alt={handle}
            fill
            unoptimized
            className="object-cover"
          />
        </div>

        <div className="flex justify-end">
          <button className="rounded-full bg-[#1baa78] px-5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#20c187]">
            Edit Profile
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 border-b border-white/8 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="pl-[110px]">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[16px] font-semibold text-white">{handle}</p>
              <p className="text-[11px] text-[#95a3b4]">Active since {activeSince}</p>
              <span className="text-[#536273]">/</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#95a3b4]">
                <Globe2 className="h-3.5 w-3.5" />
                ninja.io
              </span>
            </div>

            <div className="mt-4 flex gap-8">
              {[
                ['Trades', String(stats.trades)],
                ['Following', String(stats.following)],
                ['Followers', String(stats.followers)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] text-[#8293a3]">{label}</p>
                  <p className="mt-1 text-[12px] font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
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
