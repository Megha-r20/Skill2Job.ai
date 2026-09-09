export default function Loading() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center" aria-busy="true" aria-live="polite">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
        <p className="text-sm font-medium text-slate-500">Loading your workspace...</p>
      </div>
    </div>
  );
}
