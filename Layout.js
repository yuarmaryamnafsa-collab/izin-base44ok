import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard,
  FileText,
  Users,
  School,
  BarChart3,
  LogOut,
  Menu,
  X,
  GraduationCap
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const getNavigationByRole = (role) => {
  const baseNav = [
    {
      title: "Dashboard",
      url: createPageUrl("Dashboard"),
      icon: LayoutDashboard,
      roles: ["student", "teacher", "admin"]
    }
  ];

  const roleSpecificNav = {
    student: [
      {
        title: "Ajukan Izin",
        url: createPageUrl("SubmitPermission"),
        icon: FileText
      },
      {
        title: "Riwayat Izin",
        url: createPageUrl("MyPermissions"),
        icon: BarChart3
      }
    ],
    teacher: [
      {
        title: "Persetujuan Izin",
        url: createPageUrl("ApprovePermissions"),
        icon: FileText
      },
      {
        title: "Siswa Kelas",
        url: createPageUrl("MyStudents"),
        icon: Users
      }
    ],
    admin: [
      {
        title: "Semua Izin",
        url: createPageUrl("AllPermissions"),
        icon: FileText
      },
      {
        title: "Data Siswa",
        url: createPageUrl("Students"),
        icon: Users
      },
      {
        title: "Data Kelas",
        url: createPageUrl("Classes"),
        icon: School
      },
      {
        title: "Laporan",
        url: createPageUrl("Reports"),
        icon: BarChart3
      }
    ]
  };

  return [...baseNav, ...(roleSpecificNav[role] || [])];
};

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const navigationItems = user ? getNavigationByRole(user.role) : [];

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary: 238 77% 48%;
          --primary-foreground: 0 0% 100%;
          --accent: 142 76% 36%;
          --accent-foreground: 0 0% 100%;
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
        <Sidebar className="border-r border-indigo-100/50 bg-white/80 backdrop-blur-xl">
          <SidebarHeader className="border-b border-indigo-100/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">SIKMS</h2>
                <p className="text-xs text-gray-500">Sistem Izin Keluar Masuk</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-indigo-100/50 p-4">
            {user && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <Avatar className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500">
                    <AvatarFallback className="bg-transparent text-white font-semibold">
                      {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all duration-200"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </Button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-xl border-b border-indigo-100/50 px-6 py-4 md:hidden sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-indigo-50 p-2 rounded-lg transition-colors duration-200" />
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
                <h1 className="text-lg font-bold text-gray-900">SIKMS</h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}