/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // 允許全網與常見外部 HTTPS/HTTP 圖片網域，解決 Vercel 生產環境外部圖片無法渲染問題
    remotePatterns: [
      // 1. Google 圖片 CDN 與搜尋縮圖 (gstatic / googleusercontent)
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: '*.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      // 2. AniList 官方動漫圖庫 CDN
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
      },
      // 3. Unsplash 高畫質圖庫
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // 4. 維基媒體 (Wikimedia Commons / Wikipedia)
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      // 5. GitHub Raw 靜態資源
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      // 6. MyAnimeList CDN
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
      },
      // 7. Imgur 圖床
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      // 8. Supabase 雲端儲存空間
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      // 9. 全網外部 HTTPS 萬用匹配
      {
        protocol: 'https',
        hostname: '**',
      },
      // 10. 全網外部 HTTP 萬用匹配 (向後相容)
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // 支援 SVG 格式圖片安全渲染
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
