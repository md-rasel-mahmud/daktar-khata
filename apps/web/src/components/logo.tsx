import * as React from "react"
import Image from "next/image"

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 24, className }: LogoProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
      <Image
        src="/logo.png"
        alt="Daktar Khata Logo"
        fill
        style={{ objectFit: 'contain' }}
        priority
      />
    </div>
  )
}