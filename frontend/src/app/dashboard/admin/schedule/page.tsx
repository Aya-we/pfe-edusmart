"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, CalendarDays, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const DAYS = [
  { name: "Lundi", sessions: [{ s: "08:00", e: "10:00" }, { s: "10:00", e: "12:00" }, { s: "14:00", e: "16:00" }, { s: "16:00", e: "18:00" }] },
  { name: "Mardi", sessions: [{ s: "08:00", e: "10:00" }, { s: "10:00", e: "12:00" }, { s: "14:00", e: "16:00" }, { s: "16:00", e: "18:00" }] },
  { name: "Mercredi", sessions: [{ s: "08:00", e: "10:00" }, { s: "10:00", e: "12:00" }, { s: "14:00", e: "16:00" }, { s: "16:00", e: "18:00" }] },
  { name: "Jeudi", sessions: [{ s: "08:00", e: "10:00" }, { s: "10:00", e: "12:00" }, { s: "14:00", e: "16:00" }, { s: "16:00", e: "18:00" }] },
  { name: "Vendredi", sessions: [{ s: "08:00", e: "10:00" }, { s: "10:00", e: "12:00" }, { s: "14:00", e: "16:00" }, { s: "16:00", e: "18:00" }] },
  { name: "Samedi", sessions: [{ s: "08:00", e: "10:00" }, { s: "10:00", e: "12:00" }] },
];

export default function AdminSchedulePage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  // State structure: schedule[classId][`${day}|${s}-${e}`] = { subjectId, roomId, teacherId }
  const [schedule, setSchedule] = useState<Record<string, Record<string, any>>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.schoolId || !token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [clsRes, subRes, tchRes, roomRes, ttRes] = await Promise.all([
          axios.get(`${API}/classes?schoolId=${user.schoolId}`),
          axios.get(`${API}/subjects?schoolId=${user.schoolId}`),
          axios.get(`${API}/users?role=TEACHER&schoolId=${user.schoolId}`, { headers }),
          axios.get(`${API}/rooms`, { headers }),
          axios.get(`${API}/timetable/all`, { headers })
        ]);

        setClasses(clsRes.data);
        setSubjects(subRes.data);
        // We get users with role TEACHER, we need their Teacher ID
        // Wait, the timetable needs `teacherId` (from Teacher model), not User ID!
        // So we need to fetch teachers properly.
        // If /users?role=TEACHER returns Users, we need their teacher.id
        const tchs = tchRes.data.map((u: any) => ({
          id: u.teacher?.id || u.id, // Fallback if no teacher profile somehow
          name: `${u.firstName} ${u.lastName}`
        }));
        setTeachers(tchs);
        setRooms(roomRes.data);

        // Load existing schedule
        const newSchedule: any = {};
        clsRes.data.forEach((c: any) => { newSchedule[c.id] = {}; });

        if (ttRes.data && Array.isArray(ttRes.data)) {
          ttRes.data.forEach((tt: any) => {
            if (!newSchedule[tt.classId]) newSchedule[tt.classId] = {};
            const key = `${tt.day}|${tt.startTime}-${tt.endTime}`;
            newSchedule[tt.classId][key] = {
              subjectId: tt.subjectId || "",
              roomId: tt.roomId || "",
              teacherId: tt.teacherId || "",
            };
          });
        }
        setSchedule(newSchedule);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, token]);

  const handleCellChange = (classId: string, day: string, s: string, e: string, field: string, value: string) => {
    const key = `${day}|${s}-${e}`;
    setSchedule(prev => {
      const clsSched = { ...(prev[classId] || {}) };
      const cell = { ...(clsSched[key] || {}) };
      cell[field] = value;
      clsSched[key] = cell;
      return { ...prev, [classId]: clsSched };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const entries: any[] = [];
      Object.keys(schedule).forEach(classId => {
        Object.keys(schedule[classId]).forEach(key => {
          const cell = schedule[classId][key];
          if (cell.subjectId && cell.teacherId) {
            const [day, times] = key.split("|");
            const [startTime, endTime] = times.split("-");
            entries.push({
              classId,
              day,
              startTime,
              endTime,
              subjectId: cell.subjectId,
              teacherId: cell.teacherId,
              roomId: cell.roomId || null,
            });
          }
        });
      });

      await axios.post(`${API}/timetable/bulk`, entries, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la sauvegarde de l'emploi du temps.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Emploi du temps</h1>
          <p className="text-muted-foreground mt-2 text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5" /> Générateur Manuel
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="rounded-xl h-12 px-8 font-bold bg-primary text-primary-foreground gap-2 shadow-xl shadow-primary/20"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? "Sauvegarde..." : "Valider l'emploi du temps"}
        </Button>
      </div>

      <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-max">
            <thead>
              <tr>
                <th className="p-4 border-b border-r border-border bg-muted/50 sticky left-0 z-20 shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#1e293b]">
                  <span className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Classes \ Séances</span>
                </th>
                {DAYS.map(day => (
                  <th key={day.name} colSpan={day.sessions.length} className="p-3 border-b border-r border-border bg-muted/20 text-center">
                    <span className="font-bold text-base">{day.name}</span>
                  </th>
                ))}
              </tr>
              <tr>
                <th className="p-2 border-b border-r border-border bg-muted/50 sticky left-0 z-20 shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#1e293b]"></th>
                {DAYS.map(day => (
                  day.sessions.map((ses, i) => (
                    <th key={`${day.name}-${i}`} className="p-2 border-b border-r border-border bg-muted/10 text-center min-w-[160px]">
                      <span className="text-xs font-bold text-muted-foreground">{ses.s} - {ses.e}</span>
                    </th>
                  ))
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.map(cls => (
                <tr key={cls.id} className="hover:bg-muted/5 group">
                  <td className="p-4 border-b border-r border-border font-bold sticky left-0 bg-background group-hover:bg-muted/5 z-10 shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#1e293b]">
                    {cls.name}
                  </td>
                  {DAYS.map(day => (
                    day.sessions.map((ses, i) => {
                      const key = `${day.name}|${ses.s}-${ses.e}`;
                      const cell = schedule[cls.id]?.[key] || {};
                      return (
                        <td key={`${cls.id}-${day.name}-${i}`} className="p-2 border-b border-r border-border min-w-[180px] bg-white dark:bg-background">
                          <div className="flex flex-col gap-1.5">
                            <select 
                              className="w-full text-xs p-1.5 rounded bg-muted/30 border border-border focus:outline-none focus:border-primary/50"
                              value={cell.subjectId || ""}
                              onChange={e => handleCellChange(cls.id, day.name, ses.s, ses.e, "subjectId", e.target.value)}
                            >
                              <option value="">-- Matière --</option>
                              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>

                            <select 
                              className="w-full text-xs p-1.5 rounded bg-muted/30 border border-border focus:outline-none focus:border-primary/50"
                              value={cell.roomId || ""}
                              onChange={e => handleCellChange(cls.id, day.name, ses.s, ses.e, "roomId", e.target.value)}
                            >
                              <option value="">-- Salle --</option>
                              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>

                            <select 
                              className="w-full text-xs p-1.5 rounded bg-muted/30 border border-border focus:outline-none focus:border-primary/50"
                              value={cell.teacherId || ""}
                              onChange={e => handleCellChange(cls.id, day.name, ses.s, ses.e, "teacherId", e.target.value)}
                            >
                              <option value="">-- Prof --</option>
                              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                          </div>
                        </td>
                      );
                    })
                  ))}
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan={23} className="p-10 text-center text-muted-foreground">Aucune classe trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-10 right-10 z-50 flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 shadow-2xl dark:bg-green-950/30 dark:border-green-900 dark:text-green-400">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="font-bold text-sm">Emploi du temps enregistré avec succès !</p>
        </motion.div>
      )}
    </div>
  );
}
