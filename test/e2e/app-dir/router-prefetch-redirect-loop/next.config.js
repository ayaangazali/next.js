/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    // An old URL under the dynamic [collection]/[...slug] route permanently
    // redirects to a static route whose tree has a different shape.
    return [
      {
        source: '/docs/changelog/:path*',
        destination: '/changelog/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
