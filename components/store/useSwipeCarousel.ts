"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import type { EmblaOptionsType } from "embla-carousel"

type UseSwipeCarouselParams = {
  slideCount: number
  loop?: boolean
  canDrag?: boolean
}

export function useSwipeCarousel({ slideCount, loop = true, canDrag = true }: UseSwipeCarouselParams) {
  const options = useMemo<EmblaOptionsType>(
    () => ({
      loop: slideCount > 1 ? loop : false,
      watchDrag: slideCount > 1 ? canDrag : false,
    }),
    [canDrag, loop, slideCount]
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(options)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const frame = window.requestAnimationFrame(onSelect)
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)

    return () => {
      window.cancelAnimationFrame(frame)
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback(
    (index: number, jump = false) => {
      if (!emblaApi) return
      if (index < 0 || index >= slideCount) return
      emblaApi.scrollTo(index, jump)
    },
    [emblaApi, slideCount]
  )

  return {
    emblaRef,
    emblaApi,
    selectedIndex,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    scrollTo,
  }
}
