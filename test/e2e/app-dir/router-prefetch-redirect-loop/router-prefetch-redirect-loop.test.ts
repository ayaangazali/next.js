import { nextTestSetup } from 'e2e-utils'
import { retry } from 'next-test-utils'

// Dev does not predict routes from a learned pattern, it resolves them on
// demand, so there is no prediction to send into the redirect.
// @force-gate prefetching
describe('router-prefetch-redirect-loop', () => {
  const { next } = nextTestSetup({
    files: __dirname,
  })

  it('settles a full router.prefetch of a URL that redirects to a differently shaped route', async () => {
    const browser = await next.browser('/docs/alpha')

    const readCount = async () =>
      Number(await browser.elementById('rsc-total').text())

    // Wait for the sidebar links to finish their automatic prefetches, which
    // is what teaches the router the /docs/[...] pattern.
    await retry(async () => {
      const before = await readCount()
      expect(before).toBeGreaterThan(0)
      await browser.eval('new Promise((r) => setTimeout(r, 500))')
      expect(await readCount()).toBe(before)
    })

    const beforePrefetch = await readCount()

    await browser.elementById('prefetch-full').click()

    // The prefetch predicts /docs/changelog from the /docs/[...] pattern, gets
    // a 308 to /changelog, and finds a tree that does not match the
    // prediction. It may retry, but it has to settle: pre-fix the retry
    // discarded the note that the prediction was wrong, so every round made
    // the same prediction again and the tab issued thousands of requests per
    // second until it was closed.
    await browser.eval('new Promise((r) => setTimeout(r, 3000))')
    const afterPrefetch = await readCount()

    await browser.eval('new Promise((r) => setTimeout(r, 2000))')
    expect(await readCount()).toBe(afterPrefetch)

    // A generous bound. Settled is a handful of requests; looping is
    // thousands.
    expect(afterPrefetch - beforePrefetch).toBeLessThan(50)
  })
})
