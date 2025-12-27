import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Images are served via our own Pages Function at /api/images/<key>,
    // so no remotePatterns are required.
    remotePatterns: [],
  },
};

export default nextConfig;
