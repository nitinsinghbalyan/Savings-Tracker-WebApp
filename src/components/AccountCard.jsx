import { formatMoney } from '../lib/format'
import { getColorPalette } from '../lib/constants'
import BankIcon from './icons/banks/BankIcon'

export default function AccountCard({ account, onClick }) {
  const palette = getColorPalette(account.color)
  const balance = Number(account.balance ?? account.opening_balance ?? 0)
  const balanceClass = balance < 0 ? 'text-rose-600' : 'text-slate-900'
  const hasBankIcon = account.bank && account.bank !== 'other'

  const inner = (
    <>
      {hasBankIcon ? (
        <BankIcon bank={account.bank} className="h-8 w-8 shrink-0" />
      ) : (
        <span
          className={`h-10 w-1 shrink-0 rounded-full ${palette.swatch}`}
          aria-hidden="true"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900">{account.name}</p>
      </div>
      <span className={`shrink-0 text-sm font-semibold ${balanceClass}`}>
        {formatMoney(balance, account.currency)}
      </span>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(account)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50"
      >
        {inner}
      </button>
    )
  }

  return <div className="flex items-center gap-3 px-4 py-3.5">{inner}</div>
}
