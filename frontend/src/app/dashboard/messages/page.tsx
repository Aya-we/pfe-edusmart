"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Send, CheckCheck, Loader2, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API = "http://localhost:4000";

export default function MessagesPage() {
  const { user } = useAuth();
  const [contacts,  setContacts]  = useState<any[]>([]);
  const [messages,  setMessages]  = useState<any[]>([]);
  const [selected,  setSelected]  = useState<any>(null);
  const [allUsers,  setAllUsers]  = useState<any[]>([]);
  const [newMsg,    setNewMsg]    = useState("");
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const [search,    setSearch]    = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  /* ── 1. Charger les conversations & tous les users ── */
  const loadContacts = async () => {
    if (!user) return;
    try {
      const [convRes, usersRes] = await Promise.all([
        axios.get(`${API}/messages/conversations/${user.id}`),
        axios.get(`${API}/users`),
      ]);
      setContacts(convRes.data);
      setAllUsers(usersRes.data.filter((u: any) => u.id !== user.id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadContacts(); }, [user]);

  /* ── 2. Charger messages quand on sélectionne un contact ── */
  useEffect(() => {
    if (!selected || !user) return;
    const load = async () => {
      try {
        const res = await axios.get(`${API}/messages/${user.id}/${selected.id}`);
        setMessages(res.data);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    const interval = setInterval(load, 5000); // Poll toutes les 5s
    return () => clearInterval(interval);
  }, [selected, user]);

  /* ── 3. Envoyer un message ── */
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !selected || !user) return;
    setSending(true);
    try {
      const res = await axios.post(`${API}/messages/send`, {
        senderId:   user.id,
        receiverId: selected.id,
        content:    newMsg.trim(),
      });
      setMessages(prev => [...prev, res.data]);
      setNewMsg("");
      loadContacts();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  /* ── 4. Sélectionner depuis la liste de tous les users ── */
  const startConversation = (u: any) => {
    setSelected({ id: u.id, name: `${u.firstName} ${u.lastName}`, role: u.role });
    setSearch("");
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const initials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const filteredUsers = allUsers.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-160px)] flex border border-border rounded-2xl overflow-hidden bg-background shadow-sm max-w-6xl mx-auto">
      
      {/* ── Sidebar ── */}
      <div className="w-80 border-r border-border flex flex-col bg-muted/5">
        <div className="p-5 border-b border-border bg-background space-y-3">
          <h2 className="text-xl font-bold">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Nouvelle conversation..."
              className="pl-10 rounded-xl h-9 border-border bg-muted/20 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Dropdown search results */}
          {search && (
            <div className="border border-border rounded-xl bg-background shadow-lg max-h-40 overflow-y-auto z-10">
              {filteredUsers.length === 0 ? (
                <p className="p-3 text-xs text-muted-foreground text-center">Aucun résultat</p>
              ) : (
                filteredUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => startConversation(u)}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-all flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold">
                      {initials(`${u.firstName} ${u.lastName}`)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{u.firstName} {u.lastName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{u.role}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground text-center px-4">
              <MessageSquare className="w-8 h-8" />
              <p className="text-xs font-medium">Aucune conversation.<br/>Recherchez un utilisateur ci-dessus.</p>
            </div>
          ) : (
            contacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => setSelected(contact)}
                className={cn(
                  "p-4 flex items-center gap-3 cursor-pointer transition-all border-b border-border/40",
                  selected?.id === contact.id
                    ? "bg-background border-r-2 border-r-foreground"
                    : "hover:bg-background/60"
                )}
              >
                <div className="w-11 h-11 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {initials(contact.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm truncate">{contact.name}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(contact.time)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{contact.lastMessage}</p>
                </div>
                {contact.unread > 0 && (
                  <div className="w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0">
                    {contact.unread}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Zone de chat ── */}
      {!selected ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground bg-muted/5">
          <div className="p-5 rounded-2xl bg-muted">
            <MessageSquare className="w-10 h-10" />
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">Sélectionnez une conversation</p>
            <p className="text-sm mt-1">ou recherchez un utilisateur pour commencer</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-background">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center gap-3 bg-background">
            <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-xs">
              {initials(selected.name)}
            </div>
            <div>
              <p className="font-bold text-sm">{selected.name}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                {selected.role}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-muted/5">
            {messages.length === 0 && (
              <p className="text-center text-xs text-muted-foreground mt-10">
                Commencez la conversation...
              </p>
            )}
            {messages.map((msg: any) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[70%] px-5 py-3 rounded-2xl text-sm font-medium shadow-sm",
                    isMe
                      ? "bg-foreground text-background rounded-tr-sm"
                      : "bg-background border border-border rounded-tl-sm"
                  )}>
                    <p>{msg.content}</p>
                    <div className={cn("flex items-center gap-1 mt-1 justify-end", isMe ? "text-background/50" : "text-muted-foreground")}>
                      <span className="text-[9px] font-bold">{formatTime(msg.createdAt)}</span>
                      {isMe && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-5 border-t border-border bg-background">
            <form onSubmit={handleSend} className="flex gap-3">
              <Input
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 rounded-xl h-12 border-border focus:ring-1 focus:ring-foreground transition-all"
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={sending || !newMsg.trim()}
                className="h-12 w-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
