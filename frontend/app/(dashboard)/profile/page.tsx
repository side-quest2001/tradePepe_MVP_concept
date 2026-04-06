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
  const profilePost =
    posts.find((post) => (profile ? post.author.id === profile.id : false)) ?? posts[0];

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
      <ProfileHero profile={profile} />

      <div className="mx-auto w-full max-w-[930px]">
        {profilePost ? (
          <FeedCard
            post={profilePost}
            group={groupsById.get(profilePost.tradeId)}
            context="profile"
          />
        ) : null}
      </div>
    </div>
  );
}
