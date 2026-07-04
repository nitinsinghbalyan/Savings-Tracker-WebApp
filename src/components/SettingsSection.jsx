export default function SettingsSection({ title, action, children, className = '' }) {
  return (
    <section className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
        {action}
      </div>
      <div className="card divide-y divide-slate-100 p-0">{children}</div>
    </section>
  )
}
