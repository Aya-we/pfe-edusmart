"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle2, 
  Save, 
  Users, 
  Loader2,
  Calendar as CalendarIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export default function AttendancePage() {
  const { user } = useAuth();
  
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  
  // Nouveaux états pour le timetable
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (!user) return;
        const classesRes = await axios.get(`${API}/classes/teacher/${user.id}`);
        setClasses(classesRes.data);
        if (classesRes.data.length > 0) {
          setSelectedClassId(classesRes.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    const fetchDataForDate = async () => {
      if (!selectedClassId || !user) return;
      setLoading(true);
      try {
        // 1. Fetch timetable for the teacher
        const timetableRes = await axios.get(`${API}/timetable/teacher/${user.id}`);
        // Filtrer pour le jour sélectionné et la classe sélectionnée
        const selectedDate = new Date(date);
        const dayString = DAYS[selectedDate.getDay()];
        
        const dayTimetables = timetableRes.data
          .filter((t: any) => t.day === dayString && t.classId === selectedClassId)
          .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
          
        setTimetables(dayTimetables);

        // 2. Fetch students and their attendances for the date
        const response = await axios.get(`${API}/attendance/class/${selectedClassId}?date=${new Date(date).toISOString()}`);
        
        // Formater les étudiants
        setStudents(response.data.map((s: any) => {
          // Transformer le tableau d'absences en un dictionnaire { timetableId: status }
          const attendanceMap: Record<string, string> = {};
          
          if (s.attendances && Array.isArray(s.attendances)) {
            s.attendances.forEach((att: any) => {
              if (att.timetableId) {
                attendanceMap[att.timetableId] = att.status;
              }
            });
          }
          
          return {
            ...s,
            attendanceMap // { "timetableId1": "PRESENT", "timetableId2": "ABSENT" }
          };
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDataForDate();
  }, [selectedClassId, date, user]);

  const handleStatusChange = (studentId: string, timetableId: string, newStatus: string) => {
    setStudents(prev => prev.map(s => {
      if (s.studentId === studentId) {
        return {
          ...s,
          attendanceMap: {
            ...s.attendanceMap,
            [timetableId]: newStatus
          }
        };
      }
      return s;
    }));
  };

  const handleSave = async (timetableId: string) => {
    setIsSaving(true);
    try {
      // Filtrer les étudiants qui ont un statut défini pour cette séance
      const recordsToSave = students
        .filter(s => s.attendanceMap[timetableId])
        .map(s => ({
          studentId: s.studentId,
          status: s.attendanceMap[timetableId]
        }));
        
      if (recordsToSave.length === 0) {
        alert("Veuillez sélectionner au moins un statut avant de sauvegarder.");
        setIsSaving(false);
        return;
      }

      await axios.post(`${API}/attendance/bulk`, {
        date: new Date(date).toISOString(),
        classId: selectedClassId,
        timetableId: timetableId,
        records: recordsToSave
      });
      setTimeout(() => setIsSaving(false), 2000);
    } catch (error) {
      console.error("Error saving attendance:", error);
      setIsSaving(false);
    }
  };

  if (loading && classes.length === 0) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Faire l'appel</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Gérez les absences par séance
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Sélecteur de Classe */}
        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
          <Users className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedClassId} onValueChange={(val) => setSelectedClassId(val || "")}>
            <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0 p-0 h-auto font-bold text-sm w-fit">
              <SelectValue placeholder="Classe" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sélecteur de Date */}
        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="border-none bg-transparent shadow-none focus:ring-0 p-0 h-auto font-bold text-sm w-fit cursor-pointer"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center border border-dashed rounded-xl border-border">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : timetables.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 border border-dashed rounded-xl border-border gap-2 bg-muted/20">
          <CalendarIcon className="w-8 h-8 text-muted-foreground/50" />
          <p className="text-muted-foreground font-bold text-sm">
            Vous n'avez aucune séance programmée pour cette classe le {DAYS[new Date(date).getDay()]}.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {timetables.map((session) => (
            <div key={session.id} className="border border-border rounded-xl overflow-hidden bg-background shadow-sm">
              {/* Header de la séance */}
              <div className="bg-muted/50 border-b border-border p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{session.subject?.name || "Matière"}</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {session.startTime} - {session.endTime}
                  </p>
                </div>
                <Button 
                  className="rounded-lg h-9 bg-foreground text-background hover:bg-foreground/90 transition-all px-4 gap-2 text-xs font-bold" 
                  onClick={() => handleSave(session.id)}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Enregistrer cette séance
                </Button>
              </div>

              {/* Tableau d'appel de la séance */}
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border">
                    <TableHead className="py-3 pl-6 font-bold text-foreground">Élève</TableHead>
                    <TableHead className="text-center font-bold text-foreground">Statut Actuel</TableHead>
                    <TableHead className="text-right pr-6 font-bold text-foreground">Modifier le statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    // Si on a pas encore coché, on met PRESENT par défaut visuellement
                    const currentStatus = student.attendanceMap[session.id] || "PRESENT";
                    
                    return (
                      <TableRow key={student.studentId} className="hover:bg-muted/30 transition-all border-b border-border/50 last:border-0 h-16">
                        <TableCell className="pl-6">
                          <p className="text-sm font-bold">{student.lastName} {student.firstName}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "text-[10px] font-bold px-3 py-1 rounded border uppercase tracking-tighter",
                            currentStatus === "PRESENT" ? "border-foreground bg-foreground text-background" : 
                            currentStatus === "ABSENT" ? "border-destructive text-destructive" : "border-amber-500 text-amber-500 bg-amber-500/10"
                          )}>
                            {currentStatus}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            {["PRESENT", "ABSENT", "LATE"].map((status) => (
                              <Button 
                                key={status}
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleStatusChange(student.studentId, session.id, status)}
                                className={cn(
                                  "h-8 rounded-md px-3 text-xs font-bold", 
                                  currentStatus === status 
                                    ? "bg-foreground text-background hover:bg-foreground/90" 
                                    : "text-muted-foreground hover:bg-muted"
                                )}
                              >
                                {status === "LATE" ? "RETARD" : status}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 text-sm font-bold"
          >
            <CheckCircle2 className="w-4 h-4" />
            Appel enregistré
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
