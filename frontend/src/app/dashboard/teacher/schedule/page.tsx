"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Loader2, Clock, MapPin, Users as UsersIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const SESSIONS = ["08:00-10:00", "10:00-12:00", "14:00-16:00", "16:00-18:00"];

export default function TeacherSchedulePage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [period, setPeriod] = useState("Standard");
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [schRes, absRes, periodsRes] = await Promise.all([
          axios.get(`${API}/timetable/mine?userId=${user?.id}&role=${user?.role}&period=${period}`, { headers }),
          axios.get(`${API}/absences?schoolId=${user?.schoolId}`, { headers }),
          axios.get(`${API}/timetable/periods?schoolId=${user?.schoolId}`, { headers })
        ]);
        setSchedule(schRes.data);
        setAbsences(absRes.data);
        setAvailablePeriods(periodsRes.data);
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
        <div className="flex gap-2">
          <input 
            type="text"
            list="period-options"
            placeholder="Période..."
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl h-12 px-4 border border-border bg-background font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
          <datalist id="period-options">
            {availablePeriods.map(p => (
              <option key={p} value={p} />
            ))}
            {!availablePeriods.includes("Standard") && <option value="Standard" />}
            <option value="Semestre 1" />
            <option value="Semestre 2" />
            <option value="Ramadan" />
            <option value="Été" />
          </datalist>
        </div>
      </div>

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
                              {cell.class && (
                                <p className={`text-[11px] flex items-center gap-1.5 transition-colors ${isAbsent ? 'text-destructive/80 group-hover:text-white/90' : 'text-muted-foreground group-hover:text-primary-foreground/80'}`}>
                                  <UsersIcon className="w-3 h-3" /> {cell.class?.name}
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
