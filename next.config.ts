import type { NextConfig } from "next";
import path from "path";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/wealthspan" : "",
  assetPrefix: isProd ? "/wealthspan/" : "",
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
