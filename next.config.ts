import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "nextacm.sgp1.cdn.digitaloceanspaces.com",
      "cdn.diuacm.com",
      "pub-15f222a0e56543078803204afc924060.r2.dev",
    ],
  },
  
  // Add KaTeX and MathJax to allowed external packages
  // Updated from experimental.serverComponentsExternalPackages to serverExternalPackages
  serverExternalPackages: ["katex", "mathjax"],
};

export default nextConfig;
