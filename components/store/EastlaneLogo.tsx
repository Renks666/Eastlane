"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

type EastlaneLogoProps = {
  compact?: boolean
  className?: string
}

export function EastlaneLogo({
  compact = false,
  className,
}: EastlaneLogoProps) {
  const pathname = usePathname()
  const letters = "EASTLANE".split("")

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <Link
      href="/"
      onClick={handleClick}
      className={cn(
        "logo-link inline-flex items-center cursor-pointer",
        compact ? "gap-2 sm:gap-3" : "gap-3 sm:gap-4",
        className
      )}
    >
      <span
        aria-label="EASTLANE"
        className={cn(
          "logo-animated font-semibold leading-none text-[color:var(--color-text-primary)]",
          compact
            ? "text-base tracking-[0.24em] sm:text-lg lg:text-xl"
            : "text-2xl tracking-[0.28em] sm:text-3xl lg:text-4xl"
        )}
      >
        {letters.map((letter, i) => (
          <span
            key={`${letter}-${i}`}
            className="logo-char"
            style={{ ["--index" as string]: i } as CSSProperties}
          >
            {letter}
          </span>
        ))}
      </span>
    </Link>
  )
}
