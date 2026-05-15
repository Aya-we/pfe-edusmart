"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, BookOpen, Filter, Loader2, CheckCircle2, Users } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "${API}";

export default function GradebookPage() {
  const { user } = useAuth();
  const [classes,  setClasses]  = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClassId,   setSelectedClassId]   = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ── 1. Charger classes & matières ── */
  useEffect(() => {
    const init = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          axios.get(`${API}/classes`),
          axios.get(`${API}/subjects`),
        ]);
        setClasses(cRes.data);
        setSubjects(sRes.data);
        if (cRes.data[0]) setSelectedClassId(cRes.data[0].id);
        if (sRes.data[0]) setSelectedSubjectId(sRes.data[0].id);
      } catch (e) {
        console.error("Init error:", e);
      } finally {
        setLoadingInit(false);
      }
    };
    init();
  }, []);

  /* ── 2. Charger étudiants + notes quand classe/matière change ── */
  useEffect(() => {
    if (!selectedClassId || !selectedSubjectId) return;
    const fetch = async () => {
      setLoadingStudents(true);
      try {
        const [studRes, gradesRes] = await Promise.all([
          axios.get(`${API}/classes/${selectedClassId}/students`),
          axios.get(`${API}/grades/class/${selectedClassId}/subject/${selectedSubjectId}`).catch(() => ({ data: [] })),
        ]);

        const grades: any[] = gradesRes.data || [];

        setStudents(studRes.data.map((s: any) => {
          const sg = grades.filter((g: any) => g.studentId === s.id);
          return {
            id:        s.id,
            firstName: s.user?.firstName || "—",
            lastName:  s.user?.lastName  || "—",
            grades: [
              sg[0]?.value ?? "",
              sg[1]?.value ?? "",
              sg[2]?.value ?? "",
            ],
            gradeIds: [sg[0]?.id, sg[1]?.id, sg[2]?.id],
          };
        }));
      } catch (e) {
        console.error("Fetch students error:", e);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetch();
  }, [selectedClassId, selectedSubjectId]);

  /* ── 3. Modifier une note ── */
  const handleGradeChange = (studentId: string, idx: number, value: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const g = [...s.grades];
      g[idx] = value;
      return { ...s, grades: g };
    }));
  };

  /* ── 4. Enregistrer toutes les notes ── */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const calls: Promise<any>[] = [];
      students.forEach(student => {
        student.grades.forEach((val: string, idx: number) => {
          if (val === "" || isNaN(parseFloat(val))) return;
          calls.push(
            axios.post(`${API}/grades`, {
              studentId:  student.id,
              subjectId:  selectedSubjectId,
              value:      parseFloat(val),
              type:       idx === 0 ? "CC1" : idx === 1 ? "CC2" : "EXAM",
            })
          );
        });
      });
      await Promise.all(calls);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Save error:", e);
      alert("Erreur lors de l'enregistrement des notes.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Calcul moyenne ── */
  const avg = (grades: string[]) => {
    const nums = grades.filter(g => g !== "" && !isNaN(parseFloat(g))).map(parseFloat);
    return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : "—";
  };

  if (loadingInit) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Cahier de Notes</h1>
          <p className="text-muted-foreground mt-2">
            Sélectionnez une classe et une matière, saisissez les notes puis enregistrez.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || students.length === 0}
          className="rounded-lg h-11 bg-foreground text-background hover:bg-foreground/90 px-8 gap-2"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer les notes
        </Button>
      </div>

      {/* Selects */}
      <div className="flex flex-wrap gap-4">
        {/* Classe */}
        <div className="flex items-center gap-2 bg-muted/40 px-4 py-2 rounded-xl border border-border">
          <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <select
            className="bg-transparent text-sm font-bold outline-none cursor-pointer min-w-[160px]"
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
          >
            {classes.length === 0 && <option>Aucune classe</option>}
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Matière */}
        <div className="flex items-center gap-2 bg-muted/40 px-4 py-2 rounded-xl border border-border">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <select
            className="bg-transparent text-sm font-bold outline-none cursor-pointer min-w-[160px]"
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
          >
            {subjects.length === 0 && <option>Aucune matière</option>}
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {selectedClassId && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 px-4 py-2 rounded-xl border border-border">
            <Users className="w-4 h-4" />
            {loadingStudents ? "Chargement..." : `${students.length} élève(s)`}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-background shadow-sm">
        {loadingStudents ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : students.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Users className="w-8 h-8" />
            <p className="text-sm font-medium">Aucun élève dans cette classe</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="py-4 pl-8 font-bold text-foreground w-[40%]">Élève</TableHead>
                <TableHead className="text-center font-bold text-foreground">Contrôle 1</TableHead>
                <TableHead className="text-center font-bold text-foreground">Contrôle 2</TableHead>
                <TableHead className="text-center font-bold text-foreground">Examen</TableHead>
                <TableHead className="text-right pr-8 font-bold text-foreground">Moyenne</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.id} className="hover:bg-muted/20 transition-all border-b border-border/50 last:border-0 h-20">
                  <TableCell className="pl-8 font-semibold">
                    {student.lastName} {student.firstName}
                  </TableCell>
                  {student.grades.map((grade: string, idx: number) => (
                    <TableCell key={idx} className="text-center">
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        value={grade}
                        onChange={e => handleGradeChange(student.id, idx, e.target.value)}
                        placeholder="—"
                        className="w-20 mx-auto text-center rounded-xl h-10 border-border bg-muted/10 focus:bg-background focus:ring-1 focus:ring-foreground transition-all font-bold"
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-right pr-8">
                    <span className={`text-lg font-black ${parseFloat(avg(student.grades)) >= 10 ? 'text-green-600' : avg(student.grades) !== '—' ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {avg(student.grades)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Toast saved */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 font-bold"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Notes enregistrées dans MySQL !
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


