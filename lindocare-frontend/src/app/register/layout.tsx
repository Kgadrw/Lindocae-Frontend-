import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Lindocare",
  description: "Create your Lindocare account to start shopping for baby essentials.",
};

export default function RegisterLayout({
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
