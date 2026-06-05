"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  
  
  
  
  Target,
  ArrowRight,
  Loader2,
  Calculator
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
import { useAuth } from "@/context/AuthContext";

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [averages, setAverages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulator state
  const [simSubjectId, setSimSubjectId] = useState<string>("");
  const [simTarget, setSimTarget] = useState<number>(10);
  const [simCoeff, setSimCoeff] = useState<number>(1);
  const [simNeeded, setSimNeeded] = useState<number | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!user?.id) return;
      try {
        const response = await axios.get(`${API}/grades/averages/${user.id}`);
        setAverages(response.data);
        if (response.data.length > 0) {
          setSimSubjectId(response.data[0].subjectId);
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, [user]);

  useEffect(() => {
    if (!simSubjectId || !averages) {
      setSimNeeded(null);
      return;
    }
    const subj = averages.find(a => a.subjectId === simSubjectId);
    if (!subj) return;

    // target = (sum + needed * coeff) / (totalCoeff + coeff)
    // needed = (target * (totalCoeff + coeff) - sum) / coeff
    const totalC = subj.totalCoeff || 0;
    const totalS = subj.sum || 0;
    
    if (simCoeff > 0) {
      const needed = ((simTarget * (totalC + simCoeff)) - totalS) / simCoeff;
      setSimNeeded(Number(needed.toFixed(2)));
    }
  }, [simSubjectId, simTarget, simCoeff, averages]);

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Mes Résultats</h1>
          <p className="text-muted-foreground mt-2 text-lg">Moyennes réelles calculées depuis MySQL.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-border rounded-3xl overflow-hidden bg-background shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="py-5 pl-8 font-bold text-foreground">Matière</TableHead>
                <TableHead className="text-center font-bold text-foreground">Moyenne</TableHead>
                <TableHead className="text-right pr-8 font-bold text-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {averages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-muted-foreground italic font-medium">Aucune note saisie pour le moment.</TableCell>
                </TableRow>
              ) : (
                averages.map((avg, i) => (
                  <TableRow key={i} className="hover:bg-muted/30 transition-all border-b border-border/50 last:border-0 h-auto py-4">
                    <TableCell className="pl-8 py-4">
                      <div className="font-bold text-sm mb-2">{avg.subject}</div>
                      <div className="flex flex-wrap gap-2">
                        {avg.grades?.map((g: any, j: number) => (
                          <div key={j} className="inline-flex flex-col bg-muted/50 border border-border px-3 py-1.5 rounded-lg text-xs">
                            <span className="font-medium text-muted-foreground">{g.comment}</span>
                            <span className="font-bold">{g.value}/20 <span className="text-muted-foreground text-[10px] ml-1">(Coef. {g.coefficient})</span></span>
                          </div>
                        ))}
                        {(!avg.grades || avg.grades.length === 0) && (
                          <span className="text-xs text-muted-foreground italic">Aucune note</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-black text-lg">{avg.average}</TableCell>
                    <TableCell className="text-right pr-8">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        Number.parseFloat(avg.average) >= 10 ? 'border-green-500/50 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'border-red-500/50 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                      }`}>
                        {Number.parseFloat(avg.average) >= 10 ? 'Validé' : 'Échec'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-3xl border border-border bg-gradient-to-br from-background to-muted/20 flex flex-col h-full shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Simulateur de Note</h3>
            </div>
            <p className="text-muted-foreground font-medium mb-8 leading-relaxed text-sm">
              Tu veux atteindre une moyenne précise ? Calcule la note que tu dois obtenir au prochain contrôle.
            </p>

            <div className="space-y-5 flex-1">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Matière</label>
                <select 
                  className="w-full h-12 rounded-xl px-4 border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none font-bold"
                  value={simSubjectId}
                  onChange={e => setSimSubjectId(e.target.value)}
                >
                  <option value="" disabled>-- Choisir une matière --</option>
                  {averages.map(a => (
                    <option key={a.subjectId} value={a.subjectId}>{a.subject} (Moyenne actuelle: {a.average})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Note ciblée (/20)</label>
                  <input 
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    value={simTarget}
                    onChange={e => setSimTarget(Number(e.target.value))}
                    className="w-full h-12 rounded-xl px-4 border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none font-bold text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Coeff. du contrôle</label>
                  <input 
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={simCoeff}
                    onChange={e => setSimCoeff(Number(e.target.value))}
                    className="w-full h-12 rounded-xl px-4 border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none font-bold text-lg"
                  />
                </div>
              </div>

              {simNeeded !== null && (
                <div className={`mt-6 p-6 rounded-2xl border ${simNeeded > 20 ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400' : simNeeded < 0 ? 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/20 dark:border-green-900 dark:text-green-400' : 'bg-primary/5 border-primary/20 text-foreground'}`}>
                  <h4 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Note à obtenir au prochain contrôle</h4>
                  {simNeeded > 20 ? (
                    <p className="text-xl font-black">Impossible ({simNeeded}/20)</p>
                  ) : simNeeded < 0 ? (
                    <p className="text-xl font-black">Tu l'as déjà atteinte !</p>
                  ) : (
                    <p className="text-4xl font-black">{simNeeded} <span className="text-lg opacity-70">/20</span></p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

