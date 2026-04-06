import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Send,
  Sparkles,
} from 'lucide-react';
import { CommunityPost, OrderGroup } from '@/lib/api/types';
import {
  formatCompactPrice,
  formatLedgerDate,
  formatLedgerTime,
} from '@/components/journal/grouped-trade-card.helpers';
import { Panel } from '@/components/ui/panel';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

type FeedCardProps = {
  post: CommunityPost;
  group?: OrderGroup;
  expanded?: boolean;
  context?: 'community' | 'profile';
};

const comments = [
  {
    id: 'c1',
    author: 'Roundhog34',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64&q=80',
    text: 'Impressive execution! Did you monitor order flow data to confirm the breakout, or was this purely based on the price action? Either way...',
    primary: true,
  },
  {
    id: 'c2',
    author: 'Mightymax77',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=64&q=80',
    text: 'Thanks for sharing this! The way you managed the retrace setup has given me some ideas for improving my entries. Keep these insights coming!',
    primary: false,
  },
];

function Chip({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <span
      className="inline-flex min-w-[72px] items-center justify-center rounded-[4px] px-2 py-[3px] text-[9px] font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

function EmbeddedTradeTable({ group }: { group: OrderGroup }) {
  const executions = [...group.entryOrders, ...group.exitOrders].slice(0, 3);

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

      {executions.map((execution, index) => {
        const setupColor =
          execution.setup === 'Retrace'
            ? '#2d77b7'
            : execution.setup === 'Opening Range'
              ? '#0b9f8a'
              : '#b57a31';
        const reviewColor =
          execution.review === 'Early Exit'
            ? '#93712b'
            : execution.review === 'FOMO'
              ? '#8a3437'
              : '#2d8f63';

        return (
          <div
            key={execution.id}
            className={cn(
              'grid grid-cols-[10px_0.95fr_0.9fr_0.6fr_0.8fr_1fr_1fr_0.8fr_0.9fr_1fr_1fr_0.8fr_0.6fr_0.9fr_0.95fr] items-center',
              index !== executions.length - 1 && 'border-t border-white/8'
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
              {formatLedgerDate(execution.executedAt)}
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {formatLedgerTime(execution.executedAt)}
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {execution.qty}
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {execution.symbol}
            </div>
            <div className="px-2 py-[8px] text-center">
              <Chip label={execution.setup ?? 'N/A'} color={setupColor} />
            </div>
            <div className="px-2 py-[8px] text-center">
              <Chip label={execution.review ?? 'N/A'} color={reviewColor} />
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {formatCompactPrice(execution.tradedPrice)}
            </div>
            <div
              className={cn(
                'px-2 py-[8px] text-center text-[11px] font-semibold',
                group.realizedPnl >= 0 ? 'text-[#25d39b]' : 'text-[#ef5350]'
              )}
            >
              {index === 0 ? `$ ${Math.abs(group.realizedPnl).toLocaleString()}` : '$ 0'}
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {formatCompactPrice(execution.tradedPrice + 500)}
            </div>
            <div className="px-2 py-[8px] text-center">
              <Chip label="Good Entry" color="#2d8f63" />
            </div>
            <div className="px-2 py-[8px] text-center">
              <Chip label="Breakout" color="#b57a31" />
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {Math.max(1, execution.qty / 3)}
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {formatLedgerTime(execution.executedAt)}
            </div>
            <div className="px-2 py-[8px] text-center text-[10px] text-[#dfe7ee]">
              {formatLedgerDate(execution.executedAt)}
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
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=1f2d39&color=ffffff`}
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
        <button className="inline-flex items-center gap-2 text-[#20d09d] transition hover:text-[#4ce0b4]">
          <Sparkles className="h-4 w-4" />
          Like
        </button>
        <button className="inline-flex items-center gap-2 transition hover:text-white">
          <MessageCircle className="h-4 w-4" />
          {expanded ? 'Comment' : 'Comment'}
        </button>
      </div>

      {expanded ? (
        <div className="mt-5">
          <p className="text-[12px] font-semibold text-[#1ed39b]">Comments</p>

          <div className="mt-4 space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  'border-b border-white/8 pb-4 last:border-b-0 last:pb-0',
                  comment.primary && 'rounded-[14px] bg-[#26323d] p-4'
                )}
              >
                <div className="flex gap-3">
                  <Image
                    src={comment.avatar}
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

                    {comment.primary ? (
                      <div className="mt-4 border-t border-white/12 pt-4">
                        <div className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-[#1d2833] px-3 py-2">
                          <Send className="h-4 w-4 text-[#96a5b5]" />
                          <input
                            readOnly
                            value=""
                            placeholder="Write a reply..."
                            className="h-8 flex-1 bg-transparent text-[12px] text-[#eef4fb] outline-none placeholder:text-[#7f90a2]"
                          />
                          <button className="rounded-[6px] bg-[#19b98f] px-3 py-2 text-[11px] font-semibold text-white">
                            Post Comment
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
                        <span className="text-[#95a3b4]">5 min ago</span>
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
