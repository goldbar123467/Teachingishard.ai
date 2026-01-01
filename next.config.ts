import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    workerThreads: false, // Disable worker threads to reduce memory
    cpus: 1, // Use single worker for static generation
  },
  // Disable static generation for heavy pages
  output: 'standalone',
};

export default nextConfig;
