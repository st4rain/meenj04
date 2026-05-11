/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export — produces ./out/ for GitHub Pages.
  output: "export",
  // GitHub Pages serves /foo/ as /foo/index.html; trailingSlash makes Next emit
  // matching links so refreshing a deep page doesn't 404.
  trailingSlash: true,
  // next/image isn't supported in static export; we use plain <img> everywhere.
  // Setting `images.unoptimized` keeps the door open if any next/image sneaks in.
  images: { unoptimized: true },
  compiler: {
    emotion: true,
  },
};

module.exports = nextConfig;
