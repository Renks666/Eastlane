"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type HeroShutterTextProps = {
  text?: string
  className?: string
}

export default function HeroShutterText({
  text = "EASTLANE",
  className,
}: HeroShutterTextProps) {
  const characters = text.split("")

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--color-border-primary)] bg-gradient-to-br from-[color:var(--color-bg-accent)] to-[color:var(--color-bg-primary)] px-3 py-5",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-text-accent) 1px, transparent 1px), linear-gradient(to bottom, var(--color-text-accent) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <motion.div className="relative z-10 flex flex-wrap items-center justify-center">
        {characters.map((char, i) => (
          <div key={`${char}-${i}`} className="relative overflow-hidden px-[0.08em]">
            <motion.span
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: i * 0.045 + 0.24, duration: 0.72 }}
              className="select-none text-[clamp(2rem,8vw,4.8rem)] font-black uppercase leading-none tracking-[-0.04em] text-[color:var(--color-brand-forest-light)]"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>

            <motion.span
              initial={{ x: "-120%", opacity: 0 }}
              animate={{ x: "120%", opacity: [0, 1, 0] }}
              transition={{ duration: 0.62, delay: i * 0.045, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-0 select-none text-[clamp(2rem,8vw,4.8rem)] font-black uppercase leading-none tracking-[-0.04em] text-[color:var(--color-brand-beige-dark)]"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 35%)" }}
            >
              {char}
            </motion.span>

            <motion.span
              initial={{ x: "120%", opacity: 0 }}
              animate={{ x: "-120%", opacity: [0, 1, 0] }}
              transition={{ duration: 0.62, delay: i * 0.045 + 0.08, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-0 select-none text-[clamp(2rem,8vw,4.8rem)] font-black uppercase leading-none tracking-[-0.04em] text-[color:var(--color-brand-forest-light)]"
              style={{ clipPath: "polygon(0 35%, 100% 35%, 100% 65%, 0 65%)" }}
            >
              {char}
            </motion.span>

            <motion.span
              initial={{ x: "-120%", opacity: 0 }}
              animate={{ x: "120%", opacity: [0, 1, 0] }}
              transition={{ duration: 0.62, delay: i * 0.045 + 0.16, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-0 select-none text-[clamp(2rem,8vw,4.8rem)] font-black uppercase leading-none tracking-[-0.04em] text-[color:var(--color-brand-beige-dark)]"
              style={{ clipPath: "polygon(0 65%, 100% 65%, 100% 100%, 0 100%)" }}
            >
              {char}
            </motion.span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

