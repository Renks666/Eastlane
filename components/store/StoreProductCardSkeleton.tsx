import { Skeleton } from "@/components/ui/skeleton"

export function StoreProductCardSkeleton() {
  return (
    <article className="rounded-2xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/95 p-3">
      <Skeleton className="aspect-[4/5] w-full rounded-xl" />
      <div className="mt-2.5 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-full" />
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </article>
  )
}
