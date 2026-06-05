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

// Créneaux horaires fixes demandés
const TIME_SLOTS = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00"
];

const STATUS_COLORS: Record<string, string> = {
  "PRESENT": "bg-emerald-500/10 text-emerald-600 font-bold",
  "ABSENT":  "bg-red-500/10 text-red-600 font-bold",
  "LATE":    "bg-amber-500/10 text-amber-600 font-bold",
};

const STATUS_LABELS: Record<string, string> = {
  "PRESENT": "P",
  "ABSENT":  "A",
  "LATE":    "R",
};

const NEXT_STATUS: Record<string, string> = {
  "PRESENT": "ABSENT",
  "ABSENT":  "LATE",
  "LATE":    "PRESENT"
};

export default function AttendancePage() {
  const { user } = useAuth();
  
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  
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
        const response = await axios.get(`${API}/attendance/class/${selectedClassId}?date=${new Date(date).toISOString()}`);
        
        setStudents(response.data.map((s: any) => {
          const attendanceMap: Record<string, string> = {};
          if (s.attendances && Array.isArray(s.attendances)) {
            s.attendances.forEach((att: any) => {
              if (att.timeSlot) {
                attendanceMap[att.timeSlot] = att.status;
              }
            });
          }
          return { ...s, attendanceMap };
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDataForDate();
  }, [selectedClassId, date, user]);

  const toggleStatus = (studentId: string, slot: string) => {
    setStudents(prev => prev.map(s => {
      if (s.studentId === studentId) {
        const current = s.attendanceMap[slot] || "PRESENT";
        return {
          ...s,
          attendanceMap: {
            ...s.attendanceMap,
            [slot]: NEXT_STATUS[current]
          }
        };
      }
      return s;
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // On va envoyer toutes les séances modifiées
      // Pour éviter de faire trop de requêtes, on boucle sur les créneaux et on sauvegarde ceux qui ont des données
      
      const promises = TIME_SLOTS.map(slot => {
        // On récupère le statut de TOUS les étudiants pour ce créneau (par défaut PRESENT)
        const allRecords = students.map(s => ({
          studentId: s.studentId,
          status: s.attendanceMap[slot] || "PRESENT"
        }));

        // On vérifie s'il y a au moins UNE modification dans ce créneau par rapport au défaut
        // OU si on veut forcer la sauvegarde de toute la grille, on envoie tout.
        // Pour répondre au besoin "Tout enregistrer", on envoie tous les créneaux où au moins 
        // un étudiant a été cliqué, OU BIEN on envoie vraiment toute la grille.
        // Puisque le prof s'attend à ce que "Tout enregistrer" sauvegarde l'état visuel,
        // on envoie tous les records pour ce slot s'il décide de sauvegarder.
        // On sauvegarde systématiquement le créneau si le prof clique sur "Tout Enregistrer".
        // Le prof s'attend à ce que l'état visuel entier (y compris les P par défaut) soit persisté
        // pour qu'il puisse prouver qu'il a bien fait l'appel (même si tout le monde est présent).
        
        return axios.post(`${API}/attendance/bulk`, {
          date: new Date(date).toISOString(),
          classId: selectedClassId,
          timeSlot: slot,
          records: allRecords
        });
      });

      await Promise.all(promises);
      
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
    <div className="space-y-10 max-w-[1400px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Tableau d'Appel</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Cliquez sur les cases pour changer le statut (P = Présent, A = Absent, R = Retard)
          </p>
        </div>
        
        <Button 
          className="rounded-lg h-11 bg-primary text-primary-foreground hover:bg-foreground/90 transition-all px-8 gap-2 font-bold" 
          onClick={handleSaveAll}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Tout Enregistrer
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
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
      ) : (
        <div className="border border-border rounded-xl overflow-x-auto bg-background shadow-sm">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="py-4 pl-6 font-bold text-foreground w-[250px] sticky left-0 bg-background/95 backdrop-blur z-10 border-r border-border">
                  Élève
                </TableHead>
                {TIME_SLOTS.map(slot => (
                  <TableHead key={slot} className="text-center font-bold text-foreground text-xs whitespace-nowrap">
                    {slot.replace(" - ", "\n")}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.studentId} className="hover:bg-muted/10 transition-colors border-b border-border/50 h-14">
                  <TableCell className="pl-6 sticky left-0 bg-background/95 backdrop-blur z-10 border-r border-border font-bold text-sm">
                    {student.lastName} {student.firstName}
                  </TableCell>
                  
                  {TIME_SLOTS.map(slot => {
                    const status = student.attendanceMap[slot] || "PRESENT";
                    return (
                      <TableCell 
                        key={slot} 
                        className="text-center p-1"
                      >
                        <button
                          onClick={() => toggleStatus(student.studentId, slot)}
                          className={cn(
                            "w-full h-10 rounded-md transition-all flex items-center justify-center cursor-pointer select-none border border-transparent hover:border-border",
                            STATUS_COLORS[status]
                          )}
                        >
                          {STATUS_LABELS[status]}
                        </button>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AnimatePresence>
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 text-sm font-bold"
          >
            <CheckCircle2 className="w-4 h-4" />
            Appel enregistré avec succès
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
