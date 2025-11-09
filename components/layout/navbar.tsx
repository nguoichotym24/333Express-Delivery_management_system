"use client"

import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, User, Moon, Sun } from "lucide-react"
import Image from "next/image"

export function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="bg-surface border-b border-default h-16 flex items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Image src="/333-r-logo.png" alt="TRIPLE3 Express Logo" width={93} height={30} className="w-43 h-14 rounded-lg flex items-center justify-center vt-logo" />
        <span className="font-bold text-lg hidden sm:inline"></span>
      </Link>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="hover:bg-primary/10"
          title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
        </Button>

        {user ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary text-background font-bold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-secondary capitalize">{user.role}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 bg-surface border border-default">
                <DropdownMenuLabel className="flex flex-col gap-1 px-2 py-1.5">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-secondary">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/${user.role}/profile`}
                    className="flex items-center gap-2 cursor-pointer px-2 py-1.5 hover:bg-primary/10 rounded"
                  >
                    <User className="w-4 h-4" />
                    <span>Thông tin cá nhân</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 cursor-pointer px-2 py-1.5 text-destructive hover:bg-destructive/10 rounded"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : null}
      </div>
    </nav>
  )
}
