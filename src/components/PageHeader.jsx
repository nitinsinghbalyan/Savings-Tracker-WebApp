export default function PageHeader({ title, subtitle, children }) {
  return (
    <header className="safe-top sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-content items-center justify-between gap-3 px-4 py-3 lg:px-8 lg:py-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-900 lg:text-2xl">{title}</h1>
          {subtitle && (
            <p className="truncate text-xs text-slate-500 lg:text-sm" title={subtitle}>
              {subtitle}
            </p>
          )}
        </div>
        {children && (
          <div className="flex shrink-0 items-center gap-2">{children}</div>
        )}
      </div>
    </header>
  )
}
