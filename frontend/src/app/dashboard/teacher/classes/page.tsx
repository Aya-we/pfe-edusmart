"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  ClipboardCheck, 
  ArrowRight,
  BookOpen,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function MyClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${API}/classes/teacher/${user.id}`);
        setClasses(res.data);
      } catch (err) {
        console.error("Failed to fetch classes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [user]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-muted-foreground border-t-transparent" />
      </div>
    );
  }
  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Mes Classes</h1>
          <p className="text-muted-foreground mt-2 text-lg">Sélectionnez une classe pour gérer les notes ou l'appel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.length === 0 ? (
          <div className="col-span-1 md:col-span-2 text-center text-muted-foreground py-12">
            Aucune classe assignée.
          </div>
        ) : classes.map((cls, i) => (
          <div
            key={cls.id}
            className="group rounded-2xl border border-border bg-background p-8 hover:border-foreground transition-all duration-300 shadow-sm"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-10.5">
                <h3 className="text-2xl font-bold tracking-tight">{cls.name}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-30.5 h-30.5" />
                    {cls.subject}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <div className="flex items-center gap-1">
                    <Users className="w-30.5 h-30.5" />
                    {cls._count?.students || 0} Élèves
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link href={`/dashboard/teacher/attendance?class=${cls.id}`} className="w-full">
                <Button variant="outline" className="w-full rounded-lg h-10 gap-2 border-border hover:bg-muted font-medium transition-all">
                  <ClipboardCheck className="w-4 h-4" />
                  Faire l'appel
                </Button>
              </Link>
              <Link href={`/dashboard/teacher/gradebook?class=${cls.id}`} className="w-full">
                <Button variant="outline" className="w-full rounded-lg h-10 gap-2 border-border hover:bg-muted font-medium transition-all">
                  <GraduationCap className="w-4 h-4" />
                  Saisir les notes
                </Button>
              </Link>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Dernière activité: Hier 15:45</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
