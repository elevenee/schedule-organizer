import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'standalone',
  reactStrictMode: true,
  compiler:{
    removeConsole: false
  }
  // outputFileTracingRoot:process.cwd(),
};

export default nextConfig;
