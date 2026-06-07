"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setSuccess(true);
    } catch (err) {
      setError("Une erreur est survenue lors de l'envoi de la demande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-6">
      <Link href="/auth/login" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Retour à la connexion
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
          <h1 className="text-3xl font-bold tracking-tight">Mot de passe oublié</h1>
          <p className="text-muted-foreground">Demandez une réinitialisation à votre administrateur</p>
        </div>

        <div className="glass p-8 rounded-3xl border border-border/50 shadow-xl">
          {success ? (
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <h2 className="text-xl font-bold">Demande envoyée !</h2>
              <p className="text-sm text-muted-foreground">
                Si un compte est associé à cette adresse e-mail, votre administrateur sera notifié de votre demande de réinitialisation.
              </p>
              <Link href="/auth/login" className="w-full mt-4 inline-block">
                <Button className="w-full rounded-xl">Retourner à la connexion</Button>
              </Link>
            </div>
          ) : (
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
              </div>

              {error && (
                <p className="text-sm text-destructive font-medium text-center">{error}</p>
              )}

              <Button type="submit" className="w-full h-11 rounded-xl text-base font-medium" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer la demande"}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
