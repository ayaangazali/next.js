import Link from 'next/link'
import type { ReactNode } from 'react'

import { PrefetchControls } from './prefetch-controls'

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
