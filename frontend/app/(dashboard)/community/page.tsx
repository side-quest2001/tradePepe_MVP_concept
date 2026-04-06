import { cookies } from 'next/headers';
import { Bell } from 'lucide-react';
import { CommunitySidebar } from '@/components/community/community-sidebar';
import { FeedCard } from '@/components/community/feed-card';
import { getCommunityPosts, getMyProfile, getOrderGroups } from '@/lib/api/client';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth';

export default async function CommunityPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const [posts, groups, profile] = await Promise.all([
    getCommunityPosts(),
    getOrderGroups(),
    token ? getMyProfile(token).catch(() => null) : Promise.resolve(null),
  ]);
  const groupsById = new Map(groups.map((group) => [group.id, group]));
  const [featuredPost, ...otherPosts] = posts;
  const popularThreads = posts
    .slice()
    .sort((a, b) => b.comments + b.likes - (a.comments + a.likes))
    .slice(0, 4)
    .map((post) => ({
      id: post.id,
      title: post.title,
      meta: `${post.comments} comments · ${post.likes} likes`,
    }));
  const suggestedProfiles = posts
    .map((post) => post.author)
    .filter(
      (author, index, array) =>
        author.id !== profile?.id && array.findIndex((item) => item.id === author.id) === index
    )
    .slice(0, 4)
    .map((author) => ({
      id: author.id,
      name: author.name,
      handle: author.handle,
      meta: 'Published trade reviews',
    }));

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

        <CommunitySidebar
          threads={popularThreads}
          suggestedProfiles={suggestedProfiles}
          initialFollowingIds={profile?.followingIds ?? []}
        />
      </div>
    </div>
  );
}
