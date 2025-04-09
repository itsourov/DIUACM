import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "nextacm.sgp1.cdn.digitaloceanspaces.com",
      "cdn.diuacm.com",
    ],
  },
  // Configure webpack to handle MDEditor
  webpack: (config) => {
    // Fix for @uiw/react-md-editor
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        path: false,
      },
    };
    return config;
  },
};

export default nextConfig;
