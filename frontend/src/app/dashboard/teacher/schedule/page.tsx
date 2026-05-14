"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, ExternalLink, Calendar, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

const API = "http://localhost:4000";

export default function TeacherSchedulePage() {
  const [status,   setStatus]   = useState<"loading" | "available" | "unavailable">("loading");
  const [filename, setFilename] = useState<string | null>(null);
  const pdfUrl = `${API}/timetable-upload/teachers`;

  const check = async () => {
    setStatus("loading");
    try {
      const res = await axios.get(`${API}/timetable-upload/check/teachers`);
      if (res.data.available) { setFilename(res.data.filename); setStatus("available"); }
      else setStatus("unavailable");
    } catch { setStatus("unavailable"); }
  };

  useEffect(() => { check(); }, []);

  const weekLabel = () => {
    const now = new Date();
    const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 1);
    const end = new Date(start); end.setDate(start.getDate() + 4);
    return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} — ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Mon Emploi du temps</h1>
          <p className="text-muted-foreground mt-2 text-lg flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Semaine du {weekLabel()}
          </p>
        </div>
        <Button variant="outline" className="rounded-xl h-10 gap-2" onClick={check}>
          <RefreshCw className="w-4 h-4" /> Actualiser
        </Button>
      </div>

      {status === "loading" && <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>}

      {status === "unavailable" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="h-64 flex flex-col items-center justify-center gap-4 text-center">
          <div className="p-4 rounded-2xl bg-muted"><AlertCircle className="w-10 h-10 text-muted-foreground" /></div>
          <div>
            <p className="font-bold text-xl">Emploi du temps non disponible</p>
            <p className="text-muted-foreground mt-1 text-sm">L'administration n'a pas encore publié l'emploi du temps de cette semaine.</p>
          </div>
        </motion.div>
      )}

      {status === "available" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="rounded-2xl border border-border bg-background">
            <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-foreground text-background"><FileText className="w-5 h-5" /></div>
                <div>
                  <p className="font-bold">Emploi du temps — Professeurs</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{filename}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <a href={pdfUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="rounded-xl h-10 gap-2 text-sm font-bold"><ExternalLink className="w-4 h-4" /> Ouvrir</Button>
                </a>
                <a href={pdfUrl} download>
                  <Button className="rounded-xl h-10 gap-2 text-sm font-bold bg-foreground text-background"><Download className="w-4 h-4" /> Télécharger</Button>
                </a>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border bg-background overflow-hidden shadow-sm">
            <CardContent className="p-0">
              <iframe src={`${pdfUrl}#toolbar=0`} className="w-full" style={{ height: "75vh", minHeight: 500 }} title="Mon emploi du temps" />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
