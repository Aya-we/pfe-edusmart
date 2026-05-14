"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Video, Download, Search, Upload, X,
  Book, Loader2, Trash2, FileArchive, Eye, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API = "http://localhost:4000";

const FILE_ICONS: Record<string, any> = {
  pdf:      FileText,
  video:    Video,
  document: FileArchive,
};

export default function LibraryPage() {
  const { user } = useAuth();
  const canUpload = user?.role === "TEACHER" || user?.role === "ADMIN";

  const [resources, setResources] = useState<any[]>([]);
  const [classes,   setClasses]   = useState<any[]>([]);
  const [subjects,  setSubjects]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [file,      setFile]      = useState<File | null>(null);
  const [title,     setTitle]     = useState("");
  const [classId,   setClassId]   = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadOk,  setUploadOk]  = useState(false);

  const fetchResources = async () => {
    try {
      const [rRes, cRes, sRes] = await Promise.all([
        axios.get(`${API}/resources`),
        axios.get(`${API}/classes`),
        axios.get(`${API}/subjects`),
      ]);
      setResources(rRes.data);
      setClasses(cRes.data);
      setSubjects(sRes.data);
      if (cRes.data[0]) setClassId(cRes.data[0].id);
      if (sRes.data[0]) setSubjectId(sRes.data[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file",      file);
      form.append("title",     title || file.name);
      form.append("classId",   classId);
      form.append("subjectId", subjectId);
      // teacherId : on passe l'ID du profil teacher si dispo
      if (user?.id) form.append("teacherId", user.id);

      await axios.post(`${API}/resources/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadOk(true);
      fetchResources();
      setTimeout(() => {
        setShowModal(false);
        setFile(null);
        setTitle("");
        setUploadOk(false);
      }, 1500);
    } catch (err) {
      alert("Erreur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette ressource ?")) return;
    try {
      await axios.delete(`${API}/resources/${id}`);
      fetchResources();
    } catch { alert("Erreur suppression."); }
  };

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.subject?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const Icon = (type: string) => FILE_ICONS[type] || FileText;

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Bibliothèque</h1>
          <p className="text-muted-foreground mt-2 text-lg">{resources.length} ressource(s) disponible(s).</p>
        </div>
        {canUpload && (
          <Button onClick={() => setShowModal(true)}
            className="rounded-xl h-11 bg-foreground text-background hover:bg-foreground/90 px-6 gap-2">
            <Upload className="w-4 h-4" /> Uploader un cours
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un cours..."
          className="pl-10 rounded-xl h-11 border-border"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl gap-4">
            <Book className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">
              {resources.length === 0 ? "Aucun cours disponible pour le moment." : "Aucun résultat pour cette recherche."}
            </p>
            {canUpload && resources.length === 0 && (
              <Button variant="outline" onClick={() => setShowModal(true)} className="rounded-xl gap-2">
                <Upload className="w-4 h-4" /> Uploader le premier cours
              </Button>
            )}
          </div>
        ) : (
          filtered.map((res, i) => {
            const FileIcon = Icon(res.type);
            return (
              <motion.div key={res.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="rounded-2xl border border-border bg-background hover:border-foreground/20 hover:shadow-md transition-all group overflow-hidden h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-muted group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                        <FileIcon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {res.type?.toUpperCase() ?? "DOC"}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm mb-1 line-clamp-2 flex-1">{res.title}</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-4">
                      {res.subject?.name ?? "Général"}
                      {res.class?.name && ` • ${res.class.name}`}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          {res.teacher?.user?.firstName ?? "Admin"}
                        </p>
                        {res.size && <p className="text-[10px] text-muted-foreground">{res.size}</p>}
                      </div>
                      <div className="flex gap-1">
                        <a href={res.fileUrl} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-foreground hover:text-background transition-all">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                        <a href={res.fileUrl} download>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-foreground hover:text-background transition-all">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                        {canUpload && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(res.id)}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-border w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Uploader un cours</h3>
                <Button variant="ghost" size="icon" onClick={() => { setShowModal(false); setFile(null); setTitle(""); }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {uploadOk ? (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                  <p className="font-bold text-green-600">Cours uploadé avec succès !</p>
                </div>
              ) : (
                <form onSubmit={handleUpload} className="space-y-5">
                  {/* Titre */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Titre du cours</label>
                    <Input value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="Ex: Chapitre 3 — Algèbre linéaire"
                      className="rounded-xl h-11 bg-muted/5" />
                  </div>

                  {/* Classe */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Classe</label>
                    <select className="w-full h-11 rounded-xl border border-border bg-muted/5 px-3 text-sm outline-none font-bold"
                      value={classId} onChange={e => setClassId(e.target.value)}>
                      <option value="">— Toutes les classes —</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Matière */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Matière</label>
                    <select className="w-full h-11 rounded-xl border border-border bg-muted/5 px-3 text-sm outline-none font-bold"
                      value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                      <option value="">— Général —</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  {/* Fichier */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fichier (PDF, vidéo, document)</label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${file ? "border-foreground bg-muted/10" : "border-border hover:border-foreground/30"}`}
                      onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, "")); }}}
                      onDragOver={e => e.preventDefault()}
                    >
                      {file ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="w-6 h-6 text-foreground" />
                          <div className="text-left">
                            <p className="text-sm font-bold truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => setFile(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer space-y-2 block">
                          <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Glisser ici ou <span className="font-bold underline">choisir un fichier</span></p>
                          <input type="file" className="hidden"
                            accept=".pdf,.doc,.docx,.mp4,.webm,.ppt,.pptx"
                            onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, "")); }}} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1 rounded-xl h-12"
                      onClick={() => { setShowModal(false); setFile(null); setTitle(""); }}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={!file || uploading} className="flex-1 rounded-xl h-12 bg-foreground text-background font-bold gap-2">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploading ? "Upload..." : "Publier"}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
