import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/api/placeholder",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "wallpaperaccess.com",
      },
      {
        protocol: "https",
        hostname: "imgs.search.brave.com",
      },
    ],
  },
};

export default nextConfig;