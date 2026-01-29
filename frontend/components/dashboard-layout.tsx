"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { navigationByRole } from "@/lib/navigation"
import { useRouter, usePathname } from "next/navigation"
import { API_URL } from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Menu, Bell, Settings, ChevronDown, ChevronRight, User, Settings as SettingsIcon } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const getRoleGradient = (role: string) => {
    switch (role) {
      case 'school_admin':
      case 'super_admin':
        return 'from-blue-600 to-purple-600'
      case 'teacher':
        return 'from-purple-600 to-pink-600'
      case 'student':
        return 'from-green-600 to-blue-600'
      case 'parent':
        return 'from-blue-600 to-purple-600'
      default:
        return 'from-blue-600 to-purple-600'
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) {
    return null
  }

  const navItems = navigationByRole[user.role] || []

  const getRolePath = (role: string) => {
    switch (role) {
      case 'school_admin': return 'admin'
      case 'super_admin': return 'super-admin'
      default: return role
    }
  }

  const rolePath = getRolePath(user.role)

  const SidebarContent = ({ isOpen = true }: { isOpen?: boolean }) => (
    <div className="flex flex-col h-full bg-white">
      {/* Header for Desktop Sidebar (Title) - Mobile usually has it in SheetHeader */}
      {isOpen && (
        <div className="p-4 border-b border-gray-200 hidden md:block">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getRoleGradient(user.role)} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <h1 className="font-bold text-lg bg-gradient-to-r ${getRoleGradient(user.role)} bg-clip-text text-transparent">School MS</h1>
            {/* Collapse button for desktop only */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto p-1 hover:bg-gray-100 rounded-lg transition-colors md:block hidden">
              <Menu size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 p-3 overflow-y-auto">
        {isOpen ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">Navigation</p>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.subItems && item.subItems.some(sub => pathname === sub.href))
                const isExpanded = expandedMenu === item.label || isActive

                return (
                  <div key={item.href}>
                    {item.subItems ? (
                      <>
                        <button
                          onClick={() => setExpandedMenu(expandedMenu === item.label ? null : item.label)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? `bg-blue-50 text-blue-700` : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <span>{item.label}</span>
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>

                        {isExpanded && (
                          <div className="pl-4 mt-1 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                            {item.subItems.map((subItem) => {
                              const isSubActive = pathname === subItem.href
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className={`group relative block px-3 py-2 rounded-lg text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${isSubActive
                                    ? `text-blue-700 font-medium bg-blue-50 ring-1 ring-blue-100`
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full transition-opacity ${isSubActive ? 'bg-blue-600 opacity-100' : 'bg-blue-600 opacity-0 group-hover:opacity-40'}`} />
                                  {subItem.label}
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                          ? `bg-gradient-to-r ${getRoleGradient(user.role)} text-white shadow-sm`
                          : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        ) : (
          <div className="space-y-2 mt-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.subItems && item.subItems.some(sub => pathname === sub.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all mx-auto ${isActive
                    ? `bg-gradient-to-r ${getRoleGradient(user.role)} text-white shadow-sm`
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <span className="text-xs font-bold">{item.label.substring(0, 2).toUpperCase()}</span>
                </Link>
              )
            })}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center justify-center w-12 h-12 rounded-lg text-gray-700 hover:bg-gray-100 mx-auto mt-4">
              <Menu size={20} />
            </button>

          </div>
        )}
      </div>

      {/* Footer (Profile & Logout) */}
      <div className="p-3 border-t border-gray-200">
        {isOpen ? (
          <div className="space-y-2">
            <Link href={`/dashboard/${rolePath}/profile`} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <Avatar className="h-8 w-8">
                {user.profilePicture && (
                  <AvatarImage src={user.profilePicture.startsWith('http') ? user.profilePicture : `${API_URL}${user.profilePicture}`} alt={user.name} className="object-cover" />
                )}
                <AvatarFallback className={`bg-gradient-to-br ${getRoleGradient(user.role)} text-white text-xs font-bold`}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role?.replace('-', ' ') || 'User'}</p>
              </div>
            </Link>
            <Button onClick={handleLogout} variant="outline" size="sm" className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50">
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <Button onClick={handleLogout} variant="outline" size="sm" className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50 p-0 h-10 w-10 mx-auto">
            <LogOut size={16} />
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200 transition-all duration-300 hidden md:flex flex-col shadow-sm`}
      >
        <SidebarContent isOpen={sidebarOpen} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6 text-gray-600" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getRoleGradient(user.role)} flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">SM</span>
                      </div>
                      <span>School MS</span>
                    </SheetTitle>
                  </SheetHeader>
                  <SidebarContent isOpen={true} />
                </SheetContent>
              </Sheet>

              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate max-w-[200px] md:max-w-none">{title}</h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5 hidden md:block">Welcome back, {user.name.split(' ')[0]}!</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Link href={`/dashboard/${rolePath}/notifications`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative" title="Notifications">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer select-none">
                    <Avatar className="h-8 w-8 md:h-9 md:w-9">
                      {user.profilePicture && (
                        <AvatarImage src={user.profilePicture.startsWith('http') ? user.profilePicture : `${API_URL}${user.profilePicture}`} alt={user.name} className="object-cover" />
                      )}
                      <AvatarFallback className={`bg-gradient-to-br ${getRoleGradient(user.role)} text-white font-bold`}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role?.replace('-', ' ') || 'User'}</p>
                    </div>
                    <ChevronDown size={14} className="text-gray-400 hidden md:block" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/${rolePath}/profile`)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/${rolePath}/settings`)}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  )
}
