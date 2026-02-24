"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteBrand } from "@/app/admin/brands/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type BrandDeleteButtonProps = {
  brandId: number
  brandName: string
  className?: string
}

export function BrandDeleteButton({ brandId, brandName, className }: BrandDeleteButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteBrand(brandId)
      if (!result.ok) {
        toast.error(result.error ?? "Не удалось удалить бренд.")
        return
      }

      toast.success("Бренд удален.")
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className={className}>
          Удалить
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить бренд?</DialogTitle>
          <DialogDescription>
            Будет удален бренд <strong>{brandName}</strong>. Если он используется товарами, удаление будет заблокировано.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Удаление..." : "Удалить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
