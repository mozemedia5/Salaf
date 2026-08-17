export function NotFoundView() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-16 text-center" aria-labelledby="not-found-title">
      <section className="max-w-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">404</p>
        <h1 id="not-found-title" className="mt-3 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Page not found
        </h1>
        <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
          The address you opened does not match a public Salaf resource.
        </p>
        <a
          href="/"
          className="inline-flex mt-6 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          Return home
        </a>
      </section>
    </main>
  );
}
