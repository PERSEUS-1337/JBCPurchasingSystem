export type ApiResponse<T> = {
  message: string;
  data: T;
};

export type ApiErrorPayload = {
  message?: string;
  data?: unknown;
};
