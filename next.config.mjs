/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_META_CLIENT_ID: process.env.NEXT_PUBLIC_META_CLIENT_ID,
    NEXT_PUBLIC_META_REDIRECT_URI: process.env.NEXT_PUBLIC_META_REDIRECT_URI,
  },
  publicRuntimeConfig: {
    META_CLIENT_ID: process.env.NEXT_PUBLIC_META_CLIENT_ID,
    META_REDIRECT_URI: process.env.NEXT_PUBLIC_META_REDIRECT_URI,
  },
};

export default nextConfig;
