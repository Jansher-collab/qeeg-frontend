import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Log in | QEEG.com.au - Administration Portal",
  description:
    "Log in to the QEEG.com.au administration portal with your administrator email and password.",
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
