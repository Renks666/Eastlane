"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { updateOrderStatus, type OrderStatus } from "@/app/admin/orders/actions"

type OrderStatusSelectProps = {
  orderId: number
  status: OrderStatus
}

const options: Array<{ value: OrderStatus; label: string }> = [
  { value: "new", label: "Новый" },
  { value: "confirmed", label: "Подтвержден" },
  { value: "processing", label: "В работе" },
  { value: "done", label: "Завершен" },
  { value: "cancelled", label: "Отменен" },
]

export function OrderStatusSelect({ orderId, status }: OrderStatusSelectProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
      onChange={(event) => {
        const nextStatus = event.target.value as OrderStatus
        startTransition(async () => {
          const result = await updateOrderStatus(orderId, nextStatus)
          if (!result.ok) {
            toast.error(result.error ?? "Не удалось обновить статус.")
            return
          }
          toast.success("Статус обновлен.")
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
