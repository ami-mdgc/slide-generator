import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Bot, User, Sparkles, KeyRound } from "lucide-react";
import { cn } from "./ui/utils";
import { editSlideWithAI, getApiKey } from "../services/gemini";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  currentSlideContent: string;
  onSlideUpdate: (newContent: string) => void;
}

export function AIAssistant({ currentSlideContent, onSlideUpdate }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "スライドの修正をお手伝いします。\n例：「タイトルをもっと目立たせて」「箇条書きを3つに絞って」「数値を強調して」",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!getApiKey()) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: input,
        },
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "APIキーが設定されていません。ヘッダーの「APIキー」ボタンから設定してください。",
        },
      ]);
      setInput("");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const updated = await editSlideWithAI(currentSlideContent, input);
      onSlideUpdate(updated);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "更新しました。他に修正はありますか？",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `エラーが発生しました: ${err instanceof Error ? err.message : "不明なエラー"}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasKey = !!getApiKey();

  return (
    <div className="flex flex-col h-full">
      {!hasKey && (
        <div className="mx-4 mt-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-md">
          <KeyRound className="h-4 w-4 shrink-0" />
          ヘッダーの「APIキー」ボタンからGemini APIキーを設定してください
        </div>
      )}

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
          >
            {message.role === "assistant" && (
              <div className="rounded-full bg-primary/10 p-2 h-fit shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "rounded-lg px-4 py-2 max-w-[80%] text-sm whitespace-pre-wrap",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {message.content}
            </div>
            {message.role === "user" && (
              <div className="rounded-full bg-secondary p-2 h-fit shrink-0">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="rounded-full bg-primary/10 p-2 h-fit">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="rounded-lg px-4 py-2 bg-muted text-sm">修正中...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 shrink-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="修正内容を入力..."
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          例：タイトルを大きく / 箇条書きを3つに / 数値を強調
        </p>
      </div>
    </div>
  );
}
