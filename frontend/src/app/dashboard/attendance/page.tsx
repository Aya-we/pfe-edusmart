"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ClipboardCheck, 
  AlertCircle, 
  CheckCircle2, 
  Calendar as CalendarIcon,
  Clock,
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

const API = process.env.NEXT_PUBLIC_API_URL || "${API}";
import { useAuth } from "@/context/AuthContext";

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [absences, setAbsences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user?.id) return;
      try {
        const response = await axios.get(`${API}/attendance/student/${user.id}`);
        setAbsences(response.data);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [user]);

  const handleJustify = async (id: string) => {
    // Simulation d'upload pour le moment, mais l'API est là
    const fileUrl = "certificat_medical.jpg"; 
    try {
      await axios.post(`${API}/attendance/${id}/submit-justification`, { fileUrl });
      alert("Demande de justification envoyée !");
      // Re-fetch data
      const response = await axios.get(`${API}/attendance/student/${user?.id}`);
      setAbsences(response.data);
    } catch (error) {
      alert("Erreur lors de l'envoi.");
    }
  };

  const totalHours = absences.filter(a => a.status === 'ABSENT').length * 2; // On assume 2h par séance
  const unjustifiedHours = absences.filter(a => a.status === 'ABSENT' && !a.justified).length * 2;

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Mes Présences</h1>
          <p className="text-muted-foreground mt-2 text-lg">Suivi en temps réel depuis la base de données.</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Absences</p>
            <p className="text-3xl font-black">{totalHours}h</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-1">Non Justifiées</p>
            <p className="text-3xl font-black text-destructive">{unjustifiedHours}h</p>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden bg-background shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="py-4 pl-6 text-foreground text-xs uppercase tracking-wider font-bold">Date</TableHead>
              <TableHead className="text-foreground text-xs uppercase tracking-wider font-bold">Statut</TableHead>
              <TableHead className="text-right pr-6 text-foreground text-xs uppercase tracking-wider font-bold">Justification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {absences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">Aucune absence enregistrée. Félicitations ! 🎉</TableCell>
              </TableRow>
            ) : (
              absences.map((absence) => (
                <TableRow key={absence.id} className="hover:bg-muted/30 transition-all border-b border-border/50 last:border-0 h-16">
                  <TableCell className="pl-6 font-bold text-sm">
                    {new Date(absence.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      absence.status === 'PRESENT'
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900'
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900'
                    }`}>
                      {absence.status === 'PRESENT' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {absence.status === 'PRESENT' ? 'Présent' : 'Absent'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {absence.status === 'ABSENT' && (
                      <div className="flex flex-col items-end gap-2">
                        {absence.justified ? (
                          <div className="flex items-center gap-2 text-green-600 text-[10px] font-black uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Justifiée
                          </div>
                        ) : absence.justification ? (
                          <span className="text-orange-500 text-[10px] font-black uppercase italic">En cours de validation...</span>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-[9px] font-bold uppercase tracking-widest border-foreground hover:bg-foreground hover:text-background transition-all"
                            onClick={() => handleJustify(absence.id)}
                          >
                            Justifier (Upload)
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

