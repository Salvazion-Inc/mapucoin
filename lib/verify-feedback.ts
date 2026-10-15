export type VerifyMailFeedback = {
  sent: boolean;
  failed: boolean;
  waitSeconds: number;
  canResend: boolean;
};

/** What /verificar should show after a send attempt. The button stays available once the wait ends. */
export function verifyMailFeedback(input: {
  delivered?: boolean | null;
  retryAfter?: number | null;
  httpStatus?: number;
}): VerifyMailFeedback {
  const waitSeconds = Math.max(0, Math.ceil(Number(input.retryAfter) || 0));
  const httpStatus = input.httpStatus ?? 200;
  const rateLimited = httpStatus === 429;
  const failed =
    input.delivered === false ||
    httpStatus === 0 ||
    (httpStatus >= 400 && !rateLimited);
  return {
    sent: input.delivered === true && !failed && !rateLimited,
    failed,
    waitSeconds,
    canResend: waitSeconds <= 0,
  };
}
