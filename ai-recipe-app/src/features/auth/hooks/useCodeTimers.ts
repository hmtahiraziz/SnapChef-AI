import { useCallback, useEffect, useState } from 'react';

export const OTP_RESEND_COOLDOWN_SEC = 45;
export const OTP_CODE_EXPIRY_SEC = 10 * 60; // 10 minutes

function formatCountdown(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Shared OTP timers: code expiry countdown + resend cooldown.
 * Starts both on mount (code was just sent) and again after a successful resend.
 */
export function useCodeTimers(options?: {
  expirySec?: number;
  cooldownSec?: number;
  startOnMount?: boolean;
}) {
  const expirySec = options?.expirySec ?? OTP_CODE_EXPIRY_SEC;
  const cooldownSec = options?.cooldownSec ?? OTP_RESEND_COOLDOWN_SEC;
  const startOnMount = options?.startOnMount ?? true;

  const [expiresIn, setExpiresIn] = useState(startOnMount ? expirySec : 0);
  const [resendIn, setResendIn] = useState(startOnMount ? cooldownSec : 0);

  useEffect(() => {
    if (expiresIn <= 0 && resendIn <= 0) return;
    const timer = setTimeout(() => {
      setExpiresIn((v) => (v > 0 ? v - 1 : 0));
      setResendIn((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [expiresIn, resendIn]);

  const restartAfterResend = useCallback(() => {
    setExpiresIn(expirySec);
    setResendIn(cooldownSec);
  }, [expirySec, cooldownSec]);

  const isExpired = expiresIn <= 0;
  const canResend = resendIn <= 0;

  return {
    expiresIn,
    resendIn,
    isExpired,
    canResend,
    expiryLabel: formatCountdown(expiresIn),
    resendLabel: resendIn > 0 ? `Resend code in ${resendIn}s` : "Didn't receive a code? Resend",
    restartAfterResend,
  };
}
