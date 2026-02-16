import Link from "next/link"
import { StoreShell } from "@/components/store/StoreShell"
import { getStorefrontContent } from "@/src/domains/content/services/storefront-content-service"

export default async function ContactsPage() {
  const { contacts, faq } = await getStorefrontContent()

  return (
    <StoreShell>
      <section className="mx-auto max-w-4xl px-4 pb-14 pt-10 md:px-8">
        <div className="rounded-3xl border border-[#d8cfb7] bg-white/90 p-7 md:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8b7a55]">Контакты</p>
          <h1 className="mt-3 text-4xl font-semibold text-[#0f2d25]">{contacts.title}</h1>
          <p className="mt-3 text-sm text-[#5f6e65]">{contacts.subtitle}</p>

          <div className="mt-8 grid gap-3 text-sm md:text-base">
            <p className="text-[#355448]">Телефон: <span className="font-medium text-[#0f2d25]">{contacts.phone}</span></p>
            <p className="text-[#355448]">Email: <span className="font-medium text-[#0f2d25]">{contacts.email}</span></p>
            <p className="text-[#355448]">Режим работы: <span className="font-medium text-[#0f2d25]">{contacts.hours}</span></p>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link href={contacts.instagramUrl} target="_blank" className="rounded-full bg-[#0f3f33] px-4 py-2 text-sm font-medium text-[#f4edd9]">Instagram</Link>
            <Link href={contacts.telegramUrl} target="_blank" className="rounded-full border border-[#d8cfb7] bg-white px-4 py-2 text-sm font-medium text-[#2f4b3f]">Telegram</Link>
            <Link href={contacts.whatsappUrl} target="_blank" className="rounded-full border border-[#d8cfb7] bg-white px-4 py-2 text-sm font-medium text-[#2f4b3f]">WhatsApp</Link>
          </div>

          <div className="mt-8 rounded-xl border border-[#e4dcc6] bg-[#faf8f2] p-4">
            <p className="font-medium text-[#0f3f33]">{faq.title}</p>
            <ul className="mt-3 space-y-3 text-sm text-[#355448]">
              {faq.items.map((item) => (
                <li key={item.question}>
                  <p className="font-medium text-[#0f2d25]">{item.question}</p>
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

