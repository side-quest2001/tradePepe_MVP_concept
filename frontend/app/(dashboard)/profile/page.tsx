import { FeedCard } from '@/components/community/feed-card';
import { ProfileHero } from '@/components/profile/profile-hero';
import { getCommunityPosts, getOrderGroups } from '@/lib/api/client';

export default async function ProfilePage() {
  const [posts, groups] = await Promise.all([getCommunityPosts(), getOrderGroups()]);
  const groupsById = new Map(groups.map((group) => [group.id, group]));
  const profilePost = posts[0];

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
      <ProfileHero />

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
