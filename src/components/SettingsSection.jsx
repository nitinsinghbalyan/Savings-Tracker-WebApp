// Artboard 1f: settings read as a plain list on the paper, with a hairline
// rule opening each group — not cards nested inside cards.
export default function SettingsSection({ title, action, children, className = '' }) {
  return (
    <section className={className}>
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <h2 className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
          {title}
        </h2>
        {action}
      </div>
      <div className="border-t border-ink-rule">{children}</div>
    </section>
  )
}
