export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[1100px] px-5 pb-32 pt-6 lg:pl-[300px]" aria-busy="true" aria-label="Chargement">
      <div className="mb-4 h-10 w-48 animate-pulse rounded-2xl bg-[#ECE7FA]" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="carte mb-3 flex items-center gap-3 p-3">
          <span className="h-16 w-16 animate-pulse rounded-[18px] bg-[#ECE7FA]" />
          <span className="flex-1">
            <span className="block h-3.5 w-2/3 animate-pulse rounded-full bg-[#ECE7FA]" />
            <span className="mt-2.5 block h-2.5 w-1/2 animate-pulse rounded-full bg-[#F2EFFB]" />
          </span>
        </div>
      ))}
    </main>
  );
}
