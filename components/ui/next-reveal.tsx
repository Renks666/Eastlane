"use client"

import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

type FlipTextProps = {
  word?: string
  className?: string
}

export default function FlipTextReveal({ word = "EASTLANE", className }: FlipTextProps) {
  return (
    <div className={cn("flip-container", className)}>
      <div className="text-wrapper">
        <h2 className="title" aria-label={word}>
          {word.split("").map((char, i) => (
            <span
              key={`${i}-${char}`}
              className="char"
              style={{ ["--index" as string]: i } as CSSProperties}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h2>
      </div>

      <style jsx>{`
        .flip-container {
          --bg-color: var(--color-bg-accent);
          --text-color: var(--color-brand-forest-light);
          --btn-border: var(--color-border-primary);

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.4rem 1.4rem;
          background: linear-gradient(135deg, var(--bg-color), var(--color-bg-primary));
          border-radius: 14px;
          overflow: hidden;
          width: 100%;
          box-shadow: 0 14px 32px -24px rgba(15, 63, 51, 0.55);
          perspective: 800px;
        }

        .title {
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          line-height: 0.95;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          font-size: clamp(1.9rem, 5vw, 3.6rem);
          font-weight: 900;
          color: var(--text-color);
          transform-style: preserve-3d;
        }

        .char {
          display: inline-block;
          transform-origin: bottom center;
          opacity: 0;
          transform: rotateX(-90deg) translateY(16px);
          animation: flip-up 0.72s cubic-bezier(0.175, 0.885, 0.32, 1.18) forwards;
          animation-delay: calc(0.052s * var(--index));
          will-change: transform, opacity;
        }

        @keyframes flip-up {
          0% {
            opacity: 0;
            transform: rotateX(-90deg) translateY(24px);
          }
          100% {
            opacity: 1;
            transform: rotateX(0deg) translateY(0);
          }
        }

        @media (max-width: 768px) {
          .flip-container {
            padding: 1.1rem 1rem;
          }
          .title {
            font-size: clamp(1.6rem, 8vw, 2.4rem);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .char {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
