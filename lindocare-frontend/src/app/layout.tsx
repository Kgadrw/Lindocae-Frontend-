import type { Metadata } from "next";
import "./globals.css";
import HeaderWithCategories from "../components/HeaderWithCategories";
import Footer from "../components/Footer";

// ✅ Normal metadata
export const metadata: Metadata = {
  title: "Lindocare | Baby Essentials & Diapers Supplier",
  description:
    "Lindocare is your trusted supplier for high-quality baby essentials including diapers, wipes, and baby care products. Shop premium baby products with fast delivery.",
  keywords: [
    "Lindocare",
    "baby essentials",
    "baby diapers",
    "baby wipes",
    "baby care products",
    "diaper supplier",
    "baby products online",
    "newborn care",
    "infant essentials",
  ],
  authors: [{ name: "Lindocare Ltd" }],
  icons: {
    icon: "/lindo.png",
    shortcut: "/lindo.png",
    apple: "/lindo.png",
  },
  openGraph: {
    title: "Lindocare | Premium Baby Essentials & Diapers",
    description:
      "Shop premium quality diapers, wipes, and baby essentials from Lindocare. Fast delivery & trusted quality for your baby's needs.",
    url: "https://www.lindocare.store",
    siteName: "Lindocare",
    images: [
      {
        url: "/lindo.png",
        width: 512,
        height: 512,
        alt: "Lindocare Baby Products",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lindocare | Premium Baby Essentials & Diapers",
    description:
      "Shop premium baby products, including diapers & wipes, from Lindocare. Quality care for your little one.",
    images: ["/lindo.png"],
  },
  alternates: {
    canonical: "https://www.lindocare.store",
  },
};

// ✅ Fetch categories server-side
async function getCategories() {
  try {
    const res = await fetch("https://lindo-project.onrender.com/category/getAllCategories", {
      next: { revalidate: 3600 }, // revalidate every hour
    });
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.categories)) return data.categories;
    return [];
  } catch (e) {
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categories = await getCategories();

  // ✅ Build breadcrumb schema dynamically
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.lindocare.store",
      },
      ...categories.map((cat: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 2,
        name: cat.name,
        item: `https://www.lindocare.store/all-products?category=${encodeURIComponent(
          cat.name
        )}`,
      })),
    ],
  };

  return (
    <html lang="en">
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://lindo-project.onrender.com" />
        <link rel="preconnect" href="https://lindo-project.onrender.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Montserrat:wght@100..900&display=swap"
          rel="stylesheet"
        />

        {/* Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Lindocare Ltd",
              url: "https://www.lindocare.store",
              logo: "https://www.lindocare.store/lindo.png",
              description:
                "Supplier of premium baby essentials including diapers, wipes, and newborn care products.",
              sameAs: [
                "https://facebook.com/lindocare",
                "https://instagram.com/lindocare",
              ],
            }),
          }}
        />

        {/* Dynamic breadcrumbs with categories */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
      </head>
      <body className="antialiased">
        <HeaderWithCategories />
        <main className="min-h-screen bg-gray-50">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
