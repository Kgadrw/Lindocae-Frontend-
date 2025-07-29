import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "www.gravatar.com",
      "upload.wikimedia.org",
      "cdn.jsdelivr.net",
      "images.pexels.com",
      "res.cloudinary.com",
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Disable static optimization for problematic pages
  trailingSlash: false,
};

export default nextConfig;
