'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AddMessageForm() {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [message, setMessage] = useState('')
  const [sendAt, setSendAt] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      setError('That doesn\'t look like a Discord webhook URL.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('scheduled_messages').insert({
      user_id: user.id,
      webhook_url: webhookUrl,
      message: message,
      send_at: new Date(sendAt).toISOString(),
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setWebhookUrl('')
    setMessage('')
    setSendAt('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-gray-700">Discord Webhook URL</label>
        <input
          type="url"
          required
          placeholder="https://discord.com/api/webhooks/..."
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-700">Message</label>
        <textarea
          required
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
          rows={3}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-700">Send at</label>
        <input
          type="datetime-local"
          required
          value={sendAt}
          onChange={(e) => setSendAt(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Schedule message'}
      </button>
    </form>
  )
}