"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Trash2, CalendarX2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function AdminTeacherAbsencesPage() {
  const { user, token } = useAuth();
  const [absences, setAbsences] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [form, setForm] = useState({ teacherId: "", date: "", reason: "" });
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    if (!user?.schoolId || !token) return;
    try {
      setLoading(true);
      const [absRes, tchRes] = await Promise.all([
        axios.get(`${API}/absences?schoolId=${user.schoolId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/users?role=TEACHER&schoolId=${user.schoolId}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setAbsences(absRes.data);
      setTeachers(tchRes.data);
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
      const teacher = teachers.find(t => t.id === form.teacherId);
      const realTeacherId = teacher?.teacher?.id || teacher?.id; // backend expects teacher model ID, not user ID if it's separate.
      // Wait, `/users?role=TEACHER` returns User objects which might have `.teacher.id`.
      
      await axios.post(`${API}/absences`, {
        teacherId: realTeacherId,
        date: form.date,
        reason: form.reason,
        schoolId: user?.schoolId
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setShowModal(false);
      setForm({ teacherId: "", date: "", reason: "" });
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la déclaration d'absence.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette absence ?")) return;
    try {
      await axios.delete(`${API}/absences/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
          <h1 className="text-4xl font-bold tracking-tight">Absences Professeurs</h1>
          <p className="text-muted-foreground mt-2">Gérez les professeurs absents. L'absence s'affichera dans l'emploi du temps des élèves.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="rounded-xl h-12 px-6 bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 gap-2">
          <Plus className="w-5 h-5" /> Déclarer une absence
        </Button>
      </div>

      <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm">
        {absences.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center text-center text-muted-foreground">
            <CalendarX2 className="w-12 h-12 mb-4 opacity-50" />
            <p>Aucune absence enregistrée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="p-4 font-bold text-xs uppercase tracking-widest">Professeur</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-widest">Date</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-widest">Motif</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {absences.map((abs) => (
                  <tr key={abs.id} className="hover:bg-muted/30">
                    <td className="p-4 font-bold">
                      {abs.teacher?.user?.firstName} {abs.teacher?.user?.lastName}
                    </td>
                    <td className="p-4 font-medium text-destructive">
                      {new Date(abs.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">
                      {abs.reason || "Non spécifié"}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(abs.id)} className="text-destructive hover:bg-destructive hover:text-white rounded-xl">
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
              <h3 className="text-2xl font-bold flex items-center gap-2"><AlertCircle className="w-6 h-6 text-destructive" /> Déclarer Absence</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X className="w-5 h-5" /></Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Professeur</label>
                <select 
                  required 
                  value={form.teacherId}
                  onChange={(e) => setForm({...form, teacherId: e.target.value})}
                  className="w-full rounded-xl h-12 px-4 bg-muted/50 border border-border focus:outline-none focus:border-primary"
                >
                  <option value="">Sélectionnez un professeur</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Date de l'absence</label>
                <Input 
                  required 
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({...form, date: e.target.value})}
                  className="rounded-xl h-12 bg-muted/50 border-border" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Motif (Optionnel)</label>
                <Input 
                  placeholder="Ex: Maladie, Réunion pédagogique..."
                  value={form.reason}
                  onChange={(e) => setForm({...form, reason: e.target.value})}
                  className="rounded-xl h-12 bg-muted/50 border-border" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setShowModal(false)}>Annuler</Button>
                <Button type="submit" disabled={creating} className="flex-1 rounded-xl h-12 font-bold bg-destructive text-white hover:bg-destructive/90 transition-all">
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmer l'absence"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
