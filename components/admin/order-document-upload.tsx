"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Upload, 
  FileText, 
  Loader2, 
  Check,
  X,
  Download,
  Trash2
} from "lucide-react"
import { toast } from "sonner"

interface OrderDocument {
  id: string
  file_name: string
  file_type: string
  file_url: string
  created_at: string
}

interface OrderDocumentUploadProps {
  orderId: string
  documents: OrderDocument[]
  onUploadComplete?: () => void
}

export function OrderDocumentUpload({ orderId, documents, onUploadComplete }: OrderDocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Upload to storage
      const filePath = `${orderId}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from("order-documents")
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("order-documents")
        .getPublicUrl(filePath)

      // Save to database
      const { error: dbError } = await supabase.from("order_documents").insert({
        order_id: orderId,
        file_name: file.name,
        file_type: file.type,
        file_url: publicUrl,
        file_size: file.size,
        uploaded_by: user?.id || null,
      })

      if (dbError) throw dbError

      // If this is the first document, auto-complete the order
      if (documents.length === 0) {
        await supabase
          .from("orders")
          .update({ 
            status: "completed", 
            updated_at: new Date().toISOString() 
          })
          .eq("id", orderId)
      }

      toast.success("Document uploaded successfully")
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      onUploadComplete?.()
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload document")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: string) => {
    try {
      const { error } = await supabase
        .from("order_documents")
        .delete()
        .eq("id", docId)

      if (error) throw error
      toast.success("Document deleted")
      onUploadComplete?.()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete document")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order Documents</CardTitle>
        <CardDescription>Upload documents for this order</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Click to upload or drag and drop
            </p>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload" asChild>
              <Button variant="outline" size="sm" asChild>
                <span>Select File</span>
              </Button>
            </Label>
            {file && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{file.name}</span>
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <Label>Uploaded Documents</Label>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
