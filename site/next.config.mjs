/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cover images are local files served from /public — no loader needed.
  // Setting unoptimized keeps things simple and avoids per-image build cost.
  images: { unoptimized: true },
};

export default nextConfig;
