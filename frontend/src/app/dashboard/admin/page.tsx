"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Users, GraduationCap, School, TrendingUp, 
  AlertCircle, UserPlus, Loader2, BookOpen,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "${API}";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Étudiant",
  TEACHER: "Professeur",
  ADMIN:   "Administrateur",
  PARENT:  "Parent",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0, teachers: 0, classes: 0, parents: 0,
  });
  const [recentUsers, setRecentUsers]   = useState<any[]>([]);
  const [recentClasses, setRecentClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [usersRes, classesRes] = await Promise.all([
          axios.get(`${API}/users`),
          axios.get(`${API}/classes`),
        ]);

        const users   = usersRes.data  as any[];
        const classes = classesRes.data as any[];

        setStats({
          students: users.filter(u => u.role === "STUDENT").length,
          teachers: users.filter(u => u.role === "TEACHER").length,
          parents:  users.filter(u => u.role === "PARENT").length,
          classes:  classes.length,
        });

        // Les 5 derniers utilisateurs ajoutés (tri par createdAt desc si dispo, sinon ordre naturel)
        const sorted = [...users].sort((a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        );
        setRecentUsers(sorted.slice(0, 5));
        setRecentClasses(classes.slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  const cards = [
    { label: "Total Étudiants",  value: stats.students, icon: GraduationCap, color: "bg-blue-500/10 text-blue-600" },
    { label: "Corps Enseignant", value: stats.teachers,  icon: Users,         color: "bg-purple-500/10 text-purple-600" },
    { label: "Classes Actives",  value: stats.classes,   icon: School,        color: "bg-green-500/10 text-green-600" },
    { label: "Parents",          value: stats.parents,   icon: Users,         color: "bg-orange-500/10 text-orange-600" },
  ];

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 border-b border-border pb-8">
        <h1 className="text-4xl font-bold tracking-tight">Vue d'ensemble</h1>
        <p className="text-muted-foreground text-lg">Données consolidées de l'établissement en temps réel.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-8 rounded-3xl border border-border bg-background shadow-sm hover:shadow-md transition-all group"
          >
            <div className={cn("inline-flex p-3 rounded-2xl mb-6 transition-all group-hover:scale-110", card.color)}>
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{card.label}</p>
            <h3 className="text-4xl font-black tracking-tighter">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activités récentes = derniers users ajoutés */}
        <div className="p-8 rounded-3xl border border-border bg-background">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Nouveaux membres</h3>
            <Link href="/dashboard/admin/users" className="text-xs text-muted-foreground hover:text-foreground font-bold flex items-center gap-1 transition-colors">
              Voir tous <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucun utilisateur enregistré.</p>
            ) : recentUsers.map((u, i) => (
              <div key={u.id} className="flex items-center gap-4 pb-4 border-b border-border/40 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {(u.firstName?.[0] ?? "?")}{ (u.lastName?.[0] ?? "")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</p>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                  u.role === "STUDENT" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900" :
                  u.role === "TEACHER" ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900" :
                  "bg-muted text-muted-foreground border-border"
                )}>
                  {ROLE_LABELS[u.role] ?? u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Classes actives */}
        <div className="p-8 rounded-3xl border border-border bg-background">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Classes actives</h3>
            <Link href="/dashboard/admin/school" className="text-xs text-muted-foreground hover:text-foreground font-bold flex items-center gap-1 transition-colors">
              Gérer <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune classe créée.</p>
            ) : recentClasses.map((c: any) => (
              <div key={c.id} className="flex items-center gap-4 pb-4 border-b border-border/40 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c._count?.students ?? 0} élève(s)
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


