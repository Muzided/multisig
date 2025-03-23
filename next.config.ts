import type { NextConfig } from "next";

interface WebpackConfig {
  externals: string[];
}

interface NextCustomConfig extends NextConfig {
  webpack: (config: WebpackConfig) => WebpackConfig;
}

const nextConfig: NextCustomConfig = {
  webpack: (config: WebpackConfig): WebpackConfig => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  }
};
export default nextConfig;
