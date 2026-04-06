import { resourceRepository } from "../repositories/resource.repository.js";
import { journalRepository } from "../repositories/journal.repository.js";
import { mapFund, mapImportDetail, mapImportHistory, mapTag, mapTradeNote } from "../mappers/resource.mapper.js";
import { slugify } from "../utils/slug.util.js";
import { ApiError } from "../utils/api-error.js";

import type { ResourceRepository } from "../types/resource.types.js";
import type {
  CreateFundInput,
  CreateTagInput,
  ImportsListQuery,
  PatchFundInput,
  PatchNoteInput,
  PatchTagInput,
  TagListQuery
} from "../validators/resource.validator.js";
import type { JournalRepository } from "../types/journal.types.js";

export class ResourceService {
  constructor(
    private readonly repository: ResourceRepository = resourceRepository,
    private readonly journalRepo: JournalRepository = journalRepository
  ) {}

  async listTags(query: TagListQuery) {
    const tags = await this.repository.listTags(query);
    return tags.map(mapTag);
  }

  async createTag(input: CreateTagInput) {
    const slug = slugify(input.slug ?? input.name);
    const existing = await this.repository.findTagBySlugAndScope(slug, input.type);

    if (existing) {
      throw new ApiError(409, "Tag slug already exists for this type");
    }

    const tag = await this.repository.createTag({
      name: input.name,
      slug,
      color: input.color ?? null,
      scope: input.type
    });

    return mapTag(tag);
  }

  async updateTag(id: string, input: PatchTagInput) {
    const existing = await this.repository.findTagById(id);

    if (!existing) {
      throw new ApiError(404, "Tag not found");
    }

    const scope = input.type ?? (existing.scope === "both" ? "setup" : existing.scope);
    const slug = input.slug ? slugify(input.slug) : input.name ? slugify(input.name) : existing.slug;
    const duplicate = await this.repository.findTagBySlugAndScope(slug, scope);

    if (duplicate && duplicate.id !== id) {
      throw new ApiError(409, "Tag slug already exists for this type");
    }

    const updated = await this.repository.updateTag(id, {
      name: input.name ?? existing.name,
      slug,
      color: input.color === undefined ? existing.color : input.color,
      scope
    });

    if (!updated) {
      throw new ApiError(404, "Tag not found");
    }

    return mapTag(updated);
  }

  async listFunds() {
    const funds = await this.repository.listFunds();
    return funds.map(mapFund);
  }

  async createFund(input: CreateFundInput) {
    const code = slugify(input.name).toUpperCase().slice(0, 40) || "FUND";
    const fund = await this.repository.createFund({
      name: input.name,
      code,
      brokerName: input.brokerName ?? null,
      baseCurrency: input.currency
    });

    return mapFund(fund);
  }

  async updateFund(id: string, input: PatchFundInput) {
    const existing = await this.repository.findFundById(id);

    if (!existing) {
      throw new ApiError(404, "Fund not found");
    }

    const updated = await this.repository.updateFund(id, {
      name: input.name ?? existing.name,
      brokerName: input.brokerName === undefined ? existing.brokerName : input.brokerName,
      baseCurrency: input.currency ?? existing.baseCurrency
    });

    if (!updated) {
      throw new ApiError(404, "Fund not found");
    }

    return mapFund(updated);
  }

  async listImports(query: ImportsListQuery) {
    const result = await this.repository.listImports(query);

    return {
      ...result,
      items: result.items.map(mapImportHistory)
    };
  }

  async getImportById(id: string) {
    const item = await this.repository.getImportById(id);

    if (!item) {
      throw new ApiError(404, "Import not found");
    }

    return mapImportDetail(item);
  }

  async listOrderGroupNotes(orderGroupId: string) {
    const bundle = await this.journalRepo.getOrderGroupBundle(orderGroupId);

    if (!bundle) {
      throw new ApiError(404, "Order group not found");
    }

    const notes = await this.repository.listNotesByOrderGroupId(orderGroupId);
    return notes.map(mapTradeNote);
  }

  async updateNote(id: string, input: PatchNoteInput) {
    const note = await this.repository.findNoteById(id);

    if (!note) {
      throw new ApiError(404, "Note not found");
    }

    const updated = await this.repository.updateNote(id, {
      noteType: input.noteType ?? note.noteType,
      content: input.content ?? note.content
    });

    if (!updated) {
      throw new ApiError(404, "Note not found");
    }

    return mapTradeNote(updated);
  }

  async deleteNote(id: string) {
    const note = await this.repository.findNoteById(id);

    if (!note) {
      throw new ApiError(404, "Note not found");
    }

    await this.repository.deleteNote(id);

    return {
      id,
      deleted: true
    };
  }
}

export const resourceService = new ResourceService();
