import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Only allow this to run if the secret matches — stops random people
  // on the internet from triggering it
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

  // Find messages that are due and haven't been sent yet
  const { data: dueMessages, error } = await supabase
    .from('scheduled_messages')
    .select('*')
    .eq('sent', false)
    .lte('send_at', new Date().toISOString())

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = []

  for (const msg of dueMessages ?? []) {
    try {
      const res = await fetch(msg.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: msg.message,
          allowed_mentions: { parse: [] }, // prevents @everyone / role pings
        }),
      })

      if (res.ok) {
        await supabase
          .from('scheduled_messages')
          .update({ sent: true })
          .eq('id', msg.id)
        results.push({ id: msg.id, status: 'sent' })
      } else {
        results.push({ id: msg.id, status: 'failed', code: res.status })
      }
    } catch {
      results.push({ id: msg.id, status: 'error' })
    }
  }

  return NextResponse.json({ checked: dueMessages?.length ?? 0, results })
}