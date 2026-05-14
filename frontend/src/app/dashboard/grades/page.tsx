"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Target,
  ArrowRight,
  Loader2
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
import { useAuth } from "@/context/AuthContext";

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [averages, setAverages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!user?.id) return;
      try {
        const response = await axios.get(`http://localhost:4000/grades/averages/${user.id}`);
        setAverages(response.data);
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, [user]);

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
                  <TableRow key={i} className="hover:bg-muted/30 transition-all border-b border-border/50 last:border-0 h-20">
                    <TableCell className="pl-8 font-bold text-sm">{avg.subject}</TableCell>
                    <TableCell className="text-center font-black text-lg">{avg.average}</TableCell>
                    <TableCell className="text-right pr-8">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        parseFloat(avg.average) >= 10 ? 'border-foreground bg-foreground text-background' : 'border-destructive text-destructive'
                      }`}>
                        {parseFloat(avg.average) >= 10 ? 'Validé' : 'Échec'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-3xl border border-border bg-muted/20 flex flex-col justify-center h-full">
            <Target className="w-12 h-12 text-muted-foreground mb-6" />
            <h3 className="text-2xl font-bold mb-4 tracking-tight">Analyse Prédictive</h3>
            <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
              Basé sur tes résultats actuels, tu es en bonne voie. Continue de te concentrer sur les matières scientifiques pour maintenir ta moyenne.
            </p>
            <Button className="w-fit h-12 rounded-xl bg-foreground text-background px-8 font-bold gap-2">
              Voir le planning de révision
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
