import SegmentedTabs from './SegmentedTabs'

// Paper-and-ink header from artboard 1e: the title sits on the sunk paper
// with the segmented tabs directly beneath it. On desktop the sidebar still
// carries navigation, so the header keeps a card ground and a hairline rule.
export default function PageHeader({ title, subtitle, children }) {
  return (
    <header className="safe-top sticky top-0 z-40 bg-paper-sunk lg:border-b lg:border-ink-rule lg:bg-paper-card">
      <div className="mx-auto max-w-content px-[18px] pb-3 pt-3.5 lg:px-8 lg:py-4">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate font-display text-[21px] font-semibold tracking-[-0.02em] text-ink lg:text-2xl">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-xs text-ink-soft lg:text-sm" title={subtitle}>
                {subtitle}
              </p>
            )}
          </div>
          {children && (
            <div className="flex shrink-0 items-center gap-2">{children}</div>
          )}
        </div>
        <SegmentedTabs />
      </div>
    </header>
  )
}
