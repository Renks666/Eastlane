"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { updateOrderStatus } from "@/app/admin/orders/actions"
import type { OrderStatus } from "@/src/domains/order/types"
import { cn } from "@/lib/utils"

type OrderStatusSelectProps = {
  orderId: number
  status: OrderStatus
  className?: string
}

const options: Array<{ value: OrderStatus; label: string }> = [
  { value: "new", label: "Новый" },
  { value: "confirmed", label: "Подтверждён" },
  { value: "processing", label: "В работе" },
  { value: "done", label: "Выполнен" },
  { value: "cancelled", label: "Отменён" },
]

export function OrderStatusSelect({ orderId, status, className }: OrderStatusSelectProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      className={cn(
        "h-9 rounded-md border border-border bg-background px-2 text-sm shadow-sm outline-none ring-0 focus:border-primary",
        className
      )}
      onChange={(event) => {
        const nextStatus = event.target.value as OrderStatus
        startTransition(async () => {
          const result = await updateOrderStatus(orderId, nextStatus)
          if (!result.ok) {
            toast.error(result.error ?? "Не удалось обновить статус.")
            return
          }
          toast.success("Статус обновлён.")
        })
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
