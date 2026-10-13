"use client";

import { useEffect } from "react";

/**
 * The PayPal JS SDK can reject internally (e.g. its address-verification
 * postrobot bridge closing right after an order is authorised) and surface the
 * failure as a global "paypal_js_sdk_v5_unhandled_exception". Because that
 * rejection is not attached to any promise we control, it escapes as an
 * unhandled promise rejection / window error and pollutes the console even
 * though the payment itself succeeded.
 *
 * While `active` is true this hook installs narrowly-scoped window listeners
 * that call preventDefault() for those SDK-originated failures only, so they no
 * longer crash the tab or spam the console. All other errors pass through
 * untouched and the listeners are always torn down on cleanup.
 */
const PAYPAL_SDK_ERROR_NAME = /paypal_js_sdk_v5_unhandled_exception/i;

function isPayPalSdkFailure(value: unknown): boolean {
  if (value == null) return false;
  const parts: string[] = [];
  if (typeof value === "string") {
    parts.push(value);
  } else if (value instanceof Error) {
    parts.push(value.name, value.message, value.stack ?? "");
  } else if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.name === "string") parts.push(record.name);
    if (typeof record.message === "string") parts.push(record.message);
  } else {
    parts.push(String(value));
  }
  const text = parts.join(" ");
  if (PAYPAL_SDK_ERROR_NAME.test(text)) return true;
  return /paypal/i.test(text) && /unhandled/i.test(text);
}

export function usePayPalExceptionGuard(active: boolean) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const onError = (event: ErrorEvent) => {
      if (isPayPalSdkFailure(event.error) || isPayPalSdkFailure(event.message)) {
        event.preventDefault();
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isPayPalSdkFailure(event.reason)) {
        event.preventDefault();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [active]);
}
