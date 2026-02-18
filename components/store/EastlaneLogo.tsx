import Link from "next/link"
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
  const letters = "EASTLANE".split("")

  return (
    <Link
      href="/"
      className={cn(
        "logo-link inline-flex items-center",
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
