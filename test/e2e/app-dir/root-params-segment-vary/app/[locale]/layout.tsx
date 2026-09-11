'use cache'

import { locale as getLocale } from 'next/root-params'
import { LinkAccordion } from '../../components/link-accordion'

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'de' }]
}

export default async function LocaleLayout({
  children,
}: LayoutProps<'/[locale]'>) {
  const locale = await getLocale()

  return (
    <html lang={locale}>
      <body>
        <p id="layout-locale">{locale}</p>
        {/* `prefetch={false}` is load-bearing: an eager prefetch fills the
            destination's key before the navigation reads the cache, which
            hides the bug. */}
        <LinkAccordion href="/en" prefetch={false}>
          en
        </LinkAccordion>
        <LinkAccordion href="/de" prefetch={false}>
          de
        </LinkAccordion>
        {children}
      </body>
    </html>
  )
}
