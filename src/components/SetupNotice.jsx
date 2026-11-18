/** Shown instead of a blank page when the Supabase env vars are missing. */
export default function SetupNotice() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24">
      <h1 className="mb-4 text-3xl font-semibold">Dogear isn't configured yet</h1>
      <p className="text-muted">
        Copy <code>.env.example</code> to <code>.env.local</code>, fill in your Supabase project URL and
        publishable key, then restart the dev server.
      </p>
    </main>
  )
}
