import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["konva", "react-konva"],
  turbopack: {
    resolveAlias: {
      konva: "./node_modules/konva",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      konva: path.join(process.cwd(), "node_modules/konva"),
    };
    return config;
  },
};

export default nextConfig;
