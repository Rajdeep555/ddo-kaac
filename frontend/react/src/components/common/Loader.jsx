const Loader = ({ type = "spinner", rows = 5, className = "" }) => {
  if (type === "page") {
    return (
      <div
        className={`flex min-h-[400px] items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (type === "spinner") {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (type === "card") {
    return (
      <div
        className={`animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="h-8 w-32 rounded bg-slate-200" />
          </div>

          <div className="h-11 w-11 rounded-xl bg-slate-200" />
        </div>

        <div className="mt-5 h-3 w-24 rounded bg-slate-200" />
      </div>
    );
  }

  if (type === "chart") {
    return (
      <div
        className={`animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
        <div className="mb-6 h-5 w-40 rounded bg-slate-200" />

        <div className="flex h-64 items-end gap-3">
          <div className="h-24 flex-1 rounded bg-slate-200" />
          <div className="h-40 flex-1 rounded bg-slate-200" />
          <div className="h-32 flex-1 rounded bg-slate-200" />
          <div className="h-52 flex-1 rounded bg-slate-200" />
          <div className="h-36 flex-1 rounded bg-slate-200" />
          <div className="h-48 flex-1 rounded bg-slate-200" />
          <div className="h-28 flex-1 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className={`animate-pulse space-y-3 ${className}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex gap-4 rounded-lg border border-slate-100 p-4">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="h-4 flex-1 rounded bg-slate-200" />
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-4 w-20 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default Loader;
