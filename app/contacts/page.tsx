import Link from "next/link"
import { StoreShell } from "@/components/store/StoreShell"

export default function ContactsPage() {
  return (
    <StoreShell>
      <section className="mx-auto max-w-4xl px-4 pb-14 pt-10 md:px-8">
        <div className="rounded-3xl border border-[#d8cfb7] bg-white/90 p-7 md:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8b7a55]">Контакты</p>
          <h1 className="mt-3 text-4xl font-semibold text-[#0f2d25]">Свяжитесь с EASTLANE</h1>

          <div className="mt-8 grid gap-3 text-sm md:text-base">
            <p className="text-[#355448]">Телефон: <span className="font-medium text-[#0f2d25]">+7 (900) 000-00-00</span></p>
            <p className="text-[#355448]">Email: <span className="font-medium text-[#0f2d25]">hello@eastlane.store</span></p>
            <p className="text-[#355448]">Режим работы: <span className="font-medium text-[#0f2d25]">10:00 - 22:00</span></p>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link href="https://instagram.com" target="_blank" className="rounded-full bg-[#0f3f33] px-4 py-2 text-sm font-medium text-[#f4edd9]">Instagram</Link>
            <Link href="https://t.me" target="_blank" className="rounded-full border border-[#d8cfb7] bg-white px-4 py-2 text-sm font-medium text-[#2f4b3f]">Telegram</Link>
            <Link href="https://wa.me" target="_blank" className="rounded-full border border-[#d8cfb7] bg-white px-4 py-2 text-sm font-medium text-[#2f4b3f]">WhatsApp</Link>
          </div>
        </div>
      </section>
    </StoreShell>
  )
}
