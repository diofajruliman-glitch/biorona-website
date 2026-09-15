import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseHostname = "";

if (supabaseUrl) {
  try {
    const parsedUrl = new URL(supabaseUrl);
    if (parsedUrl.protocol === "https:") supabaseHostname = parsedUrl.hostname;
  } catch {
    // Invalid configuration is handled by the application without weakening image policy.
  }
}

const remotePatterns = supabaseHostname
  ? [{ protocol: "https" as const, hostname: supabaseHostname, pathname: "/storage/v1/object/public/product-images/**" }]
  : [];

const supabaseHttpsSource = supabaseHostname ? `https://${supabaseHostname}` : "";
const supabaseWssSource = supabaseHostname ? `wss://${supabaseHostname}` : "";
const developmentConnectSources = process.env.NODE_ENV === "development" ? " ws: http://localhost:*" : "";

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `img-src 'self' data: blob:${supabaseHttpsSource ? ` ${supabaseHttpsSource}` : ""}`,
  `connect-src 'self' data:${supabaseHttpsSource ? ` ${supabaseHttpsSource} ${supabaseWssSource}` : ""}${developmentConnectSources}`,
  "frame-src https://www.google.com blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  images: { remotePatterns },
  trailingSlash: true,
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      ],
    }];
  },
};

export default nextConfig;
