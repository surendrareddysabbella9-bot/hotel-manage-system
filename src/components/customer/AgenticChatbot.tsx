import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, X, Send, Bot, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/constants";

interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

export function AgenticChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", content: "Hi! I'm your AI waiter. What would you like to eat today? E.g., 'Get me 2 Butter Chickens and a Sprite!'" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await apiFetch("/ai/chat-order", {
        method: "POST",
        body: JSON.stringify({ message: userMessage })
      });

      setMessages(prev => [...prev, { role: "bot", content: response.reply }]);

      if (response.itemsToAdd && response.itemsToAdd.length > 0) {
        response.itemsToAdd.forEach((item: any) => {
          addToCart({
            id: item.id,
            menuItemId: item.menuItemId,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl
          });
        });

        // Small delay to let user read the message before redirecting
        setTimeout(() => {
          setIsOpen(false);
          navigate(ROUTES.customer.cart);
        }, 2000);
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "bot", content: "Sorry, I had trouble understanding that. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 size-14 rounded-full shadow-2xl z-50 animate-bounce"
      >
        <MessageSquare className="size-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 sm:w-96 shadow-2xl z-50 flex flex-col h-[500px] border-primary/20">
      <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between rounded-t-xl">
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="size-5" />
          AI Waiter
        </CardTitle>
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80 size-6" onClick={() => setIsOpen(false)}>
          <X className="size-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/10">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "bot" && (
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="size-4 text-primary" />
              </div>
            )}
            <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${
              msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card border rounded-bl-none shadow-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="size-4 text-primary" />
            </div>
            <div className="p-3 rounded-2xl bg-card border rounded-bl-none shadow-sm flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="p-3 bg-background border-t">
        <form 
          className="flex w-full gap-2" 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <Input 
            placeholder="Type your order..." 
            value={input} 
            onChange={e => setInput(e.target.value)}
            disabled={isTyping}
            className="rounded-full"
          />
          <Button type="submit" size="icon" disabled={isTyping || !input.trim()} className="rounded-full shrink-0">
            <Send className="size-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
