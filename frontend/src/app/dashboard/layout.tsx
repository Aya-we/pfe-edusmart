"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, GraduationCap, Calendar,
  ClipboardCheck, MessageSquare, Settings, Sparkles,
  LogOut, Search, Bell, Users, BookOpen, X, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "${API}";

const studentItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", href: "/dashboard" },
  { icon: GraduationCap,   label: "Mes Résultats",   href: "/dashboard/grades" },
  { icon: ClipboardCheck,  label: "Présences",        href: "/dashboard/attendance" },
  { icon: Calendar,        label: "Emploi du temps",  href: "/dashboard/schedule" },
  { icon: BookOpen,        label: "Bibliothèque",     href: "/dashboard/library" },
  { icon: Sparkles,        label: "EduSmart AI",      href: "/dashboard/ai" },
  { icon: MessageSquare,   label: "Messagerie",       href: "/dashboard/messages" },
];

const teacherItems = [
  { icon: LayoutDashboard, label: "Tableau de bord",  href: "/dashboard/teacher" },
  { icon: Users,           label: "Mes Classes",      href: "/dashboard/teacher/classes" },
  { icon: GraduationCap,   label: "Cahier de Notes",  href: "/dashboard/teacher/gradebook" },
  { icon: ClipboardCheck,  label: "Appel & Absences", href: "/dashboard/teacher/attendance" },
  { icon: Calendar,        label: "Emploi du temps",  href: "/dashboard/teacher/schedule" },
  { icon: BookOpen,        label: "Bibliothèque",     href: "/dashboard/library" },
  { icon: MessageSquare,   label: "Messagerie",       href: "/dashboard/messages" },
];

const adminItems = [
  { icon: LayoutDashboard, label: "Vue d'ensemble",    href: "/dashboard/admin" },
  { icon: Users,           label: "Utilisateurs",      href: "/dashboard/admin/users" },
  { icon: GraduationCap,   label: "Classes & Matières",href: "/dashboard/admin/school" },
  { icon: Calendar,        label: "Emploi du temps",   href: "/dashboard/admin/schedule" },
  { icon: ClipboardCheck,  label: "Justifications",    href: "/dashboard/admin/absences" },
  { icon: BookOpen,        label: "Bibliothèque",      href: "/dashboard/library" },
  { icon: Settings,        label: "Configuration",     href: "/dashboard/admin/settings" },
];

const parentItems = [
  { icon: LayoutDashboard, label: "Tableau de bord",  href: "/dashboard/parent" },
  { icon: Calendar,        label: "Emploi du temps",  href: "/dashboard/schedule" },
  { icon: MessageSquare,   label: "Messagerie",       href: "/dashboard/messages" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname  = usePathname();
  const { user, logout, isLoading } = useAuth();
  
  // ── Notifications state ──
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fermer le panel si click à l'extérieur
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Charger les notifications (messages non lus)
  const loadNotifications = async () => {
    if (!user) return;
    try {
      const convRes = await axios.get(`${API}/messages/conversations/${user.id}`);
      const convs: any[] = convRes.data || [];
      const unread = convs.filter((c: any) => c.unread > 0);

      const notifs = unread.map((c: any) => ({
        id:      c.id,
        type:    "message",
        title:   `Nouveau message de ${c.name}`,
        body:    c.lastMessage?.length > 50 ? c.lastMessage.slice(0, 50) + "…" : c.lastMessage,
        href:    "/dashboard/messages",
        time:    c.time,
        read:    false,
      }));
      setNotifications(notifs);
      setUnreadCount(notifs.length);
    } catch {}
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000); // poll 15s
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  if (isLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      Chargement...
    </div>
  );

  let sidebarItems = studentItems;
  if (user?.role === "TEACHER") sidebarItems = teacherItems;
  if (user?.role === "ADMIN")   sidebarItems = adminItems;
  if (user?.role === "PARENT")  sidebarItems = parentItems;

  const formatTime = (d: string) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-background flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-foreground text-background p-2 rounded-md shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">EduSmart</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                pathname === item.href
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-8">
          <div className="flex items-center bg-muted/50 rounded-xl px-3 py-1.5 w-96">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent border-none outline-none text-sm ml-2 w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* ── Bell Notifications ── */}
            <div className="relative" ref={notifRef}>
              <Button
                variant="ghost" size="icon"
                className="rounded-full relative"
                onClick={() => { setNotifOpen(o => !o); if (!notifOpen) loadNotifications(); }}
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-destructive text-white rounded-full text-[9px] font-black flex items-center justify-center border-2 border-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>

              {/* Dropdown panel */}
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-background border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead}
                          className="text-[10px] text-muted-foreground hover:text-foreground font-bold transition-colors">
                          Tout marquer lu
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)}>
                        <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </button>
                    </div>
                  </div>

                  {/* List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                        <Check className="w-8 h-8 opacity-30" />
                        <p className="text-sm font-medium">Aucune notification</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <Link key={n.id} href={n.href} onClick={() => setNotifOpen(false)}>
                          <div className={cn(
                            "px-5 py-4 hover:bg-muted/50 transition-all cursor-pointer",
                            !n.read && "border-l-2 border-l-foreground bg-muted/20"
                          )}>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0 mt-0.5">
                                <MessageSquare className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">{n.title}</p>
                                <p className="text-xs text-muted-foreground truncate mt-00.5">{n.body}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">{formatTime(n.time)}</p>
                              </div>
                              {!n.read && (
                                <div className="w-2 h-2 rounded-full bg-foreground flex-shrink-0 mt-2" />
                              )}
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 border-t border-border bg-muted/10">
                    <Link href="/dashboard/messages" onClick={() => setNotifOpen(false)}
                      className="text-xs font-bold text-center block text-muted-foreground hover:text-foreground transition-colors">
                      Voir tous les messages →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-border mx-2" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">
                  {user ? `${user.firstName} ${user.lastName}` : "Utilisateur"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-tighter">
                  {user?.role === "TEACHER" ? "Professeur"
                    : user?.role === "ADMIN" ? "Administrateur"
                    : user?.role === "PARENT" ? "Parent"
                    : "Étudiant"}
                </p>
              </div>
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src="" />
                <AvatarFallback>
                  {user ? `${user.firstName[0]}${user.lastName[0]}` : "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-muted/5">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}


