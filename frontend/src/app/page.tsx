"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/40 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight hidden xs:block sm:block">EduSmart</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Solutions</Link>
          <Link href="#about" className="hover:text-foreground transition-colors">À propos</Link>
          <Link href="#contact" className="hover:text-foreground transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-xs sm:text-sm font-medium px-2 sm:px-4">Connexion</Button>
          </Link>
          <Link href="/auth/register">
            <Button className="text-xs sm:text-sm font-medium rounded-full px-4 sm:px-6">S'inscrire</Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 px-6 min-h-[80vh] flex items-center" id="about">
          <div className="absolute inset-0 -z-20">
            <img src="/hero_bg_light.png" alt="Educational Background" className="w-full h-full object-cover opacity-20 dark:opacity-10" />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
          </div>

          <motion.div 
            className="max-w-5xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs font-semibold mb-6">
              <span className="bg-primary text-primary-foreground px-2 py-00.5 rounded-full text-[10px]">NOUVEAU</span>
              <span>La nouvelle norme de l'excellence éducative</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
            >
              L'Éducation Repensée, <br className="hidden sm:block" /> La Gestion Simplifiée.
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Une expérience fluide et moderne pour piloter votre établissement. De la gestion des absences aux bulletins scolaires, tout devient plus facile avec EduSmart.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col w-full sm:w-auto sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-full px-8 h-12 text-base group">
                  Commencer maintenant
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-12 text-base">
                  Se connecter
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Preview */}
        <section className="py-24 bg-muted/30 px-6 border-y border-border/50" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <BookOpen className="w-5 h-5" />, title: "Gestion Académique", desc: "Notes, absences, examens et emplois du temps centralisés." },
                { icon: <Users className="w-5 h-5" />, title: "Espace Parents", desc: "Suivez le progrès de vos enfants en temps réel avec notifications." },
                { icon: <ShieldCheck className="w-5 h-5" />, title: "Sécurité SaaS", desc: "Données isolées et sécurisées pour chaque établissement." },
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-2xl bg-background border border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-24 px-6 bg-background" id="contact">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Contactez-nous</h2>
            <p className="text-muted-foreground mb-12">Notre équipe est à votre disposition pour toute question ou demande de démonstration.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-muted/30 border border-border flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <h3 className="font-bold mb-2">Téléphone</h3>
                <p className="text-muted-foreground">06 49 26 90 60</p>
              </div>
              
              <div className="p-6 rounded-2xl bg-muted/30 border border-border flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                </div>
                <h3 className="font-bold mb-2">Email</h3>
                <p className="text-muted-foreground">contact@edu-smart.ma</p>
              </div>

              <div className="p-6 rounded-2xl bg-muted/30 border border-border flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <h3 className="font-bold mb-2">Adresse</h3>
                <p className="text-muted-foreground">Casablanca, Maroc</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            <span className="font-bold">EduSmart</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 EduSmart. Tous droits réservés.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Confidentialité</Link>
            <Link href="#" className="hover:text-foreground">Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
