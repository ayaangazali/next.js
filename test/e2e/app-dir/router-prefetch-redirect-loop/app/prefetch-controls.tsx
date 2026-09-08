'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Prefetch = ReturnType<typeof useRouter>['prefetch']
type PrefetchOptions = NonNullable<Parameters<Prefetch>[1]>

// PrefetchKind is a TypeScript enum in Next, so the literal needs a cast.
const FULL = { kind: 'full' } as PrefetchOptions

const REDIRECTING_URL = '/docs/changelog'

// Counts every request carrying the router's `_rsc` search param, via Resource
// Timing, so the test can read the count out of the DOM.
function useRscRequestCount(): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    performance.setResourceTimingBufferSize(100_000)
    let total = 0
    const observer = new PerformanceObserver((list) => {
      let added = 0
      for (const entry of list.getEntries()) {
        if (new URL(entry.name, location.href).searchParams.has('_rsc')) {
          added++
        }
      }
      if (added === 0) return
      total += added
      setCount(total)
    })
    observer.observe({ type: 'resource', buffered: true })
    return () => observer.disconnect()
  }, [])

  return count
}

export function PrefetchControls() {
  const router = useRouter()
  const count = useRscRequestCount()

  return (
    <section>
      <button
        type="button"
        onClick={() => router.prefetch(REDIRECTING_URL, FULL)}
        id="prefetch-full"
      >
        prefetch full
      </button>
      <button
        type="button"
        onClick={() => router.prefetch(REDIRECTING_URL)}
        id="prefetch-auto"
      >
        prefetch auto
      </button>
      <p id="rsc-total">{count}</p>
    </section>
  )
}
