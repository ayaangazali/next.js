import Link from 'next/link'
import type { ReactNode } from 'react'

import { PrefetchControls } from './prefetch-controls'

// Visible links under the dynamic route. Their automatic prefetches teach the
// router's optimistic-routing pattern for /docs/*, and every one of them is
// re-fetched on each round of the loop.
const SIDEBAR = ['alpha', 'beta', 'gamma', 'delta']

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">/</Link>
          {SIDEBAR.map((slug) => (
            <Link key={slug} href={`/docs/${slug}`}>
              /docs/{slug}
            </Link>
          ))}
          <Link href="/changelog">/changelog</Link>
        </nav>
        <main>{children}</main>
        <PrefetchControls />
      </body>
    </html>
  )
}
