"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Mail, Eye, Check, Search, MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  is_read: boolean
  created_at: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterUnread, setFilterUnread] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadMessages()
  }, [])

  async function loadMessages() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Failed to load messages:", error)
      toast.error("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id: string) {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: true })
        .eq("id", id)

      if (error) throw error

      setMessages(messages.map(m =>
        m.id === id ? { ...m, is_read: true } : m
      ))
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, is_read: true })
      }
    } catch (error) {
      toast.error("Failed to mark as read")
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("Are you sure you want to delete this message?")) return

    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id)

      if (error) throw error

      setMessages(messages.filter(m => m.id !== id))
      if (selectedMessage?.id === id) {
        setSelectedMessage(null)
      }
      toast.success("Message deleted")
    } catch (error) {
      toast.error("Failed to delete message")
    }
  }

  async function sendReply() {
    if (!selectedMessage || !replyContent.trim()) {
      toast.error("Please enter a reply message")
      return
    }

    setSending(true)
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: true })
        .eq("id", selectedMessage.id)

      if (error) throw error

      toast.success(`Reply sent to ${selectedMessage.email}`)
      setReplyContent("")
      setSelectedMessage(null)
      loadMessages()
    } catch (error) {
      toast.error("Failed to send reply")
    } finally {
      setSending(false)
    }
  }

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = searchQuery === "" ||
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = !filterUnread || !msg.is_read

    return matchesSearch && matchesFilter
  })

  const unreadCount = messages.filter(m => !m.is_read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All messages read"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant={filterUnread ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterUnread(!filterUnread)}
              >
                Unread Only
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Status</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message.id} className={!message.is_read ? "bg-primary/5" : ""}>
                    <TableCell>
                      {!message.is_read && (
                        <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{message.name}</p>
                        <p className="text-sm text-muted-foreground">{message.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{message.subject || "No subject"}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {message.message}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedMessage(message)
                            if (!message.is_read) markAsRead(message.id)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMessage(message.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Message from {selectedMessage?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedMessage?.email} - {selectedMessage?.subject || "No subject"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{selectedMessage?.message}</p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Send Reply</h4>
              <Textarea
                placeholder="Type your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
                className="mb-2"
              />
              <div className="flex justify-end">
                <Button onClick={sendReply} disabled={sending}>
                  {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Send Reply
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
