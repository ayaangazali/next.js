import { connection } from 'next/server'
import { Suspense } from 'react'

type Params = Promise<{ collection: string; slug: string[] }>

// Static shell plus one dynamic hole, so a full prefetch of a page under this
// route needs a runtime request rather than the static segment data.
export default function DocsPage({ params }: { params: Params }) {
  return (
    <>
      <h1 id="docs">A page under [collection]/[...slug]</h1>
      <Suspense fallback={<p>loading...</p>}>
        <Body params={params} />
      </Suspense>
    </>
  )
}

async function Body({ params }: { params: Params }) {
  const { collection, slug } = await params
  await connection()
  return (
    <p id="body">
      /{collection}/{slug.join('/')}
    </p>
  )
}
