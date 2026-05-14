"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await login(email, password);
    } catch (err) {
      setError("Identifiants invalides ou problème de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-6">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Retour à l'accueil
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl w-fit mx-auto mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Bon retour !</h1>
          <p className="text-muted-foreground">Connectez-vous à votre espace EduSmart</p>
        </div>

        <div className="glass p-8 rounded-3xl border border-border/50 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email professionnel</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="prenom.nom@ecole.ma" 
                  className="rounded-xl h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link href="#" className="text-xs text-primary hover:underline">Oublié ?</Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  className="rounded-xl h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium text-center">{error}</p>
            )}

            <Button type="submit" className="w-full h-11 rounded-xl text-base font-medium" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Se connecter"}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Pas encore de compte ? <Link href="#" className="text-primary font-medium hover:underline">Contactez votre école</Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
