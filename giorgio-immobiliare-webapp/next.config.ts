import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // If you expose R2 via a public domain, add it here.
    // For now, we keep the old pattern removed to avoid broken config.
    remotePatterns: [],
  },
};

export default nextConfig;
