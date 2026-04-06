'use client';

import Image from 'next/image';
import {
  Heart,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Send,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CommunityPost, OrderGroup } from '@/lib/api/types';
import {
  buildMirrorRows,
  formatCompactPrice,
  formatLedgerDate,
  formatLedgerTime,
  getToneClasses,
} from '@/components/journal/grouped-trade-card.helpers';
import { Panel } from '@/components/ui/panel';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/components/auth/auth-provider';
import { getAccessTokenFromBrowser } from '@/lib/auth';
import {
  createCommunityComment,
  getCommunityComments,
  toggleCommunityReaction,
} from '@/lib/api/client';

type FeedCardProps = {
  post: CommunityPost;
  group?: OrderGroup;
  expanded?: boolean;
  context?: 'community' | 'profile';
};

function Chip({
  label,
  toneClass,
}: {
  label: string;
  toneClass: string;
}) {
  return (
    <span
      className={`inline-flex min-w-[72px] items-center justify-center rounded-[4px] px-2 py-[3px] text-[9px] font-semibold ${toneClass}`}
    >
      {label}
    </span>
  );
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function EmbeddedTradeTable({ group }: { group: OrderGroup }) {
  const rows = buildMirrorRows(group).slice(0, 3);

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#334252] bg-[#25323e] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="grid grid-cols-[10px_0.95fr_0.9fr_0.6fr_0.8fr_1fr_1fr_0.8fr_0.9fr_1fr_1fr_0.8fr_0.6fr_0.9fr_0.95fr] items-center bg-[#2b3744] px-2 py-[8px] text-[9px] font-semibold text-[#8d9db0]">
        <div />
        {['Date', 'Time', 'Qty', 'Symbol', 'Setup', 'Review', 'Price', 'Result', 'Price', 'Review', 'Setup', 'Qty', 'Time', 'Date'].map((heading, index) => (
          <div key={`${heading}-${index}`} className="text-center">
            {heading}
          </div>
        ))}
      </div>

      {rows.map((row, index) => {
        return (
          <div
            key={row.id}
            className={cn(
              'grid grid-cols-[10px_0.95fr_0.9fr_0.6fr_0.8fr_1fr_1fr_0.8fr_0.9fr_1fr_1fr_0.8fr_0.6fr_0.9fr_0.95fr] items-center',
              index !== rows.length - 1 && 'border-t border-white/8'
            )}
          >
            <div className="flex justify-center">
              <span
                className={cn(
                  'h-10 w-[3px] rounded-full',
                  group.returnStatus === 'loss' ? 'bg-[#ef4444]' : 'bg-[#44d17c]'
                )}
              />
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {row.left ? formatLedgerDate(row.left.executedAt) : '--'}
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {row.left ? formatLedgerTime(row.left.executedAt) : '--'}
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {row.left ? toNumber(row.left.qty) : '--'}
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {row.left?.symbol ?? '--'}
            </div>
            <div className="px-2 py-[8px] text-center">
              <Chip
                label={row.left?.setup ?? 'N/A'}
                toneClass={getToneClasses(row.left?.setup)}
              />
            </div>
            <div className="px-2 py-[8px] text-center">
              <Chip
                label={row.left?.review ?? 'N/A'}
                toneClass={getToneClasses(row.left?.review)}
              />
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {row.left ? formatCompactPrice(toNumber(row.left.tradedPrice)) : '--'}
            </div>
            <div
              className={cn(
                'px-2 py-[8px] text-center text-[11px] font-semibold',
                row.result >= 0 ? 'text-[#25d39b]' : 'text-[#ef5350]'
              )}
            >
              {row.result === 0 ? '—' : `$ ${Math.abs(row.result).toLocaleString('en-US')}`}
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {row.right ? formatCompactPrice(toNumber(row.right.tradedPrice)) : '--'}
            </div>
            <div className="px-2 py-[8px] text-center">
              <Chip
                label={row.right?.review ?? 'N/A'}
                toneClass={getToneClasses(row.right?.review)}
              />
            </div>
            <div className="px-2 py-[8px] text-center">
              <Chip
                label={row.right?.setup ?? 'N/A'}
                toneClass={getToneClasses(row.right?.setup)}
              />
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {row.right ? toNumber(row.right.qty) : '--'}
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {row.right ? formatLedgerTime(row.right.executedAt) : '--'}
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {row.right ? formatLedgerDate(row.right.executedAt) : '--'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function FeedCard({
  post,
  group,
  expanded = false,
  context = 'community',
}: FeedCardProps) {
  const isProfile = context === 'profile';
  const { user } = useAuth();
  const [comments, setComments] = useState<
    Array<{
      id: string;
      author: string;
      avatar: string | null;
      text: string;
      createdAt: string;
    }>
  >([]);
  const [likes, setLikes] = useState(post.likes);
  const [commentDraft, setCommentDraft] = useState('');
  const [loadingComments, setLoadingComments] = useState(expanded);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    let active = true;
    setLoadingComments(true);
    getCommunityComments(post.id)
      .then((items) => {
        if (!active) return;
        setComments(
          items.map((item) => ({
            id: item.id,
            author: item.author.name,
            avatar: item.author.avatar,
            text: item.content,
            createdAt: item.createdAt,
          }))
        );
      })
      .finally(() => {
        if (active) setLoadingComments(false);
      });

    return () => {
      active = false;
    };
  }, [expanded, post.id]);

  const handleReaction = async () => {
    const accessToken = getAccessTokenFromBrowser();
    if (!accessToken || !user) return;

    const result = await toggleCommunityReaction(post.id, accessToken);
    setLikes(result.likes);
    setLiked(result.liked);
  };

  const handleComment = async () => {
    const accessToken = getAccessTokenFromBrowser();
    if (!accessToken || !user || !commentDraft.trim()) return;

    setSubmittingComment(true);
    try {
      const comment = await createCommunityComment(post.id, accessToken, commentDraft.trim());
      setComments((current) => [
        {
          id: comment.id,
          author: comment.author.name,
          avatar: comment.author.avatar,
          text: comment.content,
          createdAt: comment.createdAt,
        },
        ...current,
      ]);
      setCommentDraft('');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Panel
      className={cn(
        'overflow-hidden border-[#293746] bg-[#1b2530] shadow-none',
        isProfile ? 'rounded-[18px] p-4' : 'rounded-[22px] p-5'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#253240] font-semibold text-[#eef4fb]">
            <Image
              src={
                post.author.avatar ??
                `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=1f2d39&color=ffffff`
              }
              alt={post.author.name}
              width={44}
              height={44}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="font-semibold text-[#eef4fb]">{post.author.handle}</p>
            <p className="text-[11px] text-[#95a3b4]">
              {expanded ? '2 hours ago' : formatDateTime(post.createdAt)}
            </p>
          </div>
        </div>
        <button className="rounded-full border border-white/10 p-1.5 text-[#b4bfca] transition hover:bg-white/5">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3">
        {!isProfile ? <h3 className="text-[18px] font-semibold text-[#eef4fb]">{post.title}</h3> : null}
        <p className={cn('max-w-[920px] text-[#d8e0e9]', expanded ? 'mt-1 text-[13px] leading-6' : 'text-[12px] leading-5')}>
          {post.summary}
        </p>
      </div>

      {group ? (
        <div className="mt-4">
          <EmbeddedTradeTable group={group} />
        </div>
      ) : null}

      <div className={cn('mt-4 flex items-center gap-6 text-[12px] text-[#c3cdd7]', isProfile && 'px-1')}>
        <button
          onClick={() => void handleReaction()}
          className={cn(
            'inline-flex items-center gap-2 transition',
            liked ? 'text-[#4ce0b4]' : 'text-[#20d09d] hover:text-[#4ce0b4]'
          )}
        >
          <Sparkles className="h-4 w-4" />
          Like {likes > 0 ? likes : ''}
        </button>
        <button className="inline-flex items-center gap-2 transition hover:text-white">
          <MessageCircle className="h-4 w-4" />
          Comment {post.comments > 0 || comments.length > 0 ? comments.length || post.comments : ''}
        </button>
      </div>

      {expanded ? (
        <div className="mt-5">
          <p className="text-[12px] font-semibold text-[#1ed39b]">Comments</p>

          <div className="mt-4 space-y-4">
            {loadingComments ? (
              <div className="flex items-center gap-2 text-[12px] text-[#9fb0c1]">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading comments
              </div>
            ) : null}

            {comments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  'border-b border-white/8 pb-4 last:border-b-0 last:pb-0',
                  comments[0]?.id === comment.id && 'rounded-[14px] bg-[#26323d] p-4'
                )}
              >
                <div className="flex gap-3">
                  <Image
                    src={
                      comment.avatar ??
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author)}&background=1f2d39&color=ffffff`
                    }
                    alt={comment.author}
                    width={34}
                    height={34}
                    className="h-[34px] w-[34px] rounded-full object-cover"
                    unoptimized
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-[#eef4fb]">
                      {comment.author}
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-[#d4dde6]">
                      {comment.text}
                    </p>

                    {comments[0]?.id === comment.id ? (
                      <div className="mt-4 border-t border-white/12 pt-4">
                        <div className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-[#1d2833] px-3 py-2">
                          <Send className="h-4 w-4 text-[#96a5b5]" />
                          <input
                            value={commentDraft}
                            onChange={(event) => setCommentDraft(event.target.value)}
                            placeholder="Write a reply..."
                            className="h-8 flex-1 bg-transparent text-[12px] text-[#eef4fb] outline-none placeholder:text-[#7f90a2]"
                          />
                          <button
                            onClick={() => void handleComment()}
                            disabled={submittingComment || !commentDraft.trim()}
                            className="rounded-[6px] bg-[#19b98f] px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
                          >
                            {submittingComment ? 'Posting...' : 'Post Comment'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-4 text-[12px] text-[#c3cdd7]">
                        <button className="inline-flex items-center gap-2 text-[#19c99f]">
                          <Heart className="h-4 w-4" />
                          Like
                        </button>
                        <button className="inline-flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Reply
                        </button>
                        <span className="text-[#95a3b4]">{formatDateTime(comment.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-5 flex h-10 w-full items-center justify-center rounded-[6px] border border-[#657485] text-[12px] font-medium text-[#d6dfe7] transition hover:border-[#8d9eb0] hover:text-white">
            Load More
          </button>
        </div>
      ) : (
        <div className="mt-4 flex justify-end">
          <button className="rounded-full p-1 text-[#19c99f] transition hover:bg-white/5">
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
    </Panel>
  );
}
