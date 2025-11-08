export const isRetryAble = (
  code: string
): boolean => {
  return [
    "SERVICE_UNAVAILABLE",
    "UNKNOWN_ERROR",
    "TIMEOUT",
    "NETWORK_ERROR",
    "NOT_FOUND"
  ].includes(code);
};
