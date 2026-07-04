export default function IciciIcon({ className = 'h-6 w-6', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="3" fill="#F58220" />
      <text
        x="12"
        y="15"
        textAnchor="middle"
        fill="white"
        fontSize="7"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        ICICI
      </text>
    </svg>
  )
}
