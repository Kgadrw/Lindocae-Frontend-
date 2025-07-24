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
};

export default nextConfig;
