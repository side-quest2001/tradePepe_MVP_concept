import { count } from "drizzle-orm";

import { logger } from "../config/logger.js";
import { db, queryClient } from "./client.js";
import {
  communityComments,
  communityReactions,
  economicIndicatorRows,
  flashNewsItems,
  profileFollows,
  users
} from "./schema/app.schema.js";
import {
  funds,
  orderGroupOrders,
  orderGroupReviewTags,
  orderGroups,
  orderGroupSetupTags,
  rawOrders,
  sharedTradeGroups,
  tradeNotes,
  tradeTags
} from "./schema/trading.schema.js";
import { hashPassword } from "../utils/password.util.js";

const seedFundAlphaId = "11111111-1111-4111-8111-111111111111";
const seedFundSwingId = "22222222-2222-4222-8222-222222222222";
const seedUserPepeId = "11111111-1111-4111-8111-111111111111";
const seedUserFlyingId = "22222222-2222-4222-8222-222222222222";
const seedUserRoundhogId = "33333333-3333-4333-8333-333333333333";
const defaultPasswordHash = hashPassword("TradePePe123!");

const tagIds = {
  breakout: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
  retest: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
  openingRange: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
  trendFollow: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4",
  fomo: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
  lateExit: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2",
  patience: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3",
  ruleBased: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4"
} as const;

function createRawOrder(input: {
  id: string;
  fundId: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: string;
  tradedPrice: string;
  orderTime: string;
  rolePayload: string;
  notes?: string | null;
}) {
  return {
    id: input.id,
    fundId: input.fundId,
    importId: null,
    source: "manual" as const,
    brokerName: "Seeded Broker",
    brokerOrderId: null,
    brokerExecutionId: null,
    importRowNumber: null,
    symbol: input.symbol,
    side: input.side,
    orderTypeRaw: "MARKET",
    productTypeRaw: "MIS",
    quantity: input.quantity,
    remainingQuantity: "0.00000000",
    executedQuantity: input.quantity,
    limitPrice: null,
    stopPrice: null,
    tradedPrice: input.tradedPrice,
    statusRaw: "filled",
    normalizedStatus: "filled" as const,
    orderTime: new Date(input.orderTime),
    executionTime: new Date(input.orderTime),
    rawPayload: {
      source: "seed",
      scenario: input.rolePayload
    },
    notes: input.notes ?? null
  };
}

async function seed(): Promise<void> {
  const [existingFunds] = await db.select({ value: count() }).from(funds);

  if ((existingFunds?.value ?? 0) > 0) {
    logger.info("Seed skipped because funds already exist");
    return;
  }

  await db.transaction(async (tx) => {
    await tx.insert(users).values([
      {
        id: seedUserPepeId,
        email: "pepe@tradepepe.dev",
        passwordHash: defaultPasswordHash,
        name: "Siddha PePe",
        handle: "@siddhapepe",
        avatarUrl: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=200&q=80",
        coverUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80",
        activeSince: "2021",
        bio: "Execution-first trader building a cleaner review process every month.",
        emailVerifiedAt: new Date("2026-01-15T10:00:00.000Z")
      },
      {
        id: seedUserFlyingId,
        email: "flyingtrader11@tradepepe.dev",
        passwordHash: defaultPasswordHash,
        name: "Flyingtrader11",
        handle: "@flyingtrader11",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        coverUrl: null,
        activeSince: "2022",
        bio: "Sharing breakout reviews and runner management notes.",
        emailVerifiedAt: new Date("2026-01-16T10:00:00.000Z")
      },
      {
        id: seedUserRoundhogId,
        email: "roundhog34@tradepepe.dev",
        passwordHash: defaultPasswordHash,
        name: "Roundhog34",
        handle: "@roundhog34",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64&q=80",
        coverUrl: null,
        activeSince: "2023",
        bio: "Mostly intraday and index options.",
        emailVerifiedAt: new Date("2026-01-17T10:00:00.000Z")
      }
    ]);

    await tx.insert(funds).values([
      {
        id: seedFundAlphaId,
        name: "Momentum Alpha",
        code: "ALPHA",
        brokerName: "Zerodha",
        brokerAccountRef: "ALPHA-DEMO-01",
        baseCurrency: "INR",
        status: "active",
        isDefault: true,
        metadata: {
          style: "Intraday momentum"
        }
      },
      {
        id: seedFundSwingId,
        name: "Swing Sandbox",
        code: "SWING",
        brokerName: "Binance",
        brokerAccountRef: "SWING-DEMO-01",
        baseCurrency: "USDT",
        status: "active",
        isDefault: false,
        metadata: {
          style: "Swing and mean reversion"
        }
      }
    ]);

    await tx.insert(tradeTags).values([
      {
        id: tagIds.breakout,
        name: "Breakout",
        slug: "breakout",
        scope: "setup",
        color: "#0f766e",
        description: "Momentum breakout continuation."
      },
      {
        id: tagIds.retest,
        name: "Retest",
        slug: "retest",
        scope: "setup",
        color: "#1d4ed8",
        description: "Entry after reclaim or retest."
      },
      {
        id: tagIds.openingRange,
        name: "Opening Range",
        slug: "opening-range",
        scope: "setup",
        color: "#7c3aed",
        description: "Opening range expansion."
      },
      {
        id: tagIds.trendFollow,
        name: "Trend Follow",
        slug: "trend-follow",
        scope: "setup",
        color: "#ca8a04",
        description: "Trend continuation participation."
      },
      {
        id: tagIds.fomo,
        name: "FOMO",
        slug: "fomo",
        scope: "review",
        color: "#dc2626",
        description: "Chased move late."
      },
      {
        id: tagIds.lateExit,
        name: "Late Exit",
        slug: "late-exit",
        scope: "review",
        color: "#ea580c",
        description: "Held winners or losers too long."
      },
      {
        id: tagIds.patience,
        name: "Patience",
        slug: "patience",
        scope: "review",
        color: "#2563eb",
        description: "Execution stayed disciplined."
      },
      {
        id: tagIds.ruleBased,
        name: "Rule Based",
        slug: "rule-based",
        scope: "review",
        color: "#16a34a",
        description: "Followed the playbook."
      }
    ]);

    const seededOrders = [
      createRawOrder({
        id: "10000000-0000-4000-8000-000000000001",
        fundId: seedFundAlphaId,
        symbol: "NIFTY24APR22500CE",
        side: "buy",
        quantity: "50.00000000",
        tradedPrice: "142.50000000",
        orderTime: "2026-04-01T03:47:00.000Z",
        rolePayload: "long-breakout-open",
        notes: "Opening range break with strong breadth."
      }),
      createRawOrder({
        id: "10000000-0000-4000-8000-000000000002",
        fundId: seedFundAlphaId,
        symbol: "NIFTY24APR22500CE",
        side: "buy",
        quantity: "25.00000000",
        tradedPrice: "148.00000000",
        orderTime: "2026-04-01T04:02:00.000Z",
        rolePayload: "long-breakout-scale-in"
      }),
      createRawOrder({
        id: "10000000-0000-4000-8000-000000000003",
        fundId: seedFundAlphaId,
        symbol: "NIFTY24APR22500CE",
        side: "sell",
        quantity: "75.00000000",
        tradedPrice: "167.50000000",
        orderTime: "2026-04-01T05:25:00.000Z",
        rolePayload: "long-breakout-close",
        notes: "Booked into extension after second push."
      }),
      createRawOrder({
        id: "10000000-0000-4000-8000-000000000004",
        fundId: seedFundAlphaId,
        symbol: "BANKNIFTY24APR48000PE",
        side: "sell",
        quantity: "30.00000000",
        tradedPrice: "215.00000000",
        orderTime: "2026-04-02T04:05:00.000Z",
        rolePayload: "short-retest-open"
      }),
      createRawOrder({
        id: "10000000-0000-4000-8000-000000000005",
        fundId: seedFundAlphaId,
        symbol: "BANKNIFTY24APR48000PE",
        side: "buy",
        quantity: "30.00000000",
        tradedPrice: "244.00000000",
        orderTime: "2026-04-02T05:18:00.000Z",
        rolePayload: "short-retest-close",
        notes: "Covered after squeeze invalidated the idea."
      }),
      createRawOrder({
        id: "10000000-0000-4000-8000-000000000006",
        fundId: seedFundAlphaId,
        symbol: "RELIANCE",
        side: "buy",
        quantity: "120.00000000",
        tradedPrice: "2895.20000000",
        orderTime: "2026-04-03T04:10:00.000Z",
        rolePayload: "long-retest-open"
      }),
      createRawOrder({
        id: "10000000-0000-4000-8000-000000000007",
        fundId: seedFundAlphaId,
        symbol: "RELIANCE",
        side: "sell",
        quantity: "60.00000000",
        tradedPrice: "2918.60000000",
        orderTime: "2026-04-03T06:20:00.000Z",
        rolePayload: "long-retest-partial-exit",
        notes: "Trimmed half into VWAP extension, holding runner."
      }),
      createRawOrder({
        id: "10000000-0000-4000-8000-000000000008",
        fundId: seedFundSwingId,
        symbol: "BTCUSDT",
        side: "sell",
        quantity: "0.40000000",
        tradedPrice: "68500.00000000",
        orderTime: "2026-04-04T08:30:00.000Z",
        rolePayload: "short-trend-open"
      }),
      createRawOrder({
        id: "10000000-0000-4000-8000-000000000009",
        fundId: seedFundSwingId,
        symbol: "BTCUSDT",
        side: "buy",
        quantity: "0.40000000",
        tradedPrice: "68500.00000000",
        orderTime: "2026-04-04T18:00:00.000Z",
        rolePayload: "short-trend-breakeven-close",
        notes: "Stopped scratching after momentum stalled."
      }),
      createRawOrder({
        id: "10000000-0000-4000-8000-000000000010",
        fundId: seedFundSwingId,
        symbol: "ETHUSDT",
        side: "buy",
        quantity: "3.00000000",
        tradedPrice: "3450.00000000",
        orderTime: "2026-04-05T07:15:00.000Z",
        rolePayload: "long-trend-open"
      }),
      createRawOrder({
        id: "10000000-0000-4000-8000-000000000011",
        fundId: seedFundSwingId,
        symbol: "ETHUSDT",
        side: "sell",
        quantity: "3.00000000",
        tradedPrice: "3528.00000000",
        orderTime: "2026-04-06T13:10:00.000Z",
        rolePayload: "long-trend-profit-close",
        notes: "Clean swing follow-through into resistance."
      }),
      createRawOrder({
        id: "10000000-0000-4000-8000-000000000012",
        fundId: seedFundSwingId,
        symbol: "SOLUSDT",
        side: "sell",
        quantity: "40.00000000",
        tradedPrice: "184.50000000",
        orderTime: "2026-04-07T09:20:00.000Z",
        rolePayload: "short-failed-break-open"
      }),
      createRawOrder({
        id: "10000000-0000-4000-8000-000000000013",
        fundId: seedFundSwingId,
        symbol: "SOLUSDT",
        side: "buy",
        quantity: "40.00000000",
        tradedPrice: "191.30000000",
        orderTime: "2026-04-07T16:40:00.000Z",
        rolePayload: "short-failed-break-loss-close",
        notes: "Cover was late after reclaim held all afternoon."
      })
    ];

    await tx.insert(rawOrders).values(seededOrders);

    await tx.insert(orderGroups).values([
      {
        id: "20000000-0000-4000-8000-000000000001",
        fundId: seedFundAlphaId,
        symbol: "NIFTY24APR22500CE",
        positionType: "long",
        status: "closed",
        firstInteractionDate: new Date("2026-04-01T03:47:00.000Z"),
        lastInteractionDate: new Date("2026-04-01T05:25:00.000Z"),
        openedAt: new Date("2026-04-01T03:47:00.000Z"),
        closedAt: new Date("2026-04-01T05:25:00.000Z"),
        openingOrderId: "10000000-0000-4000-8000-000000000001",
        quantityOpen: "75.00000000",
        quantityClosed: "75.00000000",
        remainingQuantity: "0.00000000",
        grossBuyQuantity: "75.00000000",
        grossSellQuantity: "75.00000000",
        averageEntryPrice: "144.33333333",
        averageExitPrice: "167.50000000",
        realizedPnl: "1737.50000025",
        returnStatus: "profit",
        brokerFees: "18.00000000",
        charges: "11.00000000",
        notes: "Best opening-range trade of the week.",
        metadata: {
          seededScenario: "long-profit-full-close"
        }
      },
      {
        id: "20000000-0000-4000-8000-000000000002",
        fundId: seedFundAlphaId,
        symbol: "BANKNIFTY24APR48000PE",
        positionType: "short",
        status: "closed",
        firstInteractionDate: new Date("2026-04-02T04:05:00.000Z"),
        lastInteractionDate: new Date("2026-04-02T05:18:00.000Z"),
        openedAt: new Date("2026-04-02T04:05:00.000Z"),
        closedAt: new Date("2026-04-02T05:18:00.000Z"),
        openingOrderId: "10000000-0000-4000-8000-000000000004",
        quantityOpen: "30.00000000",
        quantityClosed: "30.00000000",
        remainingQuantity: "0.00000000",
        grossBuyQuantity: "30.00000000",
        grossSellQuantity: "30.00000000",
        averageEntryPrice: "215.00000000",
        averageExitPrice: "244.00000000",
        realizedPnl: "-879.00000000",
        returnStatus: "loss",
        brokerFees: "6.00000000",
        charges: "3.00000000",
        notes: "Short idea was early and got squeezed.",
        metadata: {
          seededScenario: "short-loss-full-close"
        }
      },
      {
        id: "20000000-0000-4000-8000-000000000003",
        fundId: seedFundAlphaId,
        symbol: "RELIANCE",
        positionType: "long",
        status: "open",
        firstInteractionDate: new Date("2026-04-03T04:10:00.000Z"),
        lastInteractionDate: null,
        openedAt: new Date("2026-04-03T04:10:00.000Z"),
        closedAt: null,
        openingOrderId: "10000000-0000-4000-8000-000000000006",
        quantityOpen: "120.00000000",
        quantityClosed: "60.00000000",
        remainingQuantity: "60.00000000",
        grossBuyQuantity: "120.00000000",
        grossSellQuantity: "60.00000000",
        averageEntryPrice: "2895.20000000",
        averageExitPrice: "2918.60000000",
        realizedPnl: null,
        returnStatus: "neutral",
        brokerFees: "0.00000000",
        charges: "0.00000000",
        notes: "Half booked, runner still active above VWAP.",
        metadata: {
          seededScenario: "long-open-partial-exit"
        }
      },
      {
        id: "20000000-0000-4000-8000-000000000004",
        fundId: seedFundSwingId,
        symbol: "BTCUSDT",
        positionType: "short",
        status: "closed",
        firstInteractionDate: new Date("2026-04-04T08:30:00.000Z"),
        lastInteractionDate: new Date("2026-04-04T18:00:00.000Z"),
        openedAt: new Date("2026-04-04T08:30:00.000Z"),
        closedAt: new Date("2026-04-04T18:00:00.000Z"),
        openingOrderId: "10000000-0000-4000-8000-000000000008",
        quantityOpen: "0.40000000",
        quantityClosed: "0.40000000",
        remainingQuantity: "0.00000000",
        grossBuyQuantity: "0.40000000",
        grossSellQuantity: "0.40000000",
        averageEntryPrice: "68500.00000000",
        averageExitPrice: "68500.00000000",
        realizedPnl: "0.00000000",
        returnStatus: "neutral",
        brokerFees: "0.00000000",
        charges: "0.00000000",
        notes: "Trade scratched to free up risk for the US session.",
        metadata: {
          seededScenario: "short-breakeven-close"
        }
      },
      {
        id: "20000000-0000-4000-8000-000000000005",
        fundId: seedFundSwingId,
        symbol: "ETHUSDT",
        positionType: "long",
        status: "closed",
        firstInteractionDate: new Date("2026-04-05T07:15:00.000Z"),
        lastInteractionDate: new Date("2026-04-06T13:10:00.000Z"),
        openedAt: new Date("2026-04-05T07:15:00.000Z"),
        closedAt: new Date("2026-04-06T13:10:00.000Z"),
        openingOrderId: "10000000-0000-4000-8000-000000000010",
        quantityOpen: "3.00000000",
        quantityClosed: "3.00000000",
        remainingQuantity: "0.00000000",
        grossBuyQuantity: "3.00000000",
        grossSellQuantity: "3.00000000",
        averageEntryPrice: "3450.00000000",
        averageExitPrice: "3528.00000000",
        realizedPnl: "234.00000000",
        returnStatus: "profit",
        brokerFees: "0.00000000",
        charges: "0.00000000",
        notes: "Held the swing through a higher-low continuation.",
        metadata: {
          seededScenario: "long-profit-full-close"
        }
      },
      {
        id: "20000000-0000-4000-8000-000000000006",
        fundId: seedFundSwingId,
        symbol: "SOLUSDT",
        positionType: "short",
        status: "closed",
        firstInteractionDate: new Date("2026-04-07T09:20:00.000Z"),
        lastInteractionDate: new Date("2026-04-07T16:40:00.000Z"),
        openedAt: new Date("2026-04-07T09:20:00.000Z"),
        closedAt: new Date("2026-04-07T16:40:00.000Z"),
        openingOrderId: "10000000-0000-4000-8000-000000000012",
        quantityOpen: "40.00000000",
        quantityClosed: "40.00000000",
        remainingQuantity: "0.00000000",
        grossBuyQuantity: "40.00000000",
        grossSellQuantity: "40.00000000",
        averageEntryPrice: "184.50000000",
        averageExitPrice: "191.30000000",
        realizedPnl: "-272.00000000",
        returnStatus: "loss",
        brokerFees: "0.00000000",
        charges: "0.00000000",
        notes: "Failed breakdown faded hard once reclaim held.",
        metadata: {
          seededScenario: "short-loss-full-close"
        }
      }
    ]);

    await tx.insert(orderGroupOrders).values([
      {
        orderGroupId: "20000000-0000-4000-8000-000000000001",
        rawOrderId: "10000000-0000-4000-8000-000000000001",
        sequenceNumber: 1,
        role: "open",
        signedQuantityDelta: "50.00000000"
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000001",
        rawOrderId: "10000000-0000-4000-8000-000000000002",
        sequenceNumber: 2,
        role: "scale_in",
        signedQuantityDelta: "25.00000000"
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000001",
        rawOrderId: "10000000-0000-4000-8000-000000000003",
        sequenceNumber: 3,
        role: "close",
        signedQuantityDelta: "-75.00000000"
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000002",
        rawOrderId: "10000000-0000-4000-8000-000000000004",
        sequenceNumber: 1,
        role: "open",
        signedQuantityDelta: "30.00000000"
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000002",
        rawOrderId: "10000000-0000-4000-8000-000000000005",
        sequenceNumber: 2,
        role: "close",
        signedQuantityDelta: "-30.00000000"
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000003",
        rawOrderId: "10000000-0000-4000-8000-000000000006",
        sequenceNumber: 1,
        role: "open",
        signedQuantityDelta: "120.00000000"
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000003",
        rawOrderId: "10000000-0000-4000-8000-000000000007",
        sequenceNumber: 2,
        role: "scale_out",
        signedQuantityDelta: "-60.00000000"
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000004",
        rawOrderId: "10000000-0000-4000-8000-000000000008",
        sequenceNumber: 1,
        role: "open",
        signedQuantityDelta: "0.40000000"
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000004",
        rawOrderId: "10000000-0000-4000-8000-000000000009",
        sequenceNumber: 2,
        role: "close",
        signedQuantityDelta: "-0.40000000"
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000005",
        rawOrderId: "10000000-0000-4000-8000-000000000010",
        sequenceNumber: 1,
        role: "open",
        signedQuantityDelta: "3.00000000"
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000005",
        rawOrderId: "10000000-0000-4000-8000-000000000011",
        sequenceNumber: 2,
        role: "close",
        signedQuantityDelta: "-3.00000000"
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000006",
        rawOrderId: "10000000-0000-4000-8000-000000000012",
        sequenceNumber: 1,
        role: "open",
        signedQuantityDelta: "40.00000000"
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000006",
        rawOrderId: "10000000-0000-4000-8000-000000000013",
        sequenceNumber: 2,
        role: "close",
        signedQuantityDelta: "-40.00000000"
      }
    ]);

    await tx.insert(orderGroupSetupTags).values([
      {
        orderGroupId: "20000000-0000-4000-8000-000000000001",
        tradeTagId: tagIds.openingRange
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000001",
        tradeTagId: tagIds.breakout
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000002",
        tradeTagId: tagIds.retest
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000003",
        tradeTagId: tagIds.retest
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000004",
        tradeTagId: tagIds.trendFollow
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000005",
        tradeTagId: tagIds.trendFollow
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000006",
        tradeTagId: tagIds.breakout
      }
    ]);

    await tx.insert(orderGroupReviewTags).values([
      {
        orderGroupId: "20000000-0000-4000-8000-000000000001",
        tradeTagId: tagIds.ruleBased
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000001",
        tradeTagId: tagIds.patience
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000002",
        tradeTagId: tagIds.fomo
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000003",
        tradeTagId: tagIds.ruleBased
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000004",
        tradeTagId: tagIds.patience
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000005",
        tradeTagId: tagIds.ruleBased
      },
      {
        orderGroupId: "20000000-0000-4000-8000-000000000006",
        tradeTagId: tagIds.lateExit
      }
    ]);

    await tx.insert(tradeNotes).values([
      {
        id: "30000000-0000-4000-8000-000000000001",
        orderGroupId: "20000000-0000-4000-8000-000000000001",
        noteType: "setup",
        content: "Index breadth was strong from the open and the premium held above VWAP on the first pullback."
      },
      {
        id: "30000000-0000-4000-8000-000000000002",
        orderGroupId: "20000000-0000-4000-8000-000000000001",
        noteType: "review",
        content: "Good patience on the add. Exit could have left a runner, but the process was clean."
      },
      {
        id: "30000000-0000-4000-8000-000000000003",
        orderGroupId: "20000000-0000-4000-8000-000000000002",
        noteType: "review",
        content: "Short entry was one candle early and size was too aggressive into support."
      },
      {
        id: "30000000-0000-4000-8000-000000000004",
        orderGroupId: "20000000-0000-4000-8000-000000000003",
        noteType: "general",
        content: "Still holding half position. Watching for a close above 2935 to trail the remainder."
      },
      {
        id: "30000000-0000-4000-8000-000000000005",
        orderGroupId: "20000000-0000-4000-8000-000000000005",
        noteType: "setup",
        content: "Swing continuation after reclaim of daily EMA cluster."
      },
      {
        id: "30000000-0000-4000-8000-000000000006",
        orderGroupId: "20000000-0000-4000-8000-000000000006",
        noteType: "review",
        content: "Cover should have happened on the first failed push back above 188."
      }
    ]);

    await tx.insert(sharedTradeGroups).values([
      {
        id: "40000000-0000-4000-8000-000000000001",
        orderGroupId: "20000000-0000-4000-8000-000000000001",
        createdByUserId: seedUserPepeId,
        publicId: "tradepepe-seed-nifty-breakout",
        status: "published",
        title: "NIFTY Opening Range Breakout",
        summary: "Seeded example of a clean momentum options trade with an add and full take-profit.",
        publishedAt: new Date("2026-04-01T06:00:00.000Z"),
        snapshot: {
          featured: true
        }
      }
    ]);

    await tx.insert(profileFollows).values([
      { followerUserId: seedUserFlyingId, targetUserId: seedUserPepeId },
      { followerUserId: seedUserRoundhogId, targetUserId: seedUserPepeId },
      { followerUserId: seedUserPepeId, targetUserId: seedUserFlyingId }
    ]);

    await tx.insert(communityComments).values([
      {
        id: "50000000-0000-4000-8000-000000000001",
        postId: "40000000-0000-4000-8000-000000000001",
        authorUserId: seedUserRoundhogId,
        content: "Impressive execution! Did you monitor order flow data to confirm the breakout, or was this purely based on the price action?"
      },
      {
        id: "50000000-0000-4000-8000-000000000002",
        postId: "40000000-0000-4000-8000-000000000001",
        authorUserId: seedUserFlyingId,
        content: "Thanks for sharing this. The management around the add and the exit timing was very clean."
      }
    ]);

    await tx.insert(communityReactions).values([
      { postId: "40000000-0000-4000-8000-000000000001", userId: seedUserFlyingId },
      { postId: "40000000-0000-4000-8000-000000000001", userId: seedUserRoundhogId }
    ]);

    await tx.insert(flashNewsItems).values([
      {
        title: "Broader Market News",
        summary: "Nifty IT index drops 2% as US tech stocks face selloff; TCS and Infosys lead declines.",
        source: "Market Desk",
        sortOrder: 1
      },
      {
        title: "RBI Repo Rate",
        summary: "RBI keeps repo rate unchanged at 6.50%; maintains withdrawal of accommodation stance.",
        source: "Macro Wire",
        sortOrder: 2
      },
      {
        title: "FII/DII Flows",
        summary: "Foreign funds turn net sellers while domestic institutions cushion broader market volatility.",
        source: "Flows Monitor",
        sortOrder: 3
      }
    ]);

    await tx.insert(economicIndicatorRows).values([
      {
        country: "India",
        indicator: "Manufacturing PMI",
        september: "57.5",
        october: "57.4",
        november: "56.9",
        december: "56.7",
        sortOrder: 1
      },
      {
        country: "India",
        indicator: "Services PMI",
        september: "58.1",
        october: "58.5",
        november: "58.8",
        december: "59.2",
        sortOrder: 2
      },
      {
        country: "USA",
        indicator: "Inflation Rate",
        september: "3.1",
        october: "3.2",
        november: "3.1",
        december: "3.0",
        sortOrder: 3
      },
      {
        country: "USA",
        indicator: "GDP Growth Rate",
        september: "2.8",
        october: "2.9",
        november: "2.9",
        december: "2.7",
        sortOrder: 4
      }
    ]);
  });

  logger.info("Database seeded with realistic TradePepe journal data");
}

seed()
  .catch((error: unknown) => {
    logger.error({ error }, "Database seeding failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await queryClient.end();
  });
