import type { Request, Response } from "express";

import { resourceService } from "../services/resource.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { buildSuccessResponse } from "../utils/error-response.util.js";
import {
  createFundSchema,
  createTagSchema,
  idParamSchema,
  importsListQuerySchema,
  patchFundSchema,
  patchNoteSchema,
  patchTagSchema,
  tagListQuerySchema
} from "../validators/resource.validator.js";

export const listTags = asyncHandler(async (req: Request, res: Response) => {
  const query = tagListQuerySchema.parse(req.query);
  const result = await resourceService.listTags(query);
  res.status(200).json(buildSuccessResponse(result));
});

export const createTag = asyncHandler(async (req: Request, res: Response) => {
  const payload = createTagSchema.parse(req.body);
  const result = await resourceService.createTag(payload);
  res.status(201).json(buildSuccessResponse(result));
});

export const patchTag = asyncHandler(async (req: Request, res: Response) => {
  const params = idParamSchema.parse(req.params);
  const payload = patchTagSchema.parse(req.body);
  const result = await resourceService.updateTag(params.id, payload);
  res.status(200).json(buildSuccessResponse(result));
});

export const listFunds = asyncHandler(async (_req: Request, res: Response) => {
  const result = await resourceService.listFunds();
  res.status(200).json(buildSuccessResponse(result));
});

export const createFund = asyncHandler(async (req: Request, res: Response) => {
  const payload = createFundSchema.parse(req.body);
  const result = await resourceService.createFund(payload);
  res.status(201).json(buildSuccessResponse(result));
});

export const patchFund = asyncHandler(async (req: Request, res: Response) => {
  const params = idParamSchema.parse(req.params);
  const payload = patchFundSchema.parse(req.body);
  const result = await resourceService.updateFund(params.id, payload);
  res.status(200).json(buildSuccessResponse(result));
});

export const listImports = asyncHandler(async (req: Request, res: Response) => {
  const query = importsListQuerySchema.parse(req.query);
  const result = await resourceService.listImports(query);

  res.status(200).json(
    buildSuccessResponse(result.items, {
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages
      }
    })
  );
});

export const getImportById = asyncHandler(async (req: Request, res: Response) => {
  const params = idParamSchema.parse(req.params);
  const result = await resourceService.getImportById(params.id);
  res.status(200).json(buildSuccessResponse(result));
});

export const listOrderGroupNotes = asyncHandler(async (req: Request, res: Response) => {
  const params = idParamSchema.parse(req.params);
  const result = await resourceService.listOrderGroupNotes(params.id);
  res.status(200).json(buildSuccessResponse(result));
});

export const patchNote = asyncHandler(async (req: Request, res: Response) => {
  const params = idParamSchema.parse(req.params);
  const payload = patchNoteSchema.parse(req.body);
  const result = await resourceService.updateNote(params.id, payload);
  res.status(200).json(buildSuccessResponse(result));
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const params = idParamSchema.parse(req.params);
  const result = await resourceService.deleteNote(params.id);
  res.status(200).json(buildSuccessResponse(result));
});
