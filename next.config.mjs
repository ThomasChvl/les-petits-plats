import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: projectRoot,
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
