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

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API}/timetable/mine?userId=${user?.id}&role=${user?.role}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSchedule(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [token]);

  const getCell = (day: string, time: string) => {
    const [start, end] = time.split("-");
    return schedule.find(s => s.day === day && s.startTime === start && s.endTime === end);
  };

  const weekLabel = () => {
    const now = new Date();
    const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 1);
    const end = new Date(start); end.setDate(start.getDate() + 4);
    return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} — ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Mon Emploi du temps</h1>
          <p className="text-muted-foreground mt-2 text-lg flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Semaine du {weekLabel()}
          </p>
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
                    return (
                      <td key={`${day}-${session}`} className="p-3 border-b border-r border-border h-32 align-top">
                        {cell ? (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full rounded-xl bg-primary/10 border border-primary/20 p-3 flex flex-col justify-between group hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                            <p className="font-bold text-sm leading-tight text-primary group-hover:text-primary-foreground transition-colors">{cell.subject?.name}</p>
                            <div className="space-y-1.5 mt-3">
                              {cell.class && (
                                <p className="text-[11px] flex items-center gap-1.5 font-bold text-muted-foreground group-hover:text-primary-foreground/90 transition-colors">
                                  <UsersIcon className="w-3 h-3" /> Classe: {cell.class?.name}
                                </p>
                              )}
                              {cell.room && (
                                <p className="text-[11px] flex items-center gap-1.5 text-muted-foreground group-hover:text-primary-foreground/80 transition-colors">
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
