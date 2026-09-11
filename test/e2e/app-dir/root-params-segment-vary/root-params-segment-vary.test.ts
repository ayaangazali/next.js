import { nextTestSetup } from 'e2e-utils'
import { createRouterAct } from '../../../lib/router-act'
import type { Page } from 'playwright'

// Dev resolves routes on demand instead of serving them out of the client
// segment cache, so there is no cached entry to mis-key.
// @force-gate prefetching
describe('root-params-segment-vary', () => {
  const { next } = nextTestSetup({
    files: __dirname,
  })

  it('does not reuse a segment cached for one root param value at another', async () => {
    let page!: Page
    const browser = await next.browser('/en', {
      async beforePageLoad(p: Page) {
        page = p
      },
    })
    const act = createRouterAct(page)

    expect(await browser.elementById('layout-locale').text()).toBe('en')
    expect(await browser.elementById('page-locale').text()).toBe('en')

    await act(async () => {
      const toggle = await browser.elementByCss(
        'input[data-link-accordion="/de"]'
      )
      await toggle.click()
      const link = await browser.elementByCss('a[href="/de"]')
      await link.click()
    })

    // Both segments read the locale through `next/root-params`. Before the
    // fix the page segment was cached under a key that generalized over the
    // root param, so this navigation rendered the `en` copy while the layout
    // above it correctly said `de`.
    expect(await browser.elementById('layout-locale').text()).toBe('de')
    expect(await browser.elementById('page-locale').text()).toBe('de')
  })
})
