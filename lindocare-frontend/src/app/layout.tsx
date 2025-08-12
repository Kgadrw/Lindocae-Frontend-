import type { Metadata } from "next";
import "./globals.css";
import HeaderWithCategories from '../components/HeaderWithCategories';
import Footer from '../components/Footer';

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
    url: "https://www.lindocare.com",
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
    canonical: "https://www.lindocare.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Montserrat:wght@100..900&display=swap"
          rel="stylesheet"
        />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Lindocare Ltd",
              url: "https://www.lindocare.com",
              logo: "https://www.lindocare.com/lindo.png",
              description:
                "Supplier of premium baby essentials including diapers, wipes, and newborn care products.",
              sameAs: [
                "https://facebook.com/lindocare",
                "https://instagram.com/lindocare",
              ],
            }),
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
