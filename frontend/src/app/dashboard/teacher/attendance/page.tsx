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
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Save, 
  Users, 
  Calendar,
  MoreVertical,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

export default function AttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classesRes = await axios.get("http://localhost:4000/classes");
        setClasses(classesRes.data);
        if (classesRes.data.length > 0) {
          setSelectedClassId(classesRes.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId) return;
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:4000/attendance/class/${selectedClassId}?date=${new Date().toISOString()}`);
        setStudents(response.data.map((s: any) => ({
          ...s,
          status: s.attendance?.status || "PRESENT"
        })));
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClassId]);

  const handleStatusChange = (studentId: string, newStatus: string) => {
    setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, status: newStatus } : s));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post("http://localhost:4000/attendance/bulk", {
        date: new Date().toISOString(),
        classId: selectedClassId,
        records: students.map(s => ({
          studentId: s.studentId,
          status: s.status
        }))
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
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Faire l'appel</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} • Appel en temps réel
          </p>
        </div>

        <Button 
          className="rounded-lg h-10 bg-foreground text-background hover:bg-foreground/90 transition-all px-8 gap-2" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer l'appel
        </Button>
      </div>

      <div className="flex items-center gap-4">
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
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-background shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="py-4 pl-8 font-bold text-foreground">Élève</TableHead>
              <TableHead className="text-center font-bold text-foreground">Statut</TableHead>
              <TableHead className="text-right pr-8 font-bold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.studentId} className="hover:bg-muted/30 transition-all border-b border-border/50 last:border-0 h-20">
                <TableCell className="pl-8">
                  <p className="text-sm font-bold">{student.lastName} {student.firstName}</p>
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    "text-[10px] font-bold px-3 py-1 rounded border uppercase tracking-tighter",
                    student.status === "PRESENT" ? "border-foreground bg-foreground text-background" : 
                    student.status === "ABSENT" ? "border-destructive text-destructive" : "border-border bg-muted text-muted-foreground"
                  )}>
                    {student.status}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex items-center justify-end gap-1">
                    {["PRESENT", "ABSENT", "LATE"].map((status) => (
                      <Button 
                        key={status}
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleStatusChange(student.studentId, status)}
                        className={cn("h-8 rounded-md px-3 text-xs font-bold", student.status === status ? "bg-foreground text-background hover:bg-foreground/90" : "text-muted-foreground hover:bg-muted")}
                      >
                        {status[0]}
                      </Button>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
