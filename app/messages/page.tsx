import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getConversations } from "@/app/actions/messaging"
import { ConversationList } from "@/components/messaging/conversation-list"
import { EmptyState } from "@/components/empty-state"
import { MessageCircle } from "lucide-react"

export default async function MessagesPage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/messages")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("id, role").eq("user_id", session.user.id).single()

  if (!profile) {
    redirect("/onboarding")
  }

  // Get conversations
  const { conversations, error } = await getConversations(session.user.id)

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-destructive">Error loading conversations: {error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full gap-6">
        <div className="md:col-span-1 border rounded-lg overflow-hidden h-[calc(100vh-8rem)]">
          {conversations && conversations.length > 0 ? (
            <ConversationList conversations={conversations} userRole={profile.role} />
          ) : (
            <EmptyState
              icon={<MessageCircle className="h-10 w-10" />}
              title="No conversations yet"
              description={
                profile.role === "client"
                  ? "Start a conversation with an expert to get help."
                  : "You don't have any client conversations yet."
              }
              action={
                profile.role === "client"
                  ? {
                      label: "Find Experts",
                      href: "/experts",
                    }
                  : undefined
              }
            />
          )}
        </div>

        <div className="md:col-span-2 lg:col-span-3 border rounded-lg flex items-center justify-center p-6">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Select a conversation</h2>
            <p className="mt-2 text-muted-foreground">Choose a conversation from the sidebar to start messaging</p>
          </div>
        </div>
      </div>
    </div>
  )
}

