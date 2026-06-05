"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  
  Save, 
  Building, 
  
  
  
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
import { useAuth } from "@/context/AuthContext";
import { Palette } from "lucide-react";
import { Color } from "color-thief-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [themeSettings, setThemeSettings] = useState({ primary: "#000000", background: "#ffffff" });

  useEffect(() => {
    const fetchSchool = async () => {
      if (!user?.schoolId) return;
      try {
        const response = await axios.get(`${API}/schools/${user.schoolId}`);
        setSchool(response.data);
        if (response.data.themeSettings) {
          setThemeSettings(
            typeof response.data.themeSettings === "string" 
              ? JSON.parse(response.data.themeSettings) 
              : response.data.themeSettings
          );
        }
      } catch (error) {
        console.error("Error fetching school:", error);
        setError("Impossible de charger les données de l'école.");
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await axios.put(`${API}/schools/${school.id}`, { ...school, themeSettings });
      
      // Appliquer le thème dynamiquement
      if (themeSettings.primary) {
        document.documentElement.style.setProperty('--primary', themeSettings.primary);
      }
      if (themeSettings.background) {
        document.documentElement.style.setProperty('--background', themeSettings.background);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error updating school:", err);
      setError(err?.response?.data?.message || "Erreur lors de la sauvegarde. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchool({ ...school, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
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

        {/* Theming section */}
        <Card className="rounded-3xl border border-border bg-background shadow-sm overflow-hidden">
          <div className="p-8 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-bold text-sm uppercase tracking-widest">Thème & Couleurs</h3>
            </div>
          </div>
          <CardContent className="p-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Couleur Primaire (Boutons, Liens)</label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="color" 
                    value={themeSettings.primary} 
                    onChange={(e) => setThemeSettings({...themeSettings, primary: e.target.value})}
                    className="w-16 h-16 p-1 rounded-2xl cursor-pointer"
                  />
                  <Input 
                    value={themeSettings.primary} 
                    onChange={(e) => setThemeSettings({...themeSettings, primary: e.target.value})}
                    className="flex-1 rounded-xl h-12 font-mono uppercase"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Couleur d'Arrière-plan</label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="color" 
                    value={themeSettings.background} 
                    onChange={(e) => setThemeSettings({...themeSettings, background: e.target.value})}
                    className="w-16 h-16 p-1 rounded-2xl cursor-pointer"
                  />
                  <Input 
                    value={themeSettings.background} 
                    onChange={(e) => setThemeSettings({...themeSettings, background: e.target.value})}
                    className="flex-1 rounded-xl h-12 font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {school?.logo && (
              <div className="space-y-4 pt-6 border-t border-border/50">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Suggestions depuis le Logo</label>
                <Color src={school.logo} crossOrigin="anonymous" format="hex">
                  {({ data, loading }) => {
                    if (loading) return <p className="text-sm text-muted-foreground">Extraction des couleurs...</p>;
                    if (!data) return <p className="text-sm text-muted-foreground">Impossible d'extraire la couleur.</p>;
                    return (
                      <div className="flex flex-col gap-3">
                        <p className="text-xs text-muted-foreground">Nous avons détecté cette couleur dominante dans votre logo :</p>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setThemeSettings({ ...themeSettings, primary: data })}
                            className="w-12 h-12 rounded-full shadow-md hover:scale-110 transition-transform"
                            style={{ backgroundColor: data }}
                            title="Utiliser comme couleur primaire"
                          />
                          <span className="font-mono text-sm">{data}</span>
                        </div>
                      </div>
                    );
                  }}
                </Color>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            type="submit" 
            disabled={isSaving}
            className="rounded-xl h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-12 gap-3 transition-all shadow-xl shadow-primary/10"
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

