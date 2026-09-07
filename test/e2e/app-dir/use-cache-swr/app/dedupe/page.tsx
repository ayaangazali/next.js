import { cacheLife } from 'next/cache'
import { connection } from 'next/server'
import { setTimeout } from 'timers/promises'

async function getDedupeData(id: string) {
  'use cache'

  cacheLife('seconds')

  // Long enough that further requests arrive while the regeneration this
  // triggers is still running.
  await setTimeout(1000)

  return new Date().toISOString()
}

export default async function Page() {
  await connection()

  return <p id="data">{await getDedupeData('dedupe')}</p>
}
