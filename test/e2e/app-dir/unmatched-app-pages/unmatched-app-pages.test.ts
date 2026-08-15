import { nextTestSetup } from 'e2e-utils'
import { retry } from 'next-test-utils'
import stripAnsi from 'strip-ansi'

describe('unmatched-app-pages', () => {
  const { next, isNextDev, skipped } = nextTestSetup({
    files: __dirname,
    skipStart: true,
    skipDeployment: true,
  })

  if (skipped) return

  it('reports every page excluded from all complete routes', async () => {
    if (isNextDev) {
      await next.start()
      await next.fetch('/disagreeing-slots/foo')
    } else {
      const { exitCode } = await next.build()
      expect(exitCode).toBe(1)
    }

    await retry(() => {
      const output = stripAnsi(next.cliOutput)
      expect(output).toContain('match any complete route')
      expect(output).toContain('app/disagreeing-slots/@first/foo/page.tsx')
      expect(output).toContain('app/disagreeing-slots/@second/bar/page.tsx')
      expect(output).toContain('app/disagreeing-slots/[...slug]/page.tsx')
      expect(output).toContain('app/optional-catchall/[[...slug]]/page.tsx')
      expect(output).toContain('app/(pruning-group)/grouped/[...slug]/page.tsx')
      expect(output).toContain('app/nested-parallel/@outer/[...slug]/page.tsx')
      expect(output).toContain('app/nested-parallel/[...slug]/page.tsx')
      expect(output).not.toContain('app/optional-catchall/specific/page.tsx')
      expect(output).not.toContain(
        'app/(pruning-group)/grouped/specific/page.tsx'
      )
      expect(output).not.toContain(
        'app/nested-parallel/@outer/@inner/specific/page.tsx'
      )
    })
  })
})
