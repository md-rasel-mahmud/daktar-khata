import * as React from "react"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect x="1" y="1" width="30" height="30" rx="8" fill="currentColor" />
      <path
        d="M13 9h6v4h4v6h-4v4h-6v-4H9v-6h4V9Z"
        fill="var(--background)"
      />
    </svg>
  )
}