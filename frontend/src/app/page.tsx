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
          <div className="bg-primary text-primary-foreground p-10.5 rounded-lg">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">EduSmart</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Solutions</Link>
          <Link href="#about" className="hover:text-foreground transition-colors">À propos</Link>
          <Link href="#contact" className="hover:text-foreground transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-sm font-medium">Connexion</Button>
          </Link>
          <Link href="/auth/login">
            <Button className="text-sm font-medium rounded-full px-6">Démonstration</Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 px-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
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
              <span>L'intelligence artificielle au service de l'éducation</span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
            >
              Le futur de la gestion <br /> scolaire au Maroc.
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Une plateforme tout-en-un, moderne et intuitive conçue pour les écoles privées, lycées et universités. Simplifiez votre quotidien administratif.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/login">
                <Button size="lg" className="rounded-full px-8 h-12 text-base group">
                  Commencer maintenant
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base">
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
