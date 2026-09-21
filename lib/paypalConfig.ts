export type PayPalMode = "live" | "sandbox";

export function getPayPalMode(): PayPalMode {
  const mode = (process.env.NEXT_PUBLIC_PAYPAL_MODE || "sandbox").toLowerCase();
  return mode === "live" ? "live" : "sandbox";
}

export function getPayPalClientId(): string {
  if (getPayPalMode() === "live") {
    return process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test";
  }
  return (
    process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID ||
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    "test"
  );
}

export function isPayPalMock(): boolean {
  return getPayPalClientId() === "test";
}