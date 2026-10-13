"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface PayPalErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom UI shown instead of the buttons when the SDK crashes. */
  fallback?: ReactNode;
  /** Notified when the PayPal button subtree throws during render. */
  onError?: (error: Error) => void;
}

interface PayPalErrorBoundaryState {
  hasError: boolean;
}

/**
 * Isolates the PayPal JS SDK button subtree so an SDK-internal render/commit
 * throw cannot unmount the surrounding payment modal (or the whole portal).
 * Error boundaries cannot catch async callback failures, so those are also
 * wrapped in try/catch at the call sites.
 */
export default class PayPalErrorBoundary extends Component<
  PayPalErrorBoundaryProps,
  PayPalErrorBoundaryState
> {
  state: PayPalErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): PayPalErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(
      "[PAYPAL] Button subtree error (contained by boundary):",
      error?.message,
      info?.componentStack
    );
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
