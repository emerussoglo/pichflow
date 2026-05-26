import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // On retire 'output: export' car les Server Actions demandent un serveur Node.js
  reactCompiler: true,
};

export default nextConfig;