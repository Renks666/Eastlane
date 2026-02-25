import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ProductCardProps {
  id: number
  name: string
  price: number
  category: string
  sizes: string[]
  colors: string[]
  image?: string
}

export function ProductCard({
  name,
  price,
  category,
  sizes,
  colors,
  image
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
        {image ? (
          <Image src={image} alt={name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain" />
        ) : (
          <span className="text-gray-400">Нет фото</span>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-gray-600">{category}</p>
        <p className="font-price tabular-nums text-lg font-semibold mt-1 text-black">{Math.round(price)} ₽</p>
        <div className="mt-2 text-xs text-gray-500">
          {colors.length > 0 && <span>Цвета: {colors.join(', ')}</span>}
          {sizes.length > 0 && <span className="block">Размеры: {sizes.join(', ')}</span>}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" variant="outline">
          В корзину
        </Button>
      </CardFooter>
    </Card>
  )
}
