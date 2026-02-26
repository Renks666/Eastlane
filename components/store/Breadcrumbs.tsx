import Link from "next/link"
import { ChevronRight } from "lucide-react"

type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 md:mb-5">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item.href ? (
              <Link 
                href={item.href} 
                className="store-focus text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-brand-forest-light)]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-[color:var(--color-brand-forest-light)]">{item.label}</span>
            )}
            {index < items.length - 1 && (
              <ChevronRight className="h-4 w-4 text-[color:var(--color-border-primary)]" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
