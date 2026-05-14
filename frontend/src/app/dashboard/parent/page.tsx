"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, TrendingUp, AlertCircle, ArrowRight,
  Loader2, GraduationCap, BookOpen, MessageSquare,
  CheckCircle2, XCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API = "http://localhost:4000";

interface ChildData {
  id: string;
  userId: string;
  classId: string;
  user: { firstName: string; lastName: string; email: string };
  class: { name: string };
  grades: any[];
  attendances: any[];
  avgGeneral: string;
  absenceCount: number;
  presenceRate: number;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!user?.id) return;
      try {
        // GET /users/:id → retourne parent.students avec user + class
        const res = await axios.get(`${API}/users/${user.id}`);
        const rawChildren: any[] = res.data?.parent?.students || [];

        // Pour chaque enfant, fetch notes + absences
        const enriched = await Promise.all(rawChildren.map(async (child: any) => {
          let grades: any[] = [];
          let attendances: any[] = [];

          try {
            const gRes = await axios.get(`${API}/grades/averages/${child.userId}`);
            grades = gRes.data || [];
          } catch {}
          try {
            const aRes = await axios.get(`${API}/attendance/${child.userId}`);
            attendances = aRes.data || [];
          } catch {}

          const avgGeneral = grades.length > 0
            ? (grades.reduce((s: number, g: any) => s + (g.average || 0), 0) / grades.length).toFixed(2)
            : "—";
          const absenceCount   = attendances.filter((a: any) => a.status === "ABSENT").length;
          const presenceRate   = attendances.length > 0
            ? Math.round(((attendances.length - absenceCount) / attendances.length) * 100)
            : 100;

          return { ...child, grades, attendances, avgGeneral, absenceCount, presenceRate };
        }));

        setChildren(enriched);
        if (enriched.length > 0) setSelected(enriched[0].id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  const activeChild = children.find(c => c.id === selected);

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border pb-8">
        <h1 className="text-4xl font-bold tracking-tight">Bonjour, {user?.firstName} 👋</h1>
        <p className="text-muted-foreground text-lg">Suivi en temps réel de la scolarité de vos enfants.</p>
      </div>

      {children.length === 0 ? (
        /* Aucun enfant */
        <div className="p-16 border border-dashed border-border rounded-3xl text-center space-y-6 bg-muted/5">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xl font-bold">Aucun enfant rattaché</p>
            <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto">
              Contactez l'administration pour lier le compte de votre enfant à votre espace parent.
            </p>
          </div>
          <Link href="/dashboard/messages">
            <Button className="rounded-xl px-8 h-12 gap-2 bg-foreground text-background font-bold">
              <MessageSquare className="w-4 h-4" /> Contacter l'administration
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Tabs enfants (si plusieurs) */}
          {children.length > 1 && (
            <div className="flex gap-3 flex-wrap">
              {children.map(child => (
                <button key={child.id} onClick={() => setSelected(child.id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    selected === child.id
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}>
                  {child.user.firstName} {child.user.lastName}
                </button>
              ))}
            </div>
          )}

          {activeChild && (
            <motion.div key={activeChild.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-8">

              {/* Carte enfant */}
              <Card className="rounded-3xl border border-border bg-background shadow-sm overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center font-black text-xl">
                      {activeChild.user.firstName[0]}{activeChild.user.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">
                        {activeChild.user.firstName} {activeChild.user.lastName}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                        {activeChild.class?.name ?? "—"}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Moyenne Générale</p>
                      <p className={`text-3xl font-black ${activeChild.avgGeneral !== "—" ? parseFloat(activeChild.avgGeneral) >= 10 ? "text-green-600" : "text-red-500" : ""}`}>
                        {activeChild.avgGeneral}
                      </p>
                      {activeChild.avgGeneral !== "—" && <p className="text-xs text-muted-foreground">/20</p>}
                    </div>
                    <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Taux Présence</p>
                      <p className={`text-3xl font-black ${activeChild.presenceRate >= 80 ? "text-green-600" : "text-orange-500"}`}>
                        {activeChild.attendances.length > 0 ? `${activeChild.presenceRate}%` : "—"}
                      </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Absences</p>
                      <p className={`text-3xl font-black ${activeChild.absenceCount > 3 ? "text-red-500" : "text-foreground"}`}>
                        {activeChild.attendances.length > 0 ? activeChild.absenceCount : "—"}
                      </p>
                      {activeChild.absenceCount > 0 && <p className="text-xs text-muted-foreground">séance(s)</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes récentes */}
              {activeChild.grades.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Dernières moyennes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {activeChild.grades.slice(0, 3).map((g: any, i: number) => (
                      <div key={i} className="p-5 rounded-2xl border border-border bg-background hover:border-foreground/20 transition-all">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{g.subjectName ?? "Matière"}</p>
                        <p className={`text-2xl font-black mb-0.5 ${(g.average ?? 0) >= 10 ? "text-green-600" : "text-red-500"}`}>
                          {(g.average ?? 0).toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">/20</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Absences récentes */}
              {activeChild.attendances.filter((a: any) => a.status === "ABSENT").length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Dernières absences</h3>
                  <div className="border border-border rounded-xl overflow-hidden bg-background">
                    {activeChild.attendances.filter((a: any) => a.status === "ABSENT").slice(0, 5).map((a: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 border-b border-border/40 last:border-0">
                        <div className="flex items-center gap-3">
                          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-bold">{a.subject?.name ?? "Séance"}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(a.date ?? a.createdAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.justified ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                          {a.justified ? "Justifiée" : "Non justifiée"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions rapides */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/dashboard/messages">
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-border font-bold gap-3 hover:border-foreground transition-all group">
                    <MessageSquare className="w-4 h-4" />
                    Contacter un professeur
                    <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-all" />
                  </Button>
                </Link>
                <Link href="/dashboard/schedule">
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-border font-bold gap-3 hover:border-foreground transition-all group">
                    <BookOpen className="w-4 h-4" />
                    Emploi du temps
                    <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-all" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
