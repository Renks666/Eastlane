import { StoreShell } from "@/components/store/StoreShell"
import { getStorefrontContent } from "@/src/domains/content/services/storefront-content-service"

export default async function AboutPage() {
  const { about } = await getStorefrontContent()

  return (
    <StoreShell>
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-16 md:px-12">
        <div className="rounded-3xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/90 p-7 md:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-accent)]">{about.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold text-[color:var(--color-brand-forest-light)]">{about.title}</h1>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-base leading-relaxed text-[color:var(--color-text-secondary)]">
              {paragraph}
            </p>
          ))}
        </div>
      </section>
    </StoreShell>
  )
}

