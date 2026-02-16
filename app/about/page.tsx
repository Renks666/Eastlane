import { StoreShell } from "@/components/store/StoreShell"
import { getStorefrontContent } from "@/src/domains/content/services/storefront-content-service"

export default async function AboutPage() {
  const { about } = await getStorefrontContent()

  return (
    <StoreShell>
      <section className="mx-auto max-w-4xl px-4 pb-14 pt-10 md:px-8">
        <div className="rounded-3xl border border-[#d8cfb7] bg-white/90 p-7 md:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8b7a55]">{about.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold text-[#0f2d25]">{about.title}</h1>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-base leading-relaxed text-[#355448]">
              {paragraph}
            </p>
          ))}
        </div>
      </section>
    </StoreShell>
  )
}

