"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload, FileText, CheckCircle2, AlertCircle,
  Loader2, Users, BookOpen, Trash2, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "${API}";

type PdfType = "students" | "teachers";

interface PdfStatus { available: boolean; filename: string | null; }

export default function AdminSchedulePage() {
  const [file,      setFile]      = useState<File | null>(null);
  const [type,      setType]      = useState<PdfType>("students");
  const [uploading, setUploading] = useState(false);
  const [status,    setStatus]    = useState<"idle" | "success" | "error">("idle");
  const [pdfs,      setPdfs]      = useState<Record<PdfType, PdfStatus>>({
    students: { available: false, filename: null },
    teachers: { available: false, filename: null },
  });

  const fetchStatus = async () => {
    const [sRes, tRes] = await Promise.all([
      axios.get(`${API}/timetable-upload/check/students`).catch(() => ({ data: { available: false, filename: null } })),
      axios.get(`${API}/timetable-upload/check/teachers`).catch(() => ({ data: { available: false, filename: null } })),
    ]);
    setPdfs({ students: sRes.data, teachers: tRes.data });
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setStatus("idle");
    try {
      const form = new FormData();
      form.append("file", file);
      await axios.post(`${API}/timetable-upload/${type}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("success");
      setFile(null);
      fetchStatus();
    } catch {
      setStatus("error");
    } finally {
      setUploading(false);
    }
  };

  const labels: Record<PdfType, { icon: any; label: string; desc: string }> = {
    students: { icon: Users,    label: "Étudiants",   desc: "Visible par tous les étudiants" },
    teachers: { icon: BookOpen, label: "Professeurs", desc: "Visible par tous les professeurs" },
  };

  return (
    <div className="space-y-10 max-w-3xl mx-auto pb-16">
      <div className="border-b border-border pb-8">
        <h1 className="text-4xl font-bold tracking-tight">Emploi du temps</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Publiez un PDF global pour les étudiants et un pour les professeurs.
        </p>
      </div>

      {/* PDFs actuels */}
      <div className="grid grid-cols-2 gap-4">
        {(["students", "teachers"] as PdfType[]).map(t => {
          const cfg = labels[t];
          const pdf = pdfs[t];
          return (
            <Card key={t} className={`rounded-2xl border overflow-hidden transition-all ${pdf.available ? "border-green-200 bg-green-50/40 dark:bg-green-950/20 dark:border-green-900" : "border-border bg-muted/10"}`}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${pdf.available ? "bg-green-100 dark:bg-green-900/40" : "bg-muted"}`}>
                    <cfg.icon className={`w-5 h-5 ${pdf.available ? "text-green-600" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{cfg.label}</p>
                    <p className="text-[10px] text-muted-foreground">{cfg.desc}</p>
                  </div>
                </div>
                {pdf.available ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 font-semibold">
                      <CheckCircle2 className="w-30.5 h-30.5" /> PDF publié
                    </div>
                    <a href={`${API}/timetable-upload/${t}`} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-10.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                      <ExternalLink className="w-30.5 h-30.5" /> Voir le PDF
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Aucun PDF publié</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upload Zone */}
      <Card className="rounded-3xl border border-border bg-background shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h3 className="font-bold text-sm uppercase tracking-widest">Publier un nouvel emploi du temps</h3>
        </div>
        <CardContent className="p-8 space-y-6">
          {/* Toggle */}
          <div className="flex gap-3">
            {(["students", "teachers"] as PdfType[]).map(t => {
              const cfg = labels[t];
              return (
                <button key={t} onClick={() => { setType(t); setFile(null); setStatus("idle"); }}
                  className={`flex items-center gap-2 px-5 py-20.5 rounded-xl text-sm font-bold border transition-all ${type === t ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/30"}`}>
                  <cfg.icon className="w-4 h-4" /> {cfg.label}
                </button>
              );
            })}
          </div>

          <p className="text-sm text-muted-foreground -mt-2">
            Ce PDF sera visible par <strong>tous les {type === "students" ? "étudiants" : "professeurs"}</strong> de l'école.
          </p>

          {/* Drag & Drop */}
          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${file ? "border-foreground bg-muted/10" : "border-border hover:border-foreground/30"}`}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") setFile(f); }}
            onDragOver={e => e.preventDefault()}
          >
            {file ? (
              <div className="flex items-center justify-center gap-4">
                <FileText className="w-8 h-8 text-foreground" />
                <div className="text-left">
                  <p className="font-bold">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Glissez un PDF ici ou</p>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-5 py-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-sm font-bold transition-all">
                    Choisir un fichier PDF
                  </span>
                  <input type="file" accept="application/pdf" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
                </label>
              </div>
            )}
          </div>

          <Button
            disabled={!file || uploading}
            onClick={handleUpload}
            className="w-full h-12 rounded-xl bg-foreground text-background font-bold gap-2"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Publication en cours..." : `Publier pour les ${type === "students" ? "Étudiants" : "Professeurs"}`}
          </Button>

          {status === "success" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="font-semibold text-sm">Emploi du temps publié avec succès !</p>
            </motion.div>
          )}
          {status === "error" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-semibold text-sm">Erreur lors de l'upload. Fichier PDF max 10MB.</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <div className="grid grid-cols-3 gap-4 text-center">
        {[["Format", "PDF uniquement"], ["Taille max", "10 MB"], ["Mise à jour", "Immédiate"]].map(([l, v]) => (
          <div key={l} className="p-4 rounded-2xl border border-border bg-muted/10">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{l}</p>
            <p className="font-bold mt-1">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


