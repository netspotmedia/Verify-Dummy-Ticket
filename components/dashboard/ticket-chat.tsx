"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, Loader2, User, Shield } from "lucide-react"
import { toast } from "sonner"

interface TicketMessage {
  id: string
  message: string
  is_admin_message: boolean
  created_at: string
  user_id?: string
}

interface Ticket {
  id: string
  subject: string
  status: string
  priority: string
  created_at: string
}

interface TicketChatProps {
  ticket: Ticket
  initialMessages: TicketMessage[]
  currentUserId?: string
}

export function TicketChat({ ticket, initialMessages, currentUserId }: TicketChatProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`ticket-${ticket.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: `ticket_id=eq.${ticket.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as TicketMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticket.id, supabase])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setSending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      await supabase.from("ticket_messages").insert({
        ticket_id: ticket.id,
        user_id: user?.id || null,
        message: newMessage,
        is_admin_message: false,
      })

      setNewMessage("")
      toast.success("Message sent")
    } catch (error) {
      console.error("Send message error:", error)
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleCloseTicket = async () => {
    setLoading(true)
    try {
      await supabase
        .from("support_tickets")
        .update({ status: "closed", closed_at: new Date().toISOString() })
        .eq("id", ticket.id)

      toast.success("Ticket closed")
    } catch (error) {
      console.error("Close ticket error:", error)
      toast.error("Failed to close ticket")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{ticket.subject}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Created {new Date(ticket.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{ticket.status}</Badge>
            {ticket.status !== "closed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseTicket}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Close Ticket"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isAdmin = message.is_admin_message
          return (
            <div
              key={message.id}
              className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  isAdmin
                    ? "bg-muted text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isAdmin ? (
                    <Shield className="h-3 w-3" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  <span className="text-xs font-medium">
                    {isAdmin ? "Support Team" : "You"}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                <p className="text-xs opacity-70 mt-2">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      {ticket.status !== "closed" && (
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="min-h-[80px]"
            />
            <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
