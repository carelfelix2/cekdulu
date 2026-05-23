export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="h-6 w-40 rounded-full bg-slate-100" />
        <div className="mt-6 h-12 w-3/4 rounded-2xl bg-slate-100" />
        <div className="mt-4 h-4 w-2/3 rounded-full bg-slate-100" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-64 rounded-3xl bg-slate-100" />
          ))}
        </div>
      </div>
    </main>
  );
}
