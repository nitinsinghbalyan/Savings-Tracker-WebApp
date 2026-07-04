export default function HdfcIcon({ className = 'h-6 w-6', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="3" fill="#004C8F" />
      <text
        x="12"
        y="15"
        textAnchor="middle"
        fill="white"
        fontSize="6.5"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        HDFC
      </text>
    </svg>
  )
}
