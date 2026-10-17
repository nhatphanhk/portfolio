/**
 * Detects whether a Gemini API error is unrecoverable (e.g. invalid API key, permission denied, quota exceeded).
 * For these errors, cycling through fallback models is futile and adds unnecessary latency.
 */
export function isUnrecoverableGeminiError(statusCode: number, errorData?: any): boolean {
  if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
    return true;
  }
  const status = errorData?.error?.status;
  const message = (
    typeof errorData?.error?.message === 'string'
      ? errorData.error.message
      : typeof errorData?.message === 'string'
      ? errorData.message
      : ''
  ).toLowerCase();

  if (
    status === 'PERMISSION_DENIED' ||
    status === 'UNAUTHENTICATED' ||
    status === 'INVALID_ARGUMENT' ||
    message.includes('api key') ||
    message.includes('apikey') ||
    message.includes('permission denied') ||
    message.includes('quota')
  ) {
    return true;
  }
  return false;
}
