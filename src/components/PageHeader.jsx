import SegmentedTabs from './SegmentedTabs'

// Paper-and-ink header from artboard 1e. Below `lg` the title and the tab nav
// are ONE row (session 90): the active tab is the visible title, the page's
// actions sit on the right, and the real <h1> stays for screen readers. On
// desktop the sidebar carries navigation, so the header shows the title and
// subtitle on a card ground with a hairline rule.
export default function PageHeader({ title, subtitle, children }) {
  return (
    <header className="safe-top sticky top-0 z-40 bg-paper-sunk lg:border-b lg:border-ink-rule lg:bg-paper-card">
      <div className="mx-auto flex max-w-content items-end justify-between gap-3 px-[18px] pb-1.5 pt-1.5 lg:items-baseline lg:px-8 lg:py-4">
        <SegmentedTabs />
        <div className="sr-only min-w-0 lg:not-sr-only">
          <h1 className="truncate font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-sm text-ink-soft" title={subtitle}>
              {subtitle}
            </p>
          )}
        </div>
        {children && (
          <div className="flex shrink-0 items-center gap-2 pb-0.5 lg:pb-0">{children}</div>
        )}
      </div>
    </header>
  )
}
