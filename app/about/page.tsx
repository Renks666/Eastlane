import { StoreShell } from "@/components/store/StoreShell"
import { getStorefrontContent } from "@/src/domains/content/services/storefront-content-service"

export default async function AboutPage() {
  const { about } = await getStorefrontContent()

  return (
    <StoreShell>
      <section className="store-section max-w-4xl pb-16 pt-10 md:pt-12">
        <div className="store-card p-6 md:p-8">
          <p className="store-eyebrow">{about.eyebrow}</p>
          <h1 className="mt-2.5 text-3xl font-semibold text-[color:var(--color-brand-forest-light)] md:text-4xl">{about.title}</h1>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3.5 text-base leading-relaxed text-[color:var(--color-text-secondary)]">
              {paragraph}
            </p>
          ))}
        </div>
      </section>
    </StoreShell>
  )
}
