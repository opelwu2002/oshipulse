/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      's4.anilist.co',
      'upload.wikimedia.org',
      'images.unsplash.com',
      'raw.githubusercontent.com',
      'cdn.myanimelist.net',
      'i.imgur.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
