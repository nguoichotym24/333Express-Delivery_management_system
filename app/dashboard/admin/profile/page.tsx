"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"
import { Mail, Phone, MapPin, Shield } from "lucide-react"

export default function AdminProfilePage() {
  const { user } = useAuth()
  const [editOpen, setEditOpen] = useState(false)

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Thông tin quản trị viên</h1>
        <p className="text-secondary mt-2">Quản lý thông tin tài khoản quản trị viên của bạn</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Thông tin tài khoản</CardTitle>
            <CardDescription>Thông tin cơ bản của quản trị viên</CardDescription>
          </div>
          <Button onClick={() => setEditOpen(true)}>Chỉnh sửa</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-secondary">Tên quản trị viên</p>
              <p className="font-medium">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-secondary">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-secondary">Số điện thoại</p>
              <p className="font-medium">{user.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-sm text-secondary">Địa chỉ</p>
              <p className="font-medium">{user.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
    </div>
  )
}
