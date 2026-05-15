"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  School, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Users, 
  BookOpen,
  X,
  Check,
  Loader2
} from "lucide-react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "${API}";

export default function SchoolManagementPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  const fetchClasses = async () => {
    try {
      const response = await axios.get("${API}/classes");
      setClasses(response.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // En vrai on récupère le schoolId du user connecté
      const schoolIdRes = await axios.get("${API}/users");
      const schoolId = schoolIdRes.data[0].schoolId;

      await axios.post("${API}/classes", {
        name: newClassName,
        schoolId: schoolId
      });

      fetchClasses();
      setShowModal(false);
      setNewClassName("");
    } catch (error) {
      console.error("Erreur creation classe:", error);
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Classes & Matières</h1>
          <p className="text-muted-foreground mt-2 text-lg">Données réelles issues de MySQL.</p>
        </div>

        <Button 
          onClick={() => setShowModal(true)}
          className="rounded-lg h-10 bg-foreground text-background hover:bg-foreground/90 transition-all px-6 gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Classe
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <p className="col-span-full text-center py-10 text-muted-foreground">Aucune classe trouvée.</p>
        ) : (
          classes.map((cls) => (
            <Card key={cls.id} className="rounded-2xl border border-border bg-background hover:border-foreground transition-all duration-300 group shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-2.5 rounded-xl bg-muted group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                    <School className="w-5 h-5" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreHorizontal className="w-4 h-4" /></Button>
                </div>
                
                <h3 className="text-xl font-bold tracking-tight mb-4">{cls.name}</h3>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users className="w-4 h-4" />
                    {cls.students?.length || 0} Élèves
                  </div>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <div className="flex items-center gap-1.5 font-medium">
                    <BookOpen className="w-4 h-4" />
                    Actif
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border w-full max-w-sm rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Nouvelle Classe</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X className="w-5 h-5" /></Button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nom de la classe</label>
                <Input 
                  required 
                  placeholder="ex: 2ème BAC Physique 1"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="rounded-lg h-11 border-border focus:ring-1 focus:ring-foreground transition-all" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-lg h-11" onClick={() => setShowModal(false)}>Annuler</Button>
                <Button type="submit" className="flex-1 rounded-lg h-11 bg-foreground text-background hover:bg-foreground/90 font-bold transition-all">
                  Créer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

