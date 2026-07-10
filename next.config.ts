import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local Supabase auth emails link to 127.0.0.1 (matches supabase/config.toml
  // auth.site_url), which is a different dev origin than "localhost".
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
