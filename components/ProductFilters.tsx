'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface FiltersProps {
  categories: { id: number; name: string; slug: string }[]
  allSizes: string[]
  allColors: string[]
  minPrice: number
  maxPrice: number
}

export function ProductFilters({
  categories,
  allSizes,
  allColors,
  minPrice,
  maxPrice
}: FiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Читаем текущие фильтры из URL
  const currentCategory = searchParams.get('category') || 'all'
  const currentSizes = searchParams.getAll('size')
  const currentColors = searchParams.getAll('color')
  const currentMinPrice = searchParams.get('minPrice') || String(minPrice)
  const currentMaxPrice = searchParams.get('maxPrice') || String(maxPrice)

  // Состояния для формы
  const [category, setCategory] = useState(currentCategory)
  const [selectedSizes, setSelectedSizes] = useState<string[]>(currentSizes)
  const [selectedColors, setSelectedColors] = useState<string[]>(currentColors)
  const [minPriceValue, setMinPriceValue] = useState(currentMinPrice)
  const [maxPriceValue, setMaxPriceValue] = useState(currentMaxPrice)

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (category && category !== 'all') params.set('category', category)
    selectedSizes.forEach((size) => params.append('size', size))
    selectedColors.forEach((color) => params.append('color', color))
    if (minPriceValue) params.set('minPrice', minPriceValue)
    if (maxPriceValue) params.set('maxPrice', maxPriceValue)

    router.push(`/?${params.toString()}`) // если каталог на главной
  }

  const resetFilters = () => {
    setCategory('all')
    setSelectedSizes([])
    setSelectedColors([])
    setMinPriceValue(String(minPrice))
    setMaxPriceValue(String(maxPrice))
    router.push('/')
  }

  const handleSizeChange = (size: string, checked: boolean) => {
    setSelectedSizes((prev) =>
      checked ? [...prev, size] : prev.filter((s) => s !== size)
    )
  }

  const handleColorChange = (color: string, checked: boolean) => {
    setSelectedColors((prev) =>
      checked ? [...prev, color] : prev.filter((c) => c !== color)
    )
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-medium">Фильтры</h3>

      {/* Категория */}
      <div>
        <Label>Категория</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Все категории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Размеры */}
      {allSizes.length > 0 && (
        <div>
          <Label>Размеры</Label>
          <div className="space-y-1 mt-1">
            {allSizes.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size}`}
                  checked={selectedSizes.includes(size)}
                  onCheckedChange={(checked) =>
                    handleSizeChange(size, checked as boolean)
                  }
                />
                <Label htmlFor={`size-${size}`} className="text-sm">
                  {size}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Цвета */}
      {allColors.length > 0 && (
        <div>
          <Label>Цвета</Label>
          <div className="space-y-1 mt-1">
            {allColors.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={`color-${color}`}
                  checked={selectedColors.includes(color)}
                  onCheckedChange={(checked) =>
                    handleColorChange(color, checked as boolean)
                  }
                />
                <Label htmlFor={`color-${color}`} className="text-sm">
                  {color}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Цена */}
      <div>
        <Label>Цена, ₽</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="number"
            placeholder={`от ${minPrice}`}
            value={minPriceValue}
            onChange={(e) => setMinPriceValue(e.target.value)}
          />
          <Input
            type="number"
            placeholder={`до ${maxPrice}`}
            value={maxPriceValue}
            onChange={(e) => setMaxPriceValue(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={applyFilters} className="flex-1">
          Применить
        </Button>
        <Button onClick={resetFilters} variant="outline" className="flex-1">
          Сбросить
        </Button>
      </div>
    </div>
  )
}