"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  School, 
  Plus, 
  
  MoreHorizontal, 
  Users, 
  BookOpen,
  X,
  Check,
  Loader2,
  BookMarked,
  DoorOpen
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function SchoolManagementPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"class" | "subject" | "room">("class");
  const [items, setItems] = useState<{name: string, size: number | ""}[]>([{ name: "", size: "" }]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"classes" | "subjects" | "rooms">("classes");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resClasses, resSubjects, resRooms] = await Promise.all([
        axios.get(`${API}/classes?schoolId=${user?.schoolId}`),
        axios.get(`${API}/subjects?schoolId=${user?.schoolId}`),
        axios.get(`${API}/rooms?schoolId=${user?.schoolId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setClasses(resClasses.data);
      setSubjects(resSubjects.data);
      setRooms(resRooms.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user?.schoolId) {
      setError("Session expirée, reconnectez-vous.");
      return;
    }
    setCreating(true);
    try {
      const validItems = items.filter(item => item.name.trim() !== "");
      if (validItems.length === 0) return;

      const requests = validItems.map(item => {
        if (modalType === "class") {
          return axios.post(`${API}/classes`, {
            name: item.name,
            studentCount: item.size ? Number(item.size) : undefined,
            schoolId: user.schoolId
          });
        } else if (modalType === "subject") {
          return axios.post(`${API}/subjects`, {
            name: item.name,
            schoolId: user.schoolId
          });
        } else {
          return axios.post(`${API}/rooms`, {
            name: item.name,
            capacity: item.size ? Number(item.size) : undefined,
            schoolId: user.schoolId
          }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        }
      });

      await Promise.all(requests);

      await fetchData();
      setShowModal(false);
      setItems([{ name: "", size: "" }]);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erreur lors de la création.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      console.error("Erreur creation classe:", err);
    } finally {
      setCreating(false);
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
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => setActiveTab("classes")}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "classes" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              Classes
            </button>
            <button 
              onClick={() => setActiveTab("subjects")}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "subjects" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              Matières
            </button>
            <button 
              onClick={() => setActiveTab("rooms")}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "rooms" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              Salles
            </button>
          </div>
        </div>

        <Button 
          onClick={() => { setModalType(activeTab === "classes" ? "class" : activeTab === "subjects" ? "subject" : "room"); setShowModal(true); }}
          className="rounded-lg h-10 bg-primary text-primary-foreground hover:bg-foreground/90 transition-all px-6 gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle {activeTab === "classes" ? "Classe" : activeTab === "subjects" ? "Matière" : "Salle"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === "classes" && (
          classes.length === 0 ? (
            <p className="col-span-full text-center py-10 text-muted-foreground">Aucune classe trouvée.</p>
          ) : (
            classes.map((cls) => (
              <Card key={cls.id} className="rounded-2xl border border-border bg-background hover:border-foreground transition-all duration-300 group shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-2 rounded-xl bg-muted group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                      <School className="w-5 h-5" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreHorizontal className="w-4 h-4" /></Button>
                  </div>
                  
                  <h3 className="text-xl font-bold tracking-tight mb-4">{cls.name}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 font-medium">
                      <Users className="w-4 h-4" />
                      {cls.studentCount || 20} Places (Total: {cls._count?.students ?? cls.students?.length ?? 0} Inscrits)
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        )}
        
        {activeTab === "subjects" && (
          subjects.length === 0 ? (
            <p className="col-span-full text-center py-10 text-muted-foreground">Aucune matière trouvée.</p>
          ) : (
            subjects.map((sub) => (
              <Card key={sub.id} className="rounded-2xl border border-border bg-background hover:border-foreground transition-all duration-300 group shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-2 rounded-xl bg-muted group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                      <BookMarked className="w-5 h-5" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreHorizontal className="w-4 h-4" /></Button>
                  </div>
                  
                  <h3 className="text-xl font-bold tracking-tight mb-4">{sub.name}</h3>
                </CardContent>
              </Card>
            ))
          )
        )}

        {activeTab === "rooms" && (
          rooms.length === 0 ? (
            <p className="col-span-full text-center py-10 text-muted-foreground">Aucune salle trouvée.</p>
          ) : (
            rooms.map((room) => (
              <Card key={room.id} className="rounded-2xl border border-border bg-background hover:border-foreground transition-all duration-300 group shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-2 rounded-xl bg-muted group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                      <DoorOpen className="w-5 h-5" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreHorizontal className="w-4 h-4" /></Button>
                  </div>
                  
                  <h3 className="text-xl font-bold tracking-tight mb-4">{room.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 font-medium">
                      <Users className="w-4 h-4" />
                      Capacité: {room.capacity || 30} Places
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Nouvelle {modalType === "class" ? "Classe" : modalType === "subject" ? "Matière" : "Salle"}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X className="w-5 h-5" /></Button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex items-end gap-3 p-4 bg-muted/30 rounded-xl border border-border relative">
                  {items.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => setItems(items.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:scale-110 transition-transform"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <div className="space-y-2 flex-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nom</label>
                    <Input 
                      required 
                      placeholder={modalType === "class" ? "ex: 2ème BAC PC 1" : modalType === "subject" ? "ex: Maths" : "ex: Salle 12"}
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].name = e.target.value;
                        setItems(newItems);
                      }}
                      className="rounded-lg h-10 border-border bg-background focus:ring-1 focus:ring-foreground transition-all" 
                    />
                  </div>

                  {modalType !== "subject" && (
                    <div className="space-y-2 w-28">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground truncate">
                        {modalType === "class" ? "Élèves" : "Capacité"}
                      </label>
                      <Input 
                        type="number"
                        min="1"
                        placeholder={modalType === "class" ? "ex: 20" : "ex: 30"}
                        value={item.size}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].size = e.target.value ? Number(e.target.value) : "";
                          setItems(newItems);
                        }}
                        className="rounded-lg h-10 border-border bg-background focus:ring-1 focus:ring-foreground transition-all" 
                      />
                    </div>
                  )}
                </div>
              ))}

              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-dashed border-2 py-6 text-muted-foreground hover:text-foreground"
                onClick={() => setItems([...items, { name: "", size: "" }])}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une autre ligne
              </Button>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  ⚠️ {error}
                </p>
              )}

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-lg h-11" onClick={() => { setShowModal(false); setError(null); }}>Annuler</Button>
                <Button type="submit" disabled={creating} className="flex-1 rounded-lg h-11 bg-primary text-primary-foreground hover:bg-foreground/90 font-bold transition-all">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

