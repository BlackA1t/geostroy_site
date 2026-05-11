import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/index.html",
        destination: "/",
        permanent: true
      },
      {
        source: "/services.html",
        destination: "/services",
        permanent: true
      },
      {
        source: "/machines.html",
        destination: "/machines",
        permanent: true
      },
      {
        source: "/portfolio.html",
        destination: "/portfolio",
        permanent: true
      },
      {
        source: "/contacts.html",
        destination: "/contacts",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
