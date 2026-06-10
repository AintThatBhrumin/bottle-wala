import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.jalsetu.me"
      },
      {
        protocol: "http",
        hostname: "127.0.0.1"
      },
      {
        protocol: "http",
        hostname: "localhost"
      }
    ]
  }
};

export default nextConfig;
