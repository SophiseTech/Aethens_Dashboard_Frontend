import React from 'react'

function Book({ className, bold = false }) {
  return (
    <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M20.4923 15.6922H6.46154C4.83017 15.6922 3.50769 17.0147 3.50769 18.6461M20.4923 15.6922V20.123C20.4923 20.9387 19.8311 21.5999 19.0154 21.5999H6.46154C4.83017 21.5999 3.50769 20.2774 3.50769 18.6461M20.4923 15.6922V3.87683C20.4923 3.06114 19.8311 2.3999 19.0154 2.3999H8.30769M3.50769 18.6461V5.35375C3.50769 3.72238 4.83017 2.3999 6.46154 2.3999H8.30769M12.0574 6.83067H16.1077M12.0574 11.2614H16.1077M8.30769 15.5999V2.3999"
      stroke="black"
      strokeWidth={bold ? "3" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>

  )
}

export default Book