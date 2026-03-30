"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"

interface OrderDocument {
  id: string
  file_name: string
  file_type: string
  file_url: string
  created_at: string
}

interface OrderDocumentsProps {
  orderId: string
  documents: OrderDocument[]
  orderEmail: string
}

export function OrderDocuments({ orderId, documents, orderEmail }: OrderDocumentsProps) {
  const supabase = createClient()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleDownload = async (doc: OrderDocument) => {
    setDownloadingId(doc.id)

    try {
      const link = document.createElement("a")
      link.href = doc.file_url
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      link.download = doc.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Download started")
    } catch (error) {
      console.error("Download error:", error)
      window.open(doc.file_url, "_blank", "noopener,noreferrer")
    } finally {
      setDownloadingId(null)
    }
  }

  const handleResendEmail = async () => {
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: orderEmail,
          subject: `Your order documents - ${orderId.slice(0, 8).toUpperCase()}`,
          type: 'order_delivered',
          data: {
            name: orderEmail.split('@')[0] || 'Customer',
            orderId,
          },
        }),
      })

      if (!res.ok) throw new Error('Failed to resend email')
      toast.success('Documents sent to your email')
    } catch (error) {
      console.error('Resend error:', error)
      toast.error('Failed to resend email')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Order Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {documents && documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(doc)}
                  disabled={downloadingId === doc.id}
                >
                  {downloadingId === doc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span className="ml-2">Download</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No documents available yet</p>
            <p className="text-sm">Documents will be uploaded once your order is processed</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button variant="outline" onClick={handleResendEmail} className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            Resend Documents to Email
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
