"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Loader2, Clock, MapPin, User as UserIcon, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const SESSIONS = ["08:00-10:00", "10:00-12:00", "14:00-16:00", "16:00-18:00"];

export default function StudentSchedulePage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [period, setPeriod] = useState("Standard");

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [schRes, absRes, exmRes] = await Promise.all([
          axios.get(`${API}/timetable/mine?userId=${user?.id}&role=${user?.role}&period=${period}`, { headers }),
          axios.get(`${API}/absences?schoolId=${user?.schoolId}`, { headers }),
          axios.get(`${API}/exams/class/${(user as any)?.student?.classId || (user as any)?.classId || 'none'}`, { headers })
        ]);
        setSchedule(schRes.data);
        setAbsences(absRes.data);
        setExams(exmRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [token, period, user?.id, user?.role]);

  const getCell = (day: string, time: string) => {
    const [start, end] = time.split("-");
    return schedule.find(s => s.day === day && s.startTime === start && s.endTime === end);
  };

  const weekLabel = () => {
    const now = new Date();
    const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 1);
    const end = new Date(start); end.setDate(start.getDate() + 4);
    return { 
      label: `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} — ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      start
    };
  };

  const isTeacherAbsent = (teacherId: string, dayName: string) => {
    const startOfWeek = weekLabel().start;
    const dayIndex = DAYS.indexOf(dayName);
    const cellDate = new Date(startOfWeek);
    cellDate.setDate(startOfWeek.getDate() + dayIndex);
    const cellDateStr = cellDate.toISOString().split('T')[0];

    return absences.some(abs => {
      const absDateStr = new Date(abs.date).toISOString().split('T')[0];
      return abs.teacherId === teacherId && absDateStr === cellDateStr;
    });
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Mon Emploi du temps</h1>
          <p className="text-muted-foreground mt-2 text-lg flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Semaine du {weekLabel().label}
          </p>
        </div>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-xl h-12 px-4 border border-border bg-background font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
        >
          <option value="Standard">Période : Standard</option>
          <option value="Semestre 1">Période : Semestre 1</option>
          <option value="Semestre 2">Période : Semestre 2</option>
          <option value="Ramadan">Période : Ramadan</option>
          <option value="Été">Période : Été</option>
        </select>
      </div>

      {exams.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold flex items-center gap-2 text-primary mb-4">
            <BookOpen className="w-5 h-5" /> Annonces d'Examens à venir
          </h3>
          <div className="flex flex-wrap gap-4">
            {exams.map(ex => (
              <div key={ex.id} className="bg-background border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {new Date(ex.date).getDate()}
                </div>
                <div>
                  <p className="font-bold text-sm">{ex.title}</p>
                  <p className="text-xs text-muted-foreground">{ex.subject?.name} - {new Date(ex.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card className="rounded-3xl border border-border bg-background shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr>
                <th className="p-4 border-b border-r border-border bg-muted/50 w-24">
                  <Clock className="w-5 h-5 text-muted-foreground mx-auto" />
                </th>
                {DAYS.map(day => (
                  <th key={day} className="p-4 border-b border-r border-border bg-muted/20 text-center w-48">
                    <span className="font-bold text-base">{day}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SESSIONS.map((session, i) => (
                <tr key={session} className="hover:bg-muted/5 transition-colors">
                  <td className="p-4 border-b border-r border-border bg-muted/10 text-center font-bold text-sm text-muted-foreground">
                    {session.replace("-", " - ")}
                  </td>
                  {DAYS.map(day => {
                    const cell = getCell(day, session);
                    // Skip afternoon sessions for Saturday
                    if (day === "Samedi" && i >= 2) {
                      return <td key={`${day}-${session}`} className="p-3 border-b border-r border-border bg-muted/30"></td>;
                    }

                    const isAbsent = cell?.teacherId ? isTeacherAbsent(cell.teacherId, day) : false;

                    return (
                      <td key={`${day}-${session}`} className="p-3 border-b border-r border-border h-32 align-top">
                        {cell ? (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`h-full rounded-xl border p-3 flex flex-col justify-between group transition-all duration-300 ${isAbsent ? 'bg-destructive/10 border-destructive/30 hover:bg-destructive hover:text-white' : 'bg-primary/10 border-primary/20 hover:bg-primary hover:text-primary-foreground'}`}>
                            <div>
                              <p className={`font-bold text-sm leading-tight transition-colors ${isAbsent ? 'text-destructive group-hover:text-white' : 'text-primary group-hover:text-primary-foreground'}`}>
                                {cell.subject?.name}
                              </p>
                              {isAbsent && (
                                <span className="inline-block mt-1 bg-destructive text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">Annulé</span>
                              )}
                            </div>
                            <div className="space-y-1.5 mt-3">
                              {cell.teacher && (
                                <p className={`text-[11px] flex items-center gap-1.5 transition-colors ${isAbsent ? 'text-destructive/80 group-hover:text-white/90' : 'text-muted-foreground group-hover:text-primary-foreground/80'}`}>
                                  <UserIcon className="w-3 h-3" /> {cell.teacher.user?.firstName} {cell.teacher.user?.lastName}
                                </p>
                              )}
                              {cell.room && (
                                <p className={`text-[11px] flex items-center gap-1.5 transition-colors ${isAbsent ? 'text-destructive/80 group-hover:text-white/90' : 'text-muted-foreground group-hover:text-primary-foreground/80'}`}>
                                  <MapPin className="w-3 h-3" /> {cell.room?.name}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ) : (
                          <div className="w-full h-full rounded-xl border border-dashed border-border/50 flex items-center justify-center">
                            <span className="text-[10px] text-muted-foreground/30 font-medium uppercase tracking-widest">Libre</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
