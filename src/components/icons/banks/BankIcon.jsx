import HdfcIcon from './HdfcIcon'
import IciciIcon from './IciciIcon'
import SbiIcon from './SbiIcon'
import AxisIcon from './AxisIcon'

const ICONS = {
  icici: IciciIcon,
  sbi: SbiIcon,
  hdfc: HdfcIcon,
  axis: AxisIcon,
}

export default function BankIcon({ bank, className = 'h-6 w-6', ...props }) {
  if (!bank || bank === 'other') return null
  const Icon = ICONS[bank]
  if (!Icon) return null
  return <Icon className={className} {...props} />
}
