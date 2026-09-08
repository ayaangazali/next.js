import { nextTestSetup } from 'e2e-utils'
import { retry } from 'next-test-utils'

// @force-gate prefetching
describe('router-prefetch-redirect-loop', () => {
  const { next } = nextTestSetup({
    files: __dirname,
  })

  it('settles a full router.prefetch of a URL that redirects to a differently shaped route', async () => {
    const browser = await next.browser('/docs/alpha')

    const readCount = async () =>
      Number(await browser.elementById('rsc-total').text())

    await retry(async () => {
      const before = await readCount()
      expect(before).toBeGreaterThan(0)
      await browser.eval('new Promise((r) => setTimeout(r, 500))')
      expect(await readCount()).toBe(before)
    })

    const beforePrefetch = await readCount()

    await browser.elementById('prefetch-full').click()

    await browser.eval('new Promise((r) => setTimeout(r, 3000))')
    const afterPrefetch = await readCount()

    await browser.eval('new Promise((r) => setTimeout(r, 2000))')
    expect(await readCount()).toBe(afterPrefetch)

    expect(afterPrefetch - beforePrefetch).toBeLessThan(50)
  })
})
