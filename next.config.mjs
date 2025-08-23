/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/teams",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
