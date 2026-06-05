"use client";

import { useState, useEffect } from "react";
import { Plus, X, Trash2, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function TeacherExamsPage() {
  const { user, token } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [form, setForm] = useState({ title: "", date: "", classId: "", subjectId: "" });
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    if (!user?.schoolId || !token) return;
    try {
      setLoading(true);
      const [exmRes, clsRes, subRes] = await Promise.all([
        axios.get(`${API}/exams?schoolId=${user.schoolId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/classes?schoolId=${user.schoolId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/subjects?schoolId=${user.schoolId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setExams(exmRes.data);
      setClasses(clsRes.data);
      setSubjects(subRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post(`${API}/exams`, {
        ...form,
        schoolId: user?.schoolId
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setShowModal(false);
      setForm({ title: "", date: "", classId: "", subjectId: "" });
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la programmation de l'examen.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet examen ?")) return;
    try {
      await axios.delete(`${API}/exams/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Examens & Devoirs</h1>
          <p className="text-muted-foreground mt-2">Programmez les dates d'examens. Une annonce s'affichera pour la classe concernée.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="rounded-xl h-12 px-6 bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 gap-2">
          <Plus className="w-5 h-5" /> Programmer un examen
        </Button>
      </div>

      <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm">
        {exams.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mb-4 opacity-50" />
            <p>Aucun examen programmé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="p-4 font-bold text-xs uppercase tracking-widest">Titre</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-widest">Date</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-widest">Classe</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-widest">Matière</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-muted/30">
                    <td className="p-4 font-bold">{ex.title}</td>
                    <td className="p-4 font-medium text-primary">
                      {new Date(ex.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </td>
                    <td className="p-4 text-sm font-medium">{ex.class?.name}</td>
                    <td className="p-4 text-sm font-medium">{ex.subject?.name}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(ex.id)} className="text-destructive hover:bg-destructive hover:text-white rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold flex items-center gap-2"><AlertCircle className="w-6 h-6 text-primary" /> Nouvel Examen</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X className="w-5 h-5" /></Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Titre de l'examen</label>
                <Input 
                  required 
                  placeholder="Ex: Contrôle Continu 1"
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  className="rounded-xl h-12 bg-muted/50 border-border" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Classe</label>
                <select 
                  required 
                  value={form.classId}
                  onChange={(e) => setForm({...form, classId: e.target.value})}
                  className="w-full rounded-xl h-12 px-4 bg-muted/50 border border-border focus:outline-none focus:border-primary"
                >
                  <option value="">Sélectionnez une classe</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Matière</label>
                <select 
                  required 
                  value={form.subjectId}
                  onChange={(e) => setForm({...form, subjectId: e.target.value})}
                  className="w-full rounded-xl h-12 px-4 bg-muted/50 border border-border focus:outline-none focus:border-primary"
                >
                  <option value="">Sélectionnez une matière</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Date de l'examen</label>
                <Input 
                  required 
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({...form, date: e.target.value})}
                  className="rounded-xl h-12 bg-muted/50 border-border" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setShowModal(false)}>Annuler</Button>
                <Button type="submit" disabled={creating} className="flex-1 rounded-xl h-12 font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enregistrer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
