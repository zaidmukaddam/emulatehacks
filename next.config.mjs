/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["emulatehack.wterm.localhost"],
  transpilePackages: ["@wterm/core", "@wterm/dom", "@wterm/react"],
  experimental: { 
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
    viewTransition: true,
  },
};

export default nextConfig;
