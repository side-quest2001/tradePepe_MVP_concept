import { env } from "../../config/env.js";
import type { FlashNewsDto } from "../../types/community.types.js";
import type { FlashNewsProvider } from "./market-provider.types.js";

interface MarketAuxArticle {
  uuid: string;
  title?: string;
  description?: string;
  source?: string;
  published_at?: string;
}

interface MarketAuxResponse {
  data?: MarketAuxArticle[];
}

export class MarketAuxProvider implements FlashNewsProvider {
  async getFlashNews(): Promise<FlashNewsDto[] | null> {
    if (!env.MARKETAUX_API_TOKEN) {
      return null;
    }

    const url = new URL("https://api.marketaux.com/v1/news/all");
    url.searchParams.set("api_token", env.MARKETAUX_API_TOKEN);
    url.searchParams.set("language", "en");
    url.searchParams.set("filter_entities", "true");
    url.searchParams.set("must_have_entities", "true");
    url.searchParams.set("group_similar", "true");
    url.searchParams.set("limit", String(env.MARKETAUX_NEWS_LIMIT));

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`MarketAux request failed with ${response.status}`);
    }

    const payload = (await response.json()) as MarketAuxResponse;
    const items = payload.data ?? [];

    if (items.length === 0) {
      return [];
    }

    return items.map((item) => ({
      id: item.uuid,
      title: item.title?.trim() || "Market headline",
      summary: item.description?.trim() || "Latest market development.",
      source: item.source?.trim() || "MarketAux",
      createdAt: item.published_at ?? new Date().toISOString()
    }));
  }
}
