import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Send, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type ToolName = "ClassCouncilAI" | "ReportCardAI" | "QuizMaster";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OnboardingChatbotProps {
  toolName: ToolName;
}

const WELCOME_MESSAGES: Record<ToolName, string> = {
  ClassCouncilAI:
    "👋 Bonjour ! Je suis votre assistant pour ClassCouncil AI. Je vous guide pas à pas pour préparer vos conseils de classe. Commencez par importer votre bulletin PRONOTE en PDF. Besoin d'aide ?",
  ReportCardAI:
    "👋 Bonjour ! Je suis votre assistant pour ReportCardAI. Cet outil génère vos appréciations individuelles en 4 étapes simples. Commencez par l'étape 1 : importez votre PDF PRONOTE ou saisissez vos élèves manuellement. Une question ?",
  QuizMaster:
    "👋 Bonjour ! Je suis votre assistant pour QuizMaster. Créez des quiz XML compatibles PRONOTE en quelques minutes. Par où souhaitez-vous commencer ?",
};

const QUICK_CHIPS: Record<ToolName, string[]> = {
  ClassCouncilAI: [
    "Comment importer un PDF ?",
    "Format PRONOTE requis ?",
    "Exporter les appréciations",
    "Données RGPD ?",
  ],
  ReportCardAI: [
    "Étape 1 : Import PDF",
    "Changer le ton des appréciations",
    "Limite de caractères",
    "Données RGPD ?",
  ],
  QuizMaster: [
    "Créer un quiz QCM",
    "Format XML PRONOTE",
    "Types de questions disponibles",
    "Données RGPD ?",
  ],
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/onboarding-chat`;

const OnboardingChatbot = ({ toolName }: OnboardingChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleOpen = () => {
    setIsOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      setMessages([{ role: "assistant", content: WELCOME_MESSAGES[toolName] }]);
    }
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleClose = () => setIsOpen(false);

  const resetConversation = () => {
    setMessages([{ role: "assistant", content: WELCOME_MESSAGES[toolName] }]);
    setInput("");
    setIsTyping(false);
  };

  const streamResponse = async (allMessages: Message[]) => {
    setIsTyping(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages.slice(-10), toolName }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error("stream failed");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let streamDone = false;

      // Add empty assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantText += content;
              const text = assistantText;
              setMessages((prev) =>
                prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: text } : m))
              );
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, je rencontre un problème technique. Réessayez dans un instant.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    await streamResponse(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const showChips = messages.length === 1 && messages[0].role === "assistant";

  return (
    <>
      {/* Chat Panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[380px] h-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 border border-slate-200 dark:border-slate-700",
          "bg-white dark:bg-slate-900",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
            : "opacity-0 translate-y-4 pointer-events-none scale-95"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1a2332]">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#f0a830]" />
            <span className="text-white text-sm font-semibold">
              Assistant <span className="text-[#f0a830]">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetConversation}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              title="Nouvelle conversation"
            >
              <RotateCcw className="w-4 h-4 text-white/70" />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-[#7dd3e8] text-slate-900 rounded-br-sm"
                    : "bg-white dark:bg-slate-800 border-l-[3px] border-[#1a2332] dark:border-[#f0a830] text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Quick chips */}
          {showChips && (
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_CHIPS[toolName].map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  className="px-3 py-1.5 text-xs rounded-full bg-[#1a2332] text-white border border-transparent hover:border-[#f0a830] transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border-l-[3px] border-[#1a2332] dark:border-[#f0a830] px-4 py-2.5 rounded-xl rounded-bl-sm shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-slate-200 dark:border-slate-700">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#f0a830]/50 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2 rounded-lg bg-[#f0a830] text-white hover:bg-[#d9962a] disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Floating Button */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#f0a830] text-white shadow-lg hover:bg-[#d9962a] transition-all duration-300 flex items-center justify-center hover:scale-105",
          isOpen && "rotate-90"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>
    </>
  );
};

export default OnboardingChatbot;
