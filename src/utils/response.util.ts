export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function successResponse<T>(data: T, message?: string, pagination?: ApiResponse<T>['pagination']): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    pagination
  };
}

export function errorResponse(error: string): ApiResponse<null> {
  return {
    success: false,
    error
  };
}