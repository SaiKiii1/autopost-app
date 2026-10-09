import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AddMessageForm from './add-message-form'
import MessageList from './message-list'
import LogoutButton from './logout-button'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: messages } = await supabase
    .from('scheduled_messages')
    .select('*')
    .order('send_at', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Your Autopost Messages</h1>
          <LogoutButton />
        </div>

        <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-medium text-gray-700">Schedule a new message</h2>
          <AddMessageForm />
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-medium text-gray-700">Scheduled</h2>
          <MessageList messages={messages ?? []} />
        </div>
      </div>
    </div>
  )
}