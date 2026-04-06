import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { marketRepository } from "../repositories/market.repository.js";
import { MarketAuxProvider } from "../providers/market/marketaux.provider.js";
import { AlphaVantageProvider } from "../providers/market/alpha-vantage.provider.js";
import type {
  EconomicIndicatorsProvider,
  FlashNewsProvider
} from "../providers/market/market-provider.types.js";
import type { EconomicIndicatorRowDto, FlashNewsDto } from "../types/community.types.js";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export class MarketService {
  private flashNewsCache: CacheEntry<FlashNewsDto[]> | null = null;
  private economicIndicatorsCache: CacheEntry<EconomicIndicatorRowDto[]> | null = null;

  constructor(
    private readonly repository = marketRepository,
    private readonly flashNewsProvider: FlashNewsProvider = new MarketAuxProvider(),
    private readonly economicIndicatorsProvider: EconomicIndicatorsProvider = new AlphaVantageProvider(),
    private readonly now = () => Date.now()
  ) {}

  async listFlashNews() {
    const cached = this.flashNewsCache;
    if (cached && cached.expiresAt > this.now()) {
      return cached.value;
    }

    const value = await this.resolveFlashNews();
    this.flashNewsCache = {
      value,
      expiresAt: this.now() + env.MARKET_NEWS_CACHE_TTL_SECONDS * 1000
    };

    return value;
  }

  async listEconomicIndicators() {
    const cached = this.economicIndicatorsCache;
    if (cached && cached.expiresAt > this.now()) {
      return cached.value;
    }

    const value = await this.resolveEconomicIndicators();
    this.economicIndicatorsCache = {
      value,
      expiresAt: this.now() + env.MARKET_ECONOMIC_CACHE_TTL_SECONDS * 1000
    };

    return value;
  }

  private async resolveFlashNews() {
    try {
      const providerRows = await this.flashNewsProvider.getFlashNews();
      if (providerRows && providerRows.length > 0) {
        return providerRows;
      }
    } catch (error) {
      logger.warn({ error }, "Flash news provider failed, falling back to repository data");
    }

    const fallback = await this.repository.listFlashNews();
    return fallback.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      source: item.source,
      createdAt: item.createdAt.toISOString(),
      imageUrl: item.imageUrl ?? null,
      articleUrl: null
    }));
  }

  private async resolveEconomicIndicators() {
    try {
      const providerRows = await this.economicIndicatorsProvider.getEconomicIndicators();
      if (providerRows && providerRows.length > 0) {
        return providerRows;
      }
    } catch (error) {
      logger.warn({ error }, "Economic indicator provider failed, falling back to repository data");
    }

    const fallback = await this.repository.listEconomicIndicators();
    return fallback.map((item) => ({
      country: item.country,
      indicator: item.indicator,
      september: item.september,
      october: item.october,
      november: item.november,
      december: item.december
    }));
  }
}

export const marketService = new MarketService();
