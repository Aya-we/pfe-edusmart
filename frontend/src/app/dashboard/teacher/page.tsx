"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  Clock,
  ArrowUpRight,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    classesCount: 0,
    subjectsCount: 0,
    hoursToday: 0,
    attendancesDone: 0,
    totalTimetablesToday: 0,
    upcomingCourses: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      axios.get(`${API}/users/${user.id}/teacher-dashboard`)
        .then(res => {
          setData(res.data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Chargement des données...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Espace Professeur</h1>
        <p className="text-muted-foreground">Bienvenue, {user ? `${user.firstName} ${user.lastName}` : "Professeur"}. Voici votre agenda du jour.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Mes Classes", value: data.classesCount.toString(), icon: Users, color: "blue" },
          { label: "Matières", value: data.subjectsCount.toString(), icon: BookOpen, color: "purple" },
          { label: "Appels faits", value: `${data.attendancesDone}/${data.totalTimetablesToday}`, icon: ClipboardCheck, color: "green" },
          { label: "Heures ce jour", value: `${data.hoursToday}h`, icon: Clock, color: "orange" },
        ].map((stat, i) => (
          <Card key={i} className={`rounded-3xl border-none shadow-sm bg-${stat.color}-500/5`}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-3xl border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Cours à venir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.upcomingCourses.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">Aucun cours prévu pour aujourd'hui.</div>
            ) : (
              data.upcomingCourses.map((course, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 group hover:bg-muted transition-colors">
                  <div className="flex gap-4">
                    <div className="w-16 text-sm font-bold text-primary">{course.time.split(" - ")[0]}</div>
                    <div>
                      <div className="font-bold">{course.class}</div>
                      <div className="text-xs text-muted-foreground">{course.subject} • {course.room}</div>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/teacher/gradebook" className="col-span-2">
              <Button className="w-full h-16 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 gap-3">
                <GraduationCap className="w-6 h-6" />
                Saisir les Notes
              </Button>
            </Link>
            <Button variant="outline" className="h-16 rounded-2xl gap-2 font-semibold">
              <ClipboardCheck className="w-5 h-5" />
              Faire l'appel
            </Button>
            <Button variant="outline" className="h-16 rounded-2xl gap-2 font-semibold">
              <BookOpen className="w-5 h-5" />
              Publier Devoir
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
