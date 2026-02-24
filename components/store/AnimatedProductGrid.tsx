"use client"

import { motion } from "framer-motion"
import { StoreProductCard } from "./StoreProductCard"

type Product = {
  id: number
  name: string
  price: number
  priceCurrency: "RUB" | "CNY"
  images?: string[] | null
  sizes?: string[] | null
  colors?: string[] | null
  categoryName?: string | null
  brandName?: string | null
}

type AnimatedProductGridProps = {
  products: Product[]
  cnyPerRub: number
}

export function AnimatedProductGrid({ products, cnyPerRub }: AnimatedProductGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <StoreProductCard product={product} cnyPerRub={cnyPerRub} />
        </motion.div>
      ))}
    </div>
  )
}
