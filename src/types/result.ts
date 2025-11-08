export type ResultError = {
  success: false;
  description: string;
  code: "NOT_FOUND" | "SERVICE_UNAVAILABLE" | "UNKNOWN_ERROR" | "TIMEOUT" | "NETWORK_ERROR" | string;
  statusCode: number
};

export type ResultSuccess<T> = {
  success: true;
  data: T;

  retryAble?: false;
};

export type Result<T> = ResultSuccess<T> | ResultError;
