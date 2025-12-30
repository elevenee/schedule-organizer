import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'standalone',
  reactStrictMode: true,
  compiler:{
    // removeConsole: true
  }
  // outputFileTracingRoot:process.cwd(),
};

export default nextConfig;
