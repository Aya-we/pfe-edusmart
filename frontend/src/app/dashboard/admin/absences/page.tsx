"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Check, 
  X, 
  Eye, 
  FileText, 
  User, 
  Calendar,
  AlertCircle,
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

export default function AdminAbsencesPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const response = await axios.get("${API}/attendance/pending");
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching pending justifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await axios.put(`${API}/attendance/${id}/${action}`);
      alert(action === 'approve' ? "Justification validée !" : "Justification refusée.");
      fetchPending();
    } catch (error) {
      alert("Erreur lors de l'action.");
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 border-b border-border pb-8">
        <h1 className="text-4xl font-bold tracking-tight">Gestion des Justifications</h1>
        <p className="text-muted-foreground text-lg">Données réelles issues de la base de données.</p>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden bg-background shadow-sm">
        <div className="p-6 border-b border-border bg-muted/20">
          <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            Demandes en attente ({requests.length})
          </h3>
        </div>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="py-4 pl-6 text-foreground text-xs uppercase tracking-wider font-bold">Élève</TableHead>
              <TableHead className="text-foreground text-xs uppercase tracking-wider font-bold">Date Absence</TableHead>
              <TableHead className="text-center text-foreground text-xs uppercase tracking-wider font-bold">Justificatif</TableHead>
              <TableHead className="text-right pr-6 text-foreground text-xs uppercase tracking-wider font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Aucune demande en attente. Tout est à jour ! ✅</TableCell>
              </TableRow>
            ) : (
              requests.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-all border-b border-border/50 last:border-0 h-20">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-[10px]">
                        {item.student.user.firstName[0]}{item.student.user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.student.user.firstName} {item.student.user.lastName}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{item.student.class.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {new Date(item.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 rounded-lg border border-border gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
                      onClick={() => window.open(item.justification, '_blank')}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Voir le fichier
                    </Button>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="icon" 
                        className="h-9 w-9 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all"
                        onClick={() => handleAction(item.id, 'approve')}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-9 w-9 rounded-xl border-border text-destructive hover:bg-destructive hover:text-white transition-all"
                        onClick={() => handleAction(item.id, 'reject')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
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

