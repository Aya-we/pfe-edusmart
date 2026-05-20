"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Send, 
  Bot, 
  Zap, 
  BookOpen, 
  Target,
  BrainCircuit,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "${API}";

const suggestions = [
  { text: "Expliquer la leçon sur les dérivées", icon: BrainCircuit },
  { text: "Conseils pour améliorer ma moyenne", icon: Target },
  { text: "Quels sont mes points forts ?", icon: Zap },
  { text: "Planning de révision pour lundi", icon: BookOpen },
];

export default function EduSmartAIPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour Ahmed ! Je suis ton assistant EduSmart AI. Je suis maintenant connecté à l'intelligence réelle de Gemini. Comment puis-je t'aider aujourd'hui ?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post("${API}/ai/chat", {
        prompt: text,
        context: {
          studentName: "Ahmed",
          grades: [
            { subject: "Maths", avg: 15.0 },
            { subject: "Physique", avg: 12.0 },
            { subject: "SVT", avg: 18.0 }
          ]
        }
      });

      setMessages([...newMessages, { role: "assistant", content: response.data.response }]);
    } catch (error) {
      console.error("Erreur AI:", error);
      setMessages([...newMessages, { role: "assistant", content: "Désolé, je rencontre une difficulté technique. Vérifiez votre configuration API." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col max-w-4xl mx-auto border border-border rounded-2xl overflow-hidden bg-background shadow-xl">
      {/* AI Header */}
      <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-foreground text-background flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">EduSmart AI</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Propulsé par Google Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Live Intelligence</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-background">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                msg.role === "assistant" ? "bg-foreground text-background" : "bg-muted border-border"
              )}>
                {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
              </div>
              <div className={cn(
                "max-w-[80%] p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === "assistant" ? "bg-muted/50 text-foreground border border-border" : "bg-foreground text-background shadow-lg"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-muted/50 p-5 rounded-2xl border border-border flex gap-1">
                <div className="w-10.5 h-10.5 rounded-full bg-foreground/30 animate-bounce" />
                <div className="w-10.5 h-10.5 rounded-full bg-foreground/30 animate-bounce [animation-delay:0.2s]" />
                <div className="w-10.5 h-10.5 rounded-full bg-foreground/30 animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Area */}
      <div className="p-8 border-t border-border bg-background space-y-6">
        {messages.length < 3 && (
          <div className="grid grid-cols-2 gap-3">
            {suggestions.map((s, i) => (
              <button 
                key={i}
                onClick={() => handleSend(s.text)}
                className="flex items-center gap-3 p-3 text-left rounded-xl border border-border hover:border-foreground transition-all group"
              >
                <div className="p-2 rounded-lg bg-muted group-hover:bg-foreground group-hover:text-background transition-all">
                  <s.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">{s.text}</span>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez n'importe quelle question..." 
            className="rounded-xl h-14 pl-6 pr-16 border-border focus:ring-1 focus:ring-foreground transition-all font-medium"
          />
          <Button 
            type="submit"
            size="icon"
            className="absolute right-2 top-2 h-10 w-10 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-all"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

