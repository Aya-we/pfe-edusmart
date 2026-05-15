"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "${API}";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<{ available: boolean; filename: string | null }>({ available: false, filename: null });
  const [loadingGrades, setLoadingGrades] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Fetch grades averages
        const gradesRes = await axios.get(`${API}/grades/averages/${user.id}`);
        setGrades(gradesRes.data?.slice(0, 3) || []);
      } catch {}
      try {
        // Fetch attendance
        const attRes = await axios.get(`${API}/attendance/${user.id}`);
        setAttendance(attRes.data || []);
      } catch {}
      try {
        // Check timetable PDF
        const ttRes = await axios.get(`${API}/timetable-upload/check`);
        setTimetable(ttRes.data);
      } catch {}
      setLoadingGrades(false);
    };
    fetchData();
  }, [user]);

  const absences = attendance.filter((a: any) => a.status === "ABSENT").length;
  const presenceRate = attendance.length > 0
    ? Math.round(((attendance.length - absences) / attendance.length) * 100)
    : 100;

  const avgGeneral = grades.length > 0
    ? (grades.reduce((s: number, g: any) => s + (g.average || 0), 0) / grades.length).toFixed(2)
    : "—";

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex flex-col gap-2 border-b border-border pb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Bonjour, {user?.firstName} ! 👋
        </h1>
        <p className="text-muted-foreground text-lg">Voici un aperçu de tes performances.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Timetable PDF Banner */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Emploi du temps</h3>
            {timetable.available ? (
              <div className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-foreground/20 bg-foreground text-background shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-background/10">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">PDF de la semaine disponible</p>
                    <p className="text-xs opacity-70 mt-0.5">{timetable.filename}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <a href={`${API}/timetable-upload/latest`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="secondary" className="rounded-xl h-9 gap-2 font-bold text-xs">
                      Voir
                    </Button>
                  </a>
                  <a href={`${API}/timetable-upload/latest`} download>
                    <Button size="sm" variant="secondary" className="rounded-xl h-9 gap-2 font-bold text-xs">
                      <Download className="w-3.5 h-3.5" />
                      Télécharger
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-dashed border-border bg-muted/10">
                <div className="p-3 rounded-xl bg-muted">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold text-sm">Aucun emploi du temps disponible</p>
                  <p className="text-xs text-muted-foreground mt-0.5">L'administration n'a pas encore publié le PDF de cette semaine.</p>
                </div>
              </div>
            )}
          </div>

          {/* Last Grades */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Dernières moyennes</h3>
              <Link href="/dashboard/grades" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Voir tout
              </Link>
            </div>

            {loadingGrades ? (
              <div className="h-24 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : grades.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {grades.map((item: any, i: number) => (
                  <div key={i} className="p-5 rounded-2xl border border-border bg-background hover:border-foreground/20 transition-all group">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">{item.subjectName || "Matière"}</p>
                    <p className="text-2xl font-black mb-1">{(item.average || 0).toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">/20</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground p-4 rounded-xl border border-dashed border-border">
                Aucune note enregistrée pour le moment.
              </p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Stats — masquée si aucune donnée */}
          {(grades.length > 0 || attendance.length > 0) ? (
            <Card className="rounded-3xl border border-border bg-background overflow-hidden shadow-sm">
              <CardHeader className="border-b border-border bg-muted/30">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Performances</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {grades.length > 0 && (
                  <div className="text-center">
                    <p className="text-5xl font-black tracking-tighter">{avgGeneral}</p>
                    <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-widest">Moyenne Générale</p>
                  </div>
                )}
                {attendance.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">Présence</span>
                      </div>
                      <span className="text-sm font-bold">{presenceRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">Absences</span>
                      </div>
                      <span className="text-sm font-bold text-orange-600">{absences} j</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-3xl border border-dashed border-border bg-background overflow-hidden shadow-sm">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[200px]">
                <div className="p-4 rounded-2xl bg-muted">
                  <GraduationCap className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold">Bienvenue !</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[180px]">
                    Vos performances apparaîtront ici dès que vos cours commencent.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <div className="space-y-3">
            <Link href="/dashboard/grades">
              <Button variant="outline" className="w-full justify-between rounded-xl h-14 px-6 border-border hover:border-foreground group transition-all">
                <span className="font-bold">Bulletin détaillé</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
            <Link href="/dashboard/attendance">
              <Button variant="outline" className="w-full justify-between rounded-xl h-14 px-6 border-border hover:border-foreground group transition-all">
                <span className="font-bold">Justifier une absence</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
            <Link href="/dashboard/schedule">
              <Button variant="outline" className="w-full justify-between rounded-xl h-14 px-6 border-border hover:border-foreground group transition-all">
                <span className="font-bold">Emploi du temps complet</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

