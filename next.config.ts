import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "nextacm.sgp1.cdn.digitaloceanspaces.com",
      "cdn.diuacm.com",
      "pub-15f222a0e56543078803204afc924060.r2.dev",
      "nextacm-backup.diuacm.com",
    ],
    loader: "custom",
    loaderFile: "./lib/cloudflareImageLoader.ts",
    // Optional: Define sizes that work well with your design
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
