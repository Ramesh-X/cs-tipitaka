import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      ],
    },
  ],
};

export default nextConfig;
