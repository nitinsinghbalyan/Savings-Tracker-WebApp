import { formatMoney } from '../../lib/format'

// SettingsRow renders its `value` as a sub-line under the label, so it cannot
// carry a right-aligned amount. This borrows its hairline row metrics and adds
// the trailing figure a ledger needs.
export default function HoldingRow({ item, currency, onClick }) {
  const isAuto = item.source === 'account'

  const detail = (() => {
    if (isAuto) return 'From your accounts'
    if (item.quantity !== null && item.quantity !== undefined && item.unitPrice != null) {
      const unit = item.unitLabel ? ` ${item.unitLabel}` : ''
      return `${item.quantity}${unit} × ${formatMoney(item.unitPrice, currency)}`
    }
    return item.note || null
  })()

  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] text-ink">
          {item.name}
          {item.excluded && (
            <span className="ml-2 rounded bg-paper-rail px-1.5 py-0.5 text-[10px] text-ink-faint">
              off target
            </span>
          )}
        </p>
        {detail && <p className="mt-0.5 truncate text-[11.5px] text-ink-faint">{detail}</p>}
      </div>
      <p className="n shrink-0 text-[13.5px] font-medium text-ink">
        {formatMoney(item.value, currency)}
      </p>
    </>
  )

  if (isAuto || !onClick) {
    return (
      <div className="flex items-center gap-3 border-b border-ink-hairline px-0.5 py-[15px]">
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-ink-hairline px-0.5 py-[15px] text-left transition hover:bg-paper-card"
    >
      {content}
    </button>
  )
}
