'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  message: string
  send_at: string
  sent: boolean
}

export default function MessageList({ messages }: { messages: Message[] }) {
  const router = useRouter()

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('scheduled_messages').delete().eq('id', id)
    router.refresh()
  }

  if (messages.length === 0) {
    return <p className="text-sm text-gray-500">Nothing scheduled yet.</p>
  }

  return (
    <ul className="space-y-3">
      {messages.map((msg) => (
        <li
          key={msg.id}
          className="flex items-center justify-between rounded border p-3 text-sm"
        >
          <div>
            <p className="text-gray-900">{msg.message}</p>
            <p className="text-gray-500">
              {new Date(msg.send_at).toLocaleString()} —{' '}
              <span className={msg.sent ? 'text-green-600' : 'text-amber-600'}>
                {msg.sent ? 'Sent' : 'Pending'}
              </span>
            </p>
          </div>
          <button
            onClick={() => handleDelete(msg.id)}
            className="text-xs text-red-600 underline"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}