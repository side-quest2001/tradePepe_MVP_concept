import { cookies } from 'next/headers';
import { FeedCard } from '@/components/community/feed-card';
import { ProfileHero } from '@/components/profile/profile-hero';
import { getCommunityPosts, getMyProfile, getOrderGroups } from '@/lib/api/client';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const [posts, groups, profile] = await Promise.all([
    getCommunityPosts(),
    getOrderGroups(),
    token ? getMyProfile(token).catch(() => null) : Promise.resolve(null),
  ]);
  const groupsById = new Map(groups.map((group) => [group.id, group]));
  const profilePosts = profile ? posts.filter((post) => post.author.id === profile.id) : [];

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
      <ProfileHero profile={profile} />

      <div className="mx-auto flex w-full max-w-[930px] flex-col gap-4">
        {profilePosts.length > 0 ? (
          profilePosts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              group={groupsById.get(post.tradeId)}
              context="profile"
            />
          ))
        ) : (
          <div className="rounded-[20px] border border-[#273543] bg-[#1b2530] px-6 py-10 text-center">
            <p className="text-[16px] font-semibold text-white">No published trades yet</p>
            <p className="mt-2 text-[13px] text-[#8fa1b2]">
              Publish one of your journal groups and it will show up here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
