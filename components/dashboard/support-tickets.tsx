"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  MessageCircle, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Send,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface SupportTicket {
  id: string
  subject: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  order_id?: string
}

interface SupportTicketListProps {
  tickets: SupportTicket[]
  onTicketCreated?: () => void
}

export function SupportTicketList({ tickets, onTicketCreated }: SupportTicketListProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("normal")
  const [orderId, setOrderId] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, priority, orderId }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "Failed to create ticket")
        return
      }

      toast.success("Ticket created successfully")
      setIsOpen(false)
      setSubject("")
      setMessage("")
      setPriority("normal")
      setOrderId("")
      onTicketCreated?.()
    } catch (error) {
      console.error("Create ticket error:", error)
      toast.error("Failed to create ticket")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" /> Open</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
      case "resolved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" /> Resolved</Badge>
      case "closed":
        return <Badge variant="outline">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>
      case "high":
        return <Badge className="bg-orange-500/10 text-orange-600">High</Badge>
      case "normal":
        return <Badge variant="secondary">Normal</Badge>
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Ticket Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderId">Related Order (Optional)</Label>
              <Input
                id="orderId"
                placeholder="Order ID (e.g., VDT-20240101-00001)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your issue in detail..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateTicket} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Ticket
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tickets List */}
      {tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{ticket.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(ticket.priority)}
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-1">No support tickets</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Need help? Create a new support ticket
            </p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
