import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class ApiResponse {
  static success(res: Response, data: unknown, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
  }

  static paginated(res: Response, data: unknown, pagination: PaginationMeta, message = 'Success') {
    return res.status(200).json({ success: true, message, data, pagination });
  }

  static created(res: Response, data: unknown, message = 'Created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }

  static error(res: Response, message: string, statusCode = 500, errors?: unknown) {
    const body: Record<string, unknown> = { success: false, message };
    if (errors !== undefined) body.errors = errors;
    return res.status(statusCode).json(body);
  }

  static notFound(res: Response, message = 'Resource not found') {
    return ApiResponse.error(res, message, 404);
  }

  static unauthorized(res: Response, message = 'Unauthorized') {
    return ApiResponse.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden') {
    return ApiResponse.error(res, message, 403);
  }

  static badRequest(res: Response, message: string, errors?: unknown) {
    return ApiResponse.error(res, message, 400, errors);
  }
}

export function buildPagination(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}
