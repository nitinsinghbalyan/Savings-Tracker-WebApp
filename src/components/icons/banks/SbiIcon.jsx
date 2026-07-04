export default function SbiIcon({ className = 'h-6 w-6', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" fill="#22409A" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="white" strokeWidth="1.5" />
      <text
        x="12"
        y="14.5"
        textAnchor="middle"
        fill="white"
        fontSize="5.5"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        SBI
      </text>
    </svg>
  )
}
