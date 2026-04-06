import { Bell } from 'lucide-react';
import { FeedCard } from '@/components/community/feed-card';
import { getCommunityPosts, getOrderGroups } from '@/lib/api/client';

export default async function CommunityPage() {
  const [posts, groups] = await Promise.all([getCommunityPosts(), getOrderGroups()]);
  const groupsById = new Map(groups.map((group) => [group.id, group]));
  const [featuredPost, ...otherPosts] = posts;

  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-white/10 bg-[#222b36] text-[#9aabbb]">
            <span className="text-sm leading-none">‹</span>
          </button>
          <h1 className="text-[26px] font-semibold text-white">Community</h1>
        </div>
        <button className="rounded-full border border-white/10 p-2 text-[#8fa1b2] transition hover:bg-white/5">
          <Bell className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {featuredPost ? (
            <FeedCard
              post={featuredPost}
              group={groupsById.get(featuredPost.tradeId)}
              expanded
              context="community"
            />
          ) : null}

          {otherPosts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              group={groupsById.get(post.tradeId)}
              context="community"
            />
          ))}
        </div>

        <div className="space-y-5">
          <div className="rounded-[22px] border border-[#273543] bg-[#1b2530] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-white">Popular Threads</h2>
              <span className="rounded-full bg-[#174b3d] px-3 py-1 text-[11px] font-semibold text-[#31d09d]">
                Live
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                ['Breakout continuation', '148 traders active'],
                ['Risk compression', '63 new replies'],
                ['Runner management', '41 discussions today'],
                ['Morning option flows', '22 setups shared'],
              ].map(([title, meta]) => (
                <div key={title} className="rounded-[14px] border border-white/8 bg-[#222d39] px-4 py-3">
                  <p className="text-[13px] font-semibold text-white">#{title}</p>
                  <p className="mt-1 text-[11px] text-[#8ea0b1]">{meta}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-[#273543] bg-[#1b2530] p-5">
            <h2 className="text-[18px] font-semibold text-white">People To Follow</h2>
            <div className="mt-4 space-y-4">
              {[
                ['Flyingtrader11', '@swingcraft', '91% win month'],
                ['Roundhog34', '@roundhog', 'Price action journals'],
                ['Mightymax77', '@maxrisk', 'Macro + options'],
              ].map(([name, handle, meta]) => (
                <div key={name} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-white">{name}</p>
                    <p className="text-[11px] text-[#90a1b2]">
                      {handle} · {meta}
                    </p>
                  </div>
                  <button className="rounded-full border border-[#2d5d50] px-3 py-1.5 text-[11px] font-semibold text-[#2bd7a2] transition hover:bg-[#12392f]">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
