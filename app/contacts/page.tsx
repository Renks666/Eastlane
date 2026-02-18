import Link from "next/link"
import { StoreShell } from "@/components/store/StoreShell"
import { getStorefrontContent } from "@/src/domains/content/services/storefront-content-service"

export default async function ContactsPage() {
  const { contacts, faq } = await getStorefrontContent()

  return (
    <StoreShell>
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-16 md:px-12">
        <div className="rounded-3xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)]/90 p-7 md:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-accent)]">Контакты</p>
          <h1 className="mt-3 text-4xl font-semibold text-[color:var(--color-brand-forest-light)]">{contacts.title}</h1>
          <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">{contacts.subtitle}</p>

          <div className="mt-8 grid gap-3 text-sm md:text-base">
            <p className="text-[color:var(--color-text-secondary)]">Телефон: <span className="font-medium text-[color:var(--color-brand-forest-light)]">{contacts.phone}</span></p>
            <p className="text-[color:var(--color-text-secondary)]">Email: <span className="font-medium text-[color:var(--color-brand-forest-light)]">{contacts.email}</span></p>
            <p className="text-[color:var(--color-text-secondary)]">Режим работы: <span className="font-medium text-[color:var(--color-brand-forest-light)]">{contacts.hours}</span></p>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link href={contacts.instagramUrl} target="_blank" className="rounded-full bg-[color:var(--color-brand-forest-light)] px-4 py-2 text-sm font-medium text-white">Instagram</Link>
            <Link href={contacts.telegramUrl} target="_blank" className="rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-4 py-2 text-sm font-medium text-[color:var(--color-brand-forest-light)]">Telegram</Link>
            <Link href={contacts.whatsappUrl} target="_blank" className="rounded-full border border-[color:var(--color-border-primary)] bg-[color:var(--color-bg-primary)] px-4 py-2 text-sm font-medium text-[color:var(--color-brand-forest-light)]">WhatsApp</Link>
          </div>

          <div className="mt-8 rounded-xl border border-[color:var(--color-border-secondary)] bg-[color:var(--color-bg-tertiary)] p-4">
            <p className="font-medium text-[color:var(--color-brand-forest-light)]">{faq.title}</p>
            <ul className="mt-3 space-y-3 text-sm text-[color:var(--color-text-secondary)]">
              {faq.items.map((item) => (
                <li key={item.question}>
                  <p className="font-medium text-[color:var(--color-brand-forest-light)]">{item.question}</p>
                  <p>{item.answer}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </StoreShell>
  )
}

