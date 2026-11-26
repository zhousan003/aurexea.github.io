/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "aurexea.cc" }],
        destination: "https://www.aurexea.cc/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
