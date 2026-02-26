import Link from "next/link"
import { StoreShell } from "@/components/store/StoreShell"
import { getStorefrontContent } from "@/src/domains/content/services/storefront-content-service"

export default async function ContactsPage() {
  const { contacts } = await getStorefrontContent()

  return (
    <StoreShell>
      <section className="store-section max-w-4xl pb-16 pt-10 md:pt-12">
        <div className="store-card p-6 md:p-8">
          <p className="store-eyebrow">Контакты</p>
          <h1 className="mt-2.5 text-3xl font-semibold text-[color:var(--color-brand-forest-light)] md:text-4xl">{contacts.title}</h1>
          <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">{contacts.subtitle}</p>

          <div className="mt-6 grid gap-2.5 text-sm md:text-base">
            <p className="text-[color:var(--color-text-secondary)]">Телефон: <span className="font-medium text-[color:var(--color-brand-forest-light)]">{contacts.phone}</span></p>
            <p className="text-[color:var(--color-text-secondary)]">Email: <span className="font-medium text-[color:var(--color-brand-forest-light)]">{contacts.email}</span></p>
            <p className="text-[color:var(--color-text-secondary)]">Режим работы: <span className="font-medium text-[color:var(--color-brand-forest-light)]">{contacts.hours}</span></p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={contacts.instagramUrl} target="_blank" className="store-focus rounded-full bg-[color:var(--color-brand-forest-light)] px-4 py-2 text-sm font-medium text-white">Instagram</Link>
            <Link href={contacts.telegramUrl} target="_blank" className="store-focus rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-4 py-2 text-sm font-medium text-[color:var(--color-brand-forest-light)]">Telegram</Link>
            <Link href={contacts.whatsappUrl} target="_blank" className="store-focus rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-4 py-2 text-sm font-medium text-[color:var(--color-brand-forest-light)]">WhatsApp</Link>
          </div>
        </div>
      </section>
    </StoreShell>
  )
}
