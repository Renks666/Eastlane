"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteAttributeOption } from "@/app/admin/attributes/actions"
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

type AttributeDeleteButtonProps = {
  attributeId: number
  kind: "size" | "color"
  value: string
  valueNormalized: string
  className?: string
}

export function AttributeDeleteButton({
  attributeId,
  kind,
  value,
  valueNormalized,
  className,
}: AttributeDeleteButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("id", String(attributeId))
      formData.set("kind", kind)
      formData.set("valueNormalized", valueNormalized)

      try {
        await deleteAttributeOption(formData)
        toast.success("Значение удалено.")
        setOpen(false)
        router.refresh()
      } catch (error) {
        const message = error instanceof Error ? error.message : "Не удалось удалить значение."
        toast.error(message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive" size="sm" className={className}>
          Удалить
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить значение?</DialogTitle>
          <DialogDescription>
            Будет удалено значение <strong>{value}</strong>. Если оно используется в товарах, удаление будет
            заблокировано.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Отмена
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Удаление..." : "Удалить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
