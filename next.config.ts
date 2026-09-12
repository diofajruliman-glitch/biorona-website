import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const remotePatterns = supabaseUrl
  ? [{ protocol: "https" as const, hostname: new URL(supabaseUrl).hostname, pathname: "/storage/v1/object/public/product-images/**" }]
  : [];

const nextConfig: NextConfig = {
  images: { unoptimized: true, remotePatterns },
  trailingSlash: true,
};

export default nextConfig;
