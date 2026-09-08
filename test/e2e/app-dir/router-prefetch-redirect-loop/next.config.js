const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
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
