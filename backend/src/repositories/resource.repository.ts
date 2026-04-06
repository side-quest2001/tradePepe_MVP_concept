import { and, count, desc, eq, inArray } from "drizzle-orm";

import { db } from "../db/client.js";
import { funds, imports, orderGroups, tradeNotes, tradeTags } from "../db/schema/trading.schema.js";

import type { DbExecutor } from "../types/db.types.js";
import type { ImportHistoryFilters, ResourceRepository, TagFilters } from "../types/resource.types.js";
import type { Fund, Import, TradeNote, TradeTag } from "../db/schema/trading.schema.js";

function buildPagination<T>(items: T[], total: number, page: number, pageSize: number) {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1
  };
}

export class ResourceRepositoryImpl implements ResourceRepository {
  constructor(private readonly executor: DbExecutor = db) {}

  async listTags(filters: TagFilters): Promise<TradeTag[]> {
    const predicates = [];
    if (filters.type) {
      predicates.push(eq(tradeTags.scope, filters.type));
    }

    return this.executor
      .select()
      .from(tradeTags)
      .where(predicates.length > 0 ? and(...predicates) : undefined)
      .orderBy(tradeTags.name);
  }

  async createTag(input: Partial<TradeTag> & Pick<TradeTag, "name" | "slug" | "scope">): Promise<TradeTag> {
    const results = await this.executor.insert(tradeTags).values(input).returning();
    return results[0];
  }

  async updateTag(id: string, input: Partial<TradeTag>): Promise<TradeTag | null> {
    const results = await this.executor
      .update(tradeTags)
      .set({
        ...input,
        updatedAt: new Date()
      })
      .where(eq(tradeTags.id, id))
      .returning();

    return results[0] ?? null;
  }

  async findTagById(id: string): Promise<TradeTag | null> {
    const results = await this.executor.select().from(tradeTags).where(eq(tradeTags.id, id)).limit(1);
    return results[0] ?? null;
  }

  async findTagBySlugAndScope(slug: string, scope: "setup" | "review"): Promise<TradeTag | null> {
    const results = await this.executor
      .select()
      .from(tradeTags)
      .where(and(eq(tradeTags.slug, slug), eq(tradeTags.scope, scope)))
      .limit(1);

    return results[0] ?? null;
  }

  async listFunds(): Promise<Fund[]> {
    return this.executor.select().from(funds).orderBy(funds.name);
  }

  async createFund(input: Pick<Fund, "name" | "code" | "baseCurrency"> & Partial<Fund>): Promise<Fund> {
    const results = await this.executor.insert(funds).values(input).returning();
    return results[0];
  }

  async updateFund(id: string, input: Partial<Fund>): Promise<Fund | null> {
    const results = await this.executor
      .update(funds)
      .set({
        ...input,
        updatedAt: new Date()
      })
      .where(eq(funds.id, id))
      .returning();

    return results[0] ?? null;
  }

  async findFundById(id: string): Promise<Fund | null> {
    const results = await this.executor.select().from(funds).where(eq(funds.id, id)).limit(1);
    return results[0] ?? null;
  }

  async listImports(filters: ImportHistoryFilters) {
    const predicates = [];
    if (filters.fundId) {
      predicates.push(eq(imports.fundId, filters.fundId));
    }

    const whereClause = predicates.length > 0 ? and(...predicates) : undefined;
    const [totalResult] = await this.executor.select({ count: count() }).from(imports).where(whereClause);
    const items = await this.executor
      .select()
      .from(imports)
      .where(whereClause)
      .orderBy(desc(imports.createdAt))
      .limit(filters.pageSize)
      .offset((filters.page - 1) * filters.pageSize);

    return buildPagination(items, totalResult?.count ?? 0, filters.page, filters.pageSize);
  }

  async getImportById(id: string): Promise<Import | null> {
    const results = await this.executor.select().from(imports).where(eq(imports.id, id)).limit(1);
    return results[0] ?? null;
  }

  async listNotesByOrderGroupId(orderGroupId: string): Promise<TradeNote[]> {
    return this.executor
      .select()
      .from(tradeNotes)
      .where(eq(tradeNotes.orderGroupId, orderGroupId))
      .orderBy(desc(tradeNotes.createdAt));
  }

  async findNoteById(id: string): Promise<TradeNote | null> {
    const results = await this.executor.select().from(tradeNotes).where(eq(tradeNotes.id, id)).limit(1);
    return results[0] ?? null;
  }

  async updateNote(id: string, input: Partial<TradeNote>): Promise<TradeNote | null> {
    const results = await this.executor
      .update(tradeNotes)
      .set({
        ...input,
        updatedAt: new Date()
      })
      .where(eq(tradeNotes.id, id))
      .returning();

    return results[0] ?? null;
  }

  async deleteNote(id: string): Promise<void> {
    await this.executor.delete(tradeNotes).where(eq(tradeNotes.id, id));
  }
}

export const resourceRepository = new ResourceRepositoryImpl();
