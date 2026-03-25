"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Search, 
  MoreVertical,
  Check,
  X,
  Eye,
  Loader2,
  DollarSign
} from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  full_name: string
  phone: string
  role: string
  is_active: boolean
  created_at: string
}

interface UsersTableProps {
  initialUsers: User[]
}

export function AdminUsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const filteredUsers = users.filter((user) => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id))
    }
  }

  const toggleSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_active: !currentStatus,
          suspended_at: currentStatus ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId)

      if (error) throw error

      setUsers(users.map((user) => 
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      ))
      toast.success(!currentStatus ? "User activated" : "User suspended")
    } catch (error) {
      console.error("Toggle error:", error)
      toast.error("Failed to update user")
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = async (action: "activate" | "suspend") => {
    if (selectedUsers.length === 0) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_active: action === "activate",
          suspended_at: action === "suspend" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .in("id", selectedUsers)

      if (error) throw error

      setUsers(users.map((user) => 
        selectedUsers.includes(user.id) 
          ? { ...user, is_active: action === "activate" } 
          : user
      ))
      setSelectedUsers([])
      toast.success(`${selectedUsers.length} users ${action === "activate" ? "activated" : "suspended"}`)
    } catch (error) {
      console.error("Bulk action error:", error)
      toast.error("Failed to update users")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters & Bulk Actions */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedUsers.length} selected
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleBulkAction("activate")}
              disabled={loading}
            >
              <Check className="h-4 w-4 mr-1" />
              Activate
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleBulkAction("suspend")}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-1" />
              Suspend
            </Button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleSelect(user.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{user.full_name || "N/A"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Active" : "Suspended"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleActive(user.id, user.is_active)}
                          disabled={loading}
                        >
                          {user.is_active ? (
                            <X className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/admin/users/${user.id}`}>
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
