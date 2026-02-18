import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/** Отладочный эндпоинт: доступен только в development, в production возвращает 404. */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '✅ Supabase подключён!',
      session: data.session ? 'активна' : 'не активна',
      env: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ задан' : '✗ отсутствует',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ задан' : '✗ отсутствует',
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
