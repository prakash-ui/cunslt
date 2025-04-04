import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getConversations, getConversation, getMessages, getMessageTemplates } from "@/app/actions/messaging"
import { ConversationList } from "@/components/messaging/conversation-list"
import { MessageList } from "@/components/messaging/message-list"
import { MessageInput } from "@/components/messaging/message-input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, MoreVertical } from "lucide-react"
import Link from "next/link"
import { createMessageTemplate } from "@/app/actions/message-template"

interface ConversationPageProps {
  params: {
    id: string
  }
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = params
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

  // Get conversations for sidebar
  const { conversations } = await getConversations(session.user.id)

  // Get current conversation
  const { conversation, error: conversationError } = await getConversation(id, session.user.id)

  if (conversationError) {
    redirect("/messages")
  }

  // Get messages
  const { messages, error: messagesError } = await getMessages(id, session.user.id)

  if (messagesError) {
    redirect("/messages")
  }

  // Get message templates for experts
  let templates = []
  if (profile.role === "expert") {
    const { templates: expertTemplates } = await getMessageTemplates(session.user.id)
    if (expertTemplates) {
      templates = expertTemplates
    }
  }

  // Determine the other person in the conversation
  const otherPerson =
    profile.role === "expert"
      ? conversation.client
      : {
          full_name: conversation.expert.profiles.full_name,
          avatar_url: conversation.expert.profiles.avatar_url,
        }

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full gap-6">
        <div className="hidden md:block md:col-span-1 border rounded-lg overflow-hidden h-[calc(100vh-8rem)]">
          <ConversationList conversations={conversations || []} userRole={profile.role} />
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-3 border rounded-lg flex flex-col h-[calc(100vh-8rem)]">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <Link href="/messages" className="md:hidden mr-2">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={otherPerson.avatar_url || ""} alt={otherPerson.full_name} />
                <AvatarFallback>{otherPerson.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{otherPerson.full_name}</h2>
                <p className="text-sm text-muted-foreground">{profile.role === "expert" ? "Client" : "Expert"}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            <MessageList messages={messages || []} currentUserId={profile.id} />
          </div>

          <MessageInput
            conversationId={id}
            userId={session.user.id}
            templates={templates}
            onSendMessage={() => {}}
            onSaveTemplate={
              profile.role === "expert"
                ? async (title, content) => {
                    "use server"
                    await createMessageTemplate(title, content, session.user.id)
                  }
                : undefined
            }
          />
        </div>
      </div>
    </div>
  )
}

