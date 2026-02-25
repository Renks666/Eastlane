"use client"

import { useEffect, useState } from "react"
import { ExchangeRateTooltip } from "@/components/store/ExchangeRateTooltip"

type ProductPriceWithTooltipProps = {
  primaryPrice: string
  secondaryPrice: string | null
  rateText: string | null
}

export function ProductPriceWithTooltip({ primaryPrice, secondaryPrice, rateText }: ProductPriceWithTooltipProps) {
  const [canHover, setCanHover] = useState(false)
  const [isRateDetailsOpen, setIsRateDetailsOpen] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)")
    const sync = () => {
      const supportsHover = media.matches
      setCanHover(supportsHover)
      setIsRateDetailsOpen(false)
    }

    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  const hasRateDetails = secondaryPrice !== null && rateText !== null

  const handleLineClick = () => {
    if (!hasRateDetails) return
    if (canHover) {
      setIsRateDetailsOpen(true)
      return
    }
    setIsRateDetailsOpen((prev) => !prev)
  }

  const handleMouseEnter = () => {
    if (!hasRateDetails || !canHover) return
    setIsRateDetailsOpen(true)
  }

  const handleMouseLeave = () => {
    if (!canHover) return
    setIsRateDetailsOpen(false)
  }

  return (
    <div className="mt-4">
      <p className="font-price tabular-nums text-3xl font-semibold text-black">{primaryPrice}</p>
      {hasRateDetails ? (
        <ExchangeRateTooltip isOpen={isRateDetailsOpen} rateText={rateText} align="left">
          {({ describedBy }) => (
            <button
              type="button"
              onClick={handleLineClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocus={() => setIsRateDetailsOpen(true)}
              onBlur={() => setIsRateDetailsOpen(false)}
              className={`mt-1 text-left text-base text-[color:var(--color-text-secondary)] transition-opacity ${canHover ? "cursor-pointer hover:opacity-85" : ""}`}
              aria-expanded={isRateDetailsOpen}
              aria-describedby={describedBy}
            >
              <span className="font-price tabular-nums block">{secondaryPrice}</span>
            </button>
          )}
        </ExchangeRateTooltip>
      ) : null}
    </div>
  )
}
