'use cache'

import { locale as getLocale } from 'next/root-params'

// Reads the root param only through `next/root-params`, never through
// `params`. A read through `params` lands in the segment's own vary set and
// keys the entry correctly, which is why it works around this bug.
export default async function LocalePage() {
  const locale = await getLocale()

  return <p id="page-locale">{locale}</p>
}
