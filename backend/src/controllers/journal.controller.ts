import type { Request, Response } from "express";

import { journalService } from "../services/journal.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { buildSuccessResponse } from "../utils/error-response.util.js";
import {
  assignTradeTagSchema,
  createTradeNoteSchema,
  manualOrderSchema,
  orderGroupIdParamSchema,
  orderGroupListQuerySchema,
  orderListQuerySchema,
  patchOrderGroupSchema,
  publishTradeGroupSchema
} from "../validators/journal.validator.js";
import { patchPublishSchema } from "../validators/resource.validator.js";

export const createManualOrder = asyncHandler(async (req: Request, res: Response) => {
  const payload = manualOrderSchema.parse(req.body);
  const result = await journalService.createManualOrder(payload);

  res.status(201).json(buildSuccessResponse(result));
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const query = orderListQuerySchema.parse(req.query);
  const result = await journalService.listOrders(query);

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

export const listOrderGroups = asyncHandler(async (req: Request, res: Response) => {
  const query = orderGroupListQuerySchema.parse(req.query);
  const result = await journalService.listOrderGroups(query);

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

export const getOrderGroupById = asyncHandler(async (req: Request, res: Response) => {
  const params = orderGroupIdParamSchema.parse(req.params);
  const result = await journalService.getOrderGroupById(params.id);

  res.status(200).json(buildSuccessResponse(result));
});

export const patchOrderGroup = asyncHandler(async (req: Request, res: Response) => {
  const params = orderGroupIdParamSchema.parse(req.params);
  const payload = patchOrderGroupSchema.parse(req.body);
  const result = await journalService.updateOrderGroup(params.id, payload);

  res.status(200).json(buildSuccessResponse(result));
});

export const createOrderGroupNote = asyncHandler(async (req: Request, res: Response) => {
  const params = orderGroupIdParamSchema.parse(req.params);
  const payload = createTradeNoteSchema.parse(req.body);
  const result = await journalService.createTradeNote(params.id, payload);

  res.status(201).json(buildSuccessResponse(result));
});

export const getOrderGroupNotes = asyncHandler(async (req: Request, res: Response) => {
  const params = orderGroupIdParamSchema.parse(req.params);
  const result = await journalService.listTradeNotes(params.id);

  res.status(200).json(buildSuccessResponse(result));
});

export const addOrderGroupSetupTag = asyncHandler(async (req: Request, res: Response) => {
  const params = orderGroupIdParamSchema.parse(req.params);
  const payload = assignTradeTagSchema.parse(req.body);
  const result = await journalService.assignSetupTag(params.id, payload);

  res.status(201).json(buildSuccessResponse(result));
});

export const addOrderGroupReviewTag = asyncHandler(async (req: Request, res: Response) => {
  const params = orderGroupIdParamSchema.parse(req.params);
  const payload = assignTradeTagSchema.parse(req.body);
  const result = await journalService.assignReviewTag(params.id, payload);

  res.status(201).json(buildSuccessResponse(result));
});

export const publishOrderGroup = asyncHandler(async (req: Request, res: Response) => {
  const params = orderGroupIdParamSchema.parse(req.params);
  const payload = publishTradeGroupSchema.parse(req.body);
  const result = await journalService.publishTradeGroup(params.id, payload);

  res.status(201).json(buildSuccessResponse(result));
});

export const getPublishedOrderGroup = asyncHandler(async (req: Request, res: Response) => {
  const params = orderGroupIdParamSchema.parse(req.params);
  const result = await journalService.getPublishedTradeGroup(params.id);

  res.status(200).json(buildSuccessResponse(result));
});

export const patchPublishedOrderGroup = asyncHandler(async (req: Request, res: Response) => {
  const params = orderGroupIdParamSchema.parse(req.params);
  const payload = patchPublishSchema.parse(req.body);
  const result = await journalService.updatePublishedTradeGroup(params.id, payload);

  res.status(200).json(buildSuccessResponse(result));
});

export const getOrderGroupChart = asyncHandler(async (req: Request, res: Response) => {
  const params = orderGroupIdParamSchema.parse(req.params);
  const result = await journalService.getOrderGroupChart(params.id);

  res.status(200).json(buildSuccessResponse(result));
});
