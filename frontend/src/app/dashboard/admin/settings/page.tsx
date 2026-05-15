"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Save, 
  Building, 
  Globe, 
  Phone, 
  MapPin, 
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "${API}";

export default function AdminSettingsPage() {
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const response = await axios.get("${API}/schools");
        if (response.data.length > 0) {
          setSchool(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching school:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.put(`${API}/schools/${school.id}`, school);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating school:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: any) => {
    // Simulation d'upload pour le moment (URL fictive)
    setSchool({...school, logo: "https://api.dicebear.com/7.x/initials/svg?seed=ES"});
    alert("Logo sélectionné ! (Prêt pour l'enregistrement)");
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col gap-2 border-b border-border pb-8">
        <h1 className="text-4xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground text-lg italic font-medium">Gérez l'identité visuelle et les paramètres de l'école.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <Card className="rounded-3xl border border-border bg-background shadow-sm overflow-hidden">
          <div className="p-8 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-bold text-sm uppercase tracking-widest">Identité de l'école</h3>
            </div>
          </div>
          <CardContent className="p-8 space-y-10">
            <div className="flex flex-col md:flex-row items-center gap-10 border-b border-border/50 pb-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2rem] bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all group-hover:border-foreground/20">
                  {school?.logo ? (
                    <img src={school.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 p-2 bg-foreground text-background rounded-xl cursor-pointer hover:scale-110 transition-all shadow-lg">
                  <Upload className="w-4 h-4" />
                  <input type="file" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-xl font-bold">Logo de l'établissement</h4>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                  Ce logo apparaîtra sur les bulletins, les factures et l'interface de tous les utilisateurs. Format recommandé: PNG ou SVG (256x256).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Nom Officiel</label>
                <Input 
                  value={school?.name || ""} 
                  onChange={(e) => setSchool({...school, name: e.target.value})}
                  className="rounded-xl h-12 border-border bg-muted/5 focus:bg-background transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Téléphone</label>
                <Input 
                  value={school?.phone || ""} 
                  onChange={(e) => setSchool({...school, phone: e.target.value})}
                  className="rounded-xl h-12 border-border bg-muted/5 focus:bg-background transition-all font-medium"
                />
              </div>
              <div className="space-y-2 col-span-full">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">Adresse Physique</label>
                <Input 
                  value={school?.address || ""} 
                  onChange={(e) => setSchool({...school, address: e.target.value})}
                  className="rounded-xl h-12 border-border bg-muted/5 focus:bg-background transition-all font-medium"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            type="submit" 
            disabled={isSaving}
            className="rounded-xl h-14 bg-foreground text-background hover:bg-foreground/90 font-bold px-12 gap-3 transition-all shadow-xl shadow-foreground/10"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Mettre à jour les paramètres
          </Button>
        </div>
      </form>

      {success && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed bottom-10 right-10 bg-foreground text-background px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 font-bold border border-border"
        >
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          Modifications enregistrées !
        </motion.div>
      )}
    </div>
  );
}

