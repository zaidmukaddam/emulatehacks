/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["emulatehack.wterm.localhost"],
  transpilePackages: ["@wterm/core", "@wterm/dom", "@wterm/just-bash", "@wterm/react"],
  experimental: { viewTransition: true },
};

export default nextConfig;
