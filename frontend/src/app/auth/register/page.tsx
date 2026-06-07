"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    schoolName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { registerSchool } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await registerSchool(formData);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erreur lors de l'inscription.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-6 py-12">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Retour à l'accueil
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl w-fit mx-auto mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Créer votre école</h1>
          <p className="text-muted-foreground">Inscrivez votre établissement sur EduSmart</p>
        </div>

        <div className="glass p-8 rounded-3xl border border-border/50 shadow-xl bg-background">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">Nom de l'établissement</Label>
                <Input 
                  id="schoolName" 
                  placeholder="ex: Groupe Scolaire Les Oliviers" 
                  className="rounded-xl h-11"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom du directeur</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Prénom" 
                    className="rounded-xl h-11"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom du directeur</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Nom" 
                    className="rounded-xl h-11"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email professionnel</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="contact@ecole.ma" 
                  className="rounded-xl h-11"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe sécurisé</Label>
                <Input 
                  id="password" 
                  type="password" 
                  className="rounded-xl h-11"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium text-center bg-destructive/10 py-2 rounded-lg">{error}</p>
            )}

            <Button type="submit" className="w-full h-11 rounded-xl text-base font-bold bg-foreground text-background hover:bg-foreground/90" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Créer l'établissement"}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Vous avez déjà un compte ? <Link href="/auth/login" className="text-primary font-bold hover:underline">Se connecter</Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
