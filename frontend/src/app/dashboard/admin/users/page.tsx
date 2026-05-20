"use client";

import { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Trash2, Edit2, X, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "${API}";

const ROLE_COLORS: Record<string, string> = {
  STUDENT: "bg-blue-50 text-blue-700 border-blue-200",
  TEACHER: "bg-purple-50 text-purple-700 border-purple-200",
  ADMIN:   "bg-gray-100 text-gray-700 border-gray-200",
  PARENT:  "bg-orange-50 text-orange-700 border-orange-200",
};

export default function UsersManagementPage() {
  const { user: currentUser } = useAuth();
  const [users,   setUsers]   = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal,      setShowModal]      = useState(false);
  const [isEditing,      setIsEditing]      = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "",
    password: "", role: "STUDENT",
    classId: "",
    parentId: "",               // 🆕 parent d l'étudiant
    teacherClasses: [] as string[],
  });

  /* ─── Fetch all data ─── */
  const fetchData = async () => {
    try {
      const [uRes, cRes] = await Promise.all([
        axios.get(`${API}/users`),
        axios.get(`${API}/classes`),
      ]);
      setUsers(uRes.data);
      setClasses(cRes.data);
      setParents(uRes.data.filter((u: any) => u.role === "PARENT"));
      if (cRes.data.length && !formData.classId) {
        setFormData(p => ({ ...p, classId: cRes.data[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ─── Ouvrir modal Modifier ─── */
  const openEdit = (user: any) => {
    setIsEditing(true);
    setSelectedUserId(user.id);
    setFormData({
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      role:      user.role,
      password:  "",
      classId:   user.student?.classId || (classes[0]?.id ?? ""),
      parentId:  user.student?.parentId || "",      // 🆕
      teacherClasses: user.teacher?.classes?.map((c: any) => c.id) || [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setSelectedUserId(null);
    setFormData({
      firstName: "", lastName: "", email: "", password: "",
      role: "STUDENT", classId: classes[0]?.id ?? "",
      parentId: "", teacherClasses: [],
    });
  };

  const toggleTeacherClass = (cid: string) => {
    setFormData(p => ({
      ...p,
      teacherClasses: p.teacherClasses.includes(cid)
        ? p.teacherClasses.filter(x => x !== cid)
        : [...p.teacherClasses, cid],
    }));
  };

  /* ─── Submit ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedUserId) {
        await axios.put(`${API}/users/${selectedUserId}`, {
          firstName:      formData.firstName,
          lastName:       formData.lastName,
          email:          formData.email,
          role:           formData.role,
          classId:        formData.classId,
          parentId:       formData.parentId || null,    // 🆕
          teacherClasses: formData.teacherClasses,
        });
        alert("Compte modifié avec succès !");
      } else {
        await axios.post(`${API}/auth/register`, {
          ...formData,
          schoolId: currentUser?.schoolId,
        });
        alert("Compte créé avec succès !");
      }
      fetchData();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'opération.");
    }
  };

  /* ─── Delete ─── */
  const handleDelete = async (id: string) => {
    if (!globalThis.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try {
      await axios.delete(`${API}/users/${id}`);
      fetchData();
    } catch {
      alert("Erreur : impossible de supprimer.");
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground mt-2 text-lg">{users.length} membre(s) dans l'établissement.</p>
        </div>
        <Button onClick={() => setShowModal(true)}
          className="rounded-lg h-10 bg-foreground text-background hover:bg-foreground/90 px-6 gap-2">
          <UserPlus className="w-4 h-4" /> Ajouter un utilisateur
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-background shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="py-4 pl-6 font-bold text-foreground">Nom & Prénom</TableHead>
              <TableHead className="font-bold text-foreground">Email</TableHead>
              <TableHead className="font-bold text-foreground">Rôle</TableHead>
              <TableHead className="font-bold text-foreground">Classe / Parent</TableHead>
              <TableHead className="text-right pr-6 font-bold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id} className="hover:bg-muted/30 transition-all border-b border-border/50 last:border-0 h-16">
                <TableCell className="pl-6 font-medium">{u.firstName} {u.lastName}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                <TableCell>
                  <span className={`text-[10px] font-bold px-2 py-00.5 rounded-full border uppercase tracking-widest ${ROLE_COLORS[u.role] ?? "bg-muted text-muted-foreground border-border"}`}>
                    {u.role}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {u.role === "STUDENT" && (
                    <div>
                      <span>{u.student?.class?.name ?? "—"}</span>
                      {u.student?.parent?.user && (
                        <span className="ml-2 text-xs text-orange-600 font-bold">
                          · Parent: {u.student.parent.user.firstName} {u.student.parent.user.lastName}
                        </span>
                      )}
                    </div>
                  )}
                  {u.role === "TEACHER" && (u.teacher?.classes?.map((c: any) => c.name).join(", ") || "—")}
                  {(u.role === "ADMIN" || u.role === "PARENT") && "—"}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-foreground" onClick={() => openEdit(u)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-destructive" onClick={() => handleDelete(u.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border w-full max-w-lg rounded-2xl shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold tracking-tight">
                {isEditing ? "Modifier le compte" : "Nouveau membre"}
              </h3>
              <Button variant="ghost" size="icon" onClick={closeModal}><X className="w-5 h-5" /></Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Prénom / Nom */}
              <div className="grid grid-cols-2 gap-4">
                {[["Prénom", "firstName"], ["Nom", "lastName"]].map(([label, key]) => (
                  <div key={key} className="space-y-10.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
                    <Input required value={(formData as any)[key]}
                      onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                      className="rounded-xl h-11 bg-muted/5" />
                  </div>
                ))}
              </div>

              {/* Email */}
              <div className="space-y-10.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                <Input type="email" required value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="rounded-xl h-11 bg-muted/5" />
              </div>

              {/* Mot de passe (création seulement) */}
              {!isEditing && (
                <div className="space-y-10.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mot de passe</label>
                  <Input type="password" required value={formData.password}
                    onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                    className="rounded-xl h-11 bg-muted/5" />
                </div>
              )}

              {/* Rôle */}
              <div className="space-y-10.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rôle</label>
                <select className="w-full h-11 rounded-xl border border-border bg-muted/5 px-3 text-sm outline-none font-bold"
                  value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}>
                  <option value="STUDENT">Étudiant</option>
                  <option value="TEACHER">Professeur</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="PARENT">Parent</option>
                </select>
              </div>

              {/* ── Champs ÉTUDIANT ── */}
              {formData.role === "STUDENT" && (
                <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/5">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Informations étudiant</p>
                  
                  {/* Classe */}
                  <div className="space-y-10.5">
                    <label className="text-xs font-semibold text-muted-foreground">Classe</label>
                    <select className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none font-bold"
                      value={formData.classId} onChange={e => setFormData(p => ({ ...p, classId: e.target.value }))}>
                      {classes.length === 0 && <option>Aucune classe</option>}
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* 🆕 Parent */}
                  <div className="space-y-10.5">
                    <label className="text-xs font-semibold text-muted-foreground">Parent (optionnel)</label>
                    <select className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none font-bold"
                      value={formData.parentId} onChange={e => setFormData(p => ({ ...p, parentId: e.target.value }))}>
                      <option value="">— Aucun parent assigné —</option>
                      {parents.map(p => (
                        <option key={p.id} value={p.parent?.id || p.id}>
                          {p.firstName} {p.lastName} ({p.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* ── Champs PROFESSEUR ── */}
              {formData.role === "TEACHER" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Classes assignées</label>
                  <div className="grid grid-cols-2 gap-2 p-4 rounded-xl border border-border bg-muted/5 max-h-48 overflow-y-auto">
                    {classes.length === 0 && <p className="col-span-2 text-xs text-muted-foreground text-center py-2">Aucune classe disponible</p>}
                    {classes.map(c => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted transition-all">
                        <input type="checkbox" checked={formData.teacherClasses.includes(c.id)}
                          onChange={() => toggleTeacherClass(c.id)}
                          className="accent-foreground w-4 h-4 rounded" />
                        <span className="text-sm font-medium">{c.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{formData.teacherClasses.length} classe(s) sélectionnée(s)</p>
                </div>
              )}

              {/* Boutons */}
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-xl h-12" onClick={closeModal}>Annuler</Button>
                <Button type="submit" className="flex-1 rounded-xl h-12 bg-foreground text-background font-bold">
                  {isEditing ? "Enregistrer" : "Créer le compte"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


