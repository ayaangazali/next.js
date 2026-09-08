export default function ChangelogPage() {
  // A static route. /docs/changelog redirects here with a 308, and its tree
  // has a different shape than the [collection]/[...slug] route the router
  // predicts /docs/changelog from.
  return <h1 id="changelog">Changelog</h1>
}
