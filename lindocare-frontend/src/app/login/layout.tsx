import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Lindocare",
  description: "Sign in to your Lindocare account to access your baby essentials.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
