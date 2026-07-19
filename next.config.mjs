/**
 * Next.js 15 configuration.
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,

  // Fail the production build on type or lint errors instead of silently shipping them.
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    // Allowlist of external image hosts. next/image will refuse any domain not listed here.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google account avatars
      { protocol: "https", hostname: "avatars.githubusercontent.com" }, // GitHub avatars
      { protocol: "https", hostname: "images.unsplash.com" }, // Seed/demo imagery
      { protocol: "https", hostname: "res.cloudinary.com" }, // User uploads (Cloudinary)
    ],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    // Only transform icon/util imports that are actually used — smaller client bundles.
    optimizePackageImports: ["lucide-react"],
    // Larger allowance for Server Action payloads (e.g. multi-field profile forms).
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Mongoose ships optional native deps it never needs in the serverless runtime;
  // keep them external so the bundler doesn't try to resolve them.
  serverExternalPackages: ["mongoose", "bcryptjs"],

  async redirects() {
    return [
      {
        source: "/signup",
        destination: "/register",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
