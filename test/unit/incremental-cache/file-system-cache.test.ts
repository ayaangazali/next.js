import { promises as fs } from 'node:fs'
import { fileURLToPath } from 'node:url'
import FileSystemCache from 'next/dist/server/lib/incremental-cache/file-system-cache'
import { nodeFs } from 'next/dist/server/lib/node-fs-methods'
import {
  CachedRouteKind,
  IncrementalCacheKind,
} from 'next/dist/server/response-cache'
import { tagsManifest } from 'next/dist/server/lib/incremental-cache/tags-manifest.external'
import { NEXT_CACHE_TAGS_HEADER } from 'next/dist/lib/constants'

const cacheDir = fileURLToPath(new URL('./cache', import.meta.url))

describe('FileSystemCache', () => {
  it('set image route', async () => {
    const fsCache = new FileSystemCache({
      _requestHeaders: {},
      flushToDisk: true,
      fs: nodeFs,
      serverDistDir: cacheDir,
      revalidatedTags: [],
    })

    const binary = await fs.readFile(
      fileURLToPath(new URL('./images/icon.png', import.meta.url))
    )

    await fsCache.set(
      'icon.png',
      {
        body: binary,
        headers: {
          'Content-Type': 'image/png',
        },
        status: 200,
        kind: CachedRouteKind.APP_ROUTE,
      },
      {}
    )

    expect(
      (
        await fsCache.get('icon.png', {
          kind: IncrementalCacheKind.APP_ROUTE,
          isFallback: undefined,
        })
      )?.value
    ).toEqual({
      body: binary,
      headers: {
        'Content-Type': 'image/png',
      },
      status: 200,
      kind: IncrementalCacheKind.APP_ROUTE,
    })
  })
})

describe('FileSystemCache (isrMemory 0)', () => {
  const fsCache = new FileSystemCache({
    _requestHeaders: {},
    flushToDisk: true,
    fs: nodeFs,
    serverDistDir: cacheDir,
    revalidatedTags: [],
    maxMemoryCacheSize: 0, // disable memory cache
  })

  it('should cache fetch', async () => {
    await fsCache.set(
      'fetch-cache',
      {
        kind: CachedRouteKind.FETCH,
        data: {
          headers: {},
          body: 'MTcwMDA1NjM4MQ==',
          status: 200,
          url: 'http://my-api.local',
        },
        revalidate: 30,
      },
      {
        fetchCache: true,
        fetchUrl: 'http://my-api.local',
        fetchIdx: 5,
        tags: ['server-time'],
      }
    )

    const res = await fsCache.get('fetch-cache', {
      tags: ['server-time'],
      kind: IncrementalCacheKind.FETCH,
    })

    expect(res?.value).toEqual({
      kind: 'FETCH',
      data: {
        headers: {},
        body: 'MTcwMDA1NjM4MQ==',
        status: 200,
        url: 'http://my-api.local',
      },
      revalidate: 30,
      tags: ['server-time'],
    })
  })

  it('should cache unstable_cache', async () => {
    await fsCache.set(
      'unstable-cache',
      {
        kind: CachedRouteKind.FETCH,
        data: { headers: {}, body: '1700056381', status: 200, url: '' },
        revalidate: 30,
      },
      { fetchCache: true, tags: ['server-time2'] }
    )

    const res = await fsCache.get('unstable-cache', {
      tags: ['server-time'],
      kind: IncrementalCacheKind.FETCH,
    })

    expect(res?.value).toEqual({
      kind: 'FETCH',
      data: { headers: {}, body: '1700056381', status: 200, url: '' },
      revalidate: 30,
      tags: ['server-time2'],
    })
  })
})

describe('FileSystemCache (expired tags)', () => {
  const fsCache = new FileSystemCache({
    _requestHeaders: {},
    flushToDisk: true,
    fs: nodeFs,
    serverDistDir: cacheDir,
    revalidatedTags: [],
  })

  afterEach(() => {
    tagsManifest.delete('products')
  })

  it('reports an app page whose tag was revalidated as expired, not missing', async () => {
    await fsCache.set(
      'expired-tags-page',
      {
        kind: CachedRouteKind.APP_PAGE,
        html: '<p>hello</p>',
        rscData: Buffer.from('rsc'),
        headers: { [NEXT_CACHE_TAGS_HEADER]: 'products' },
        postponed: undefined,
        status: 200,
        segmentData: undefined,
      },
      {}
    )

    const beforeRevalidation = await fsCache.get('expired-tags-page', {
      kind: IncrementalCacheKind.APP_PAGE,
      isFallback: undefined,
    })
    expect(beforeRevalidation?.lastModified).toBeGreaterThan(0)

    // Expire the tag as `revalidateTag(tag, { expire: 0 })` does.
    tagsManifest.set('products', {
      expired: performance.timeOrigin + performance.now(),
    })

    // The entry must still be returned, with `lastModified: -1`. The
    // incremental cache turns that into `isStale: -1`, which is what forces a
    // blocking revalidation of this path. Returning null instead is
    // indistinguishable from a path that was never prerendered, and a dynamic
    // route then serves its fallback shell without ever regenerating.
    const afterRevalidation = await fsCache.get('expired-tags-page', {
      kind: IncrementalCacheKind.APP_PAGE,
      isFallback: undefined,
    })
    expect(afterRevalidation).not.toBeNull()
    expect(afterRevalidation?.lastModified).toBe(-1)
  })
})
