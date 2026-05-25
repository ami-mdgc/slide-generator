import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "./ui/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
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
      content: "こんにちは！スライドの修正をお手伝いします。例えば「タイトルをもっと目立たせて」「箇条書きを3つに減らして」などと指示してください。",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const processCommand = (command: string): string => {
    let modifiedContent = currentSlideContent;
    const lowerCommand = command.toLowerCase();

    // タイトル強調
    if (lowerCommand.includes("タイトル") && (lowerCommand.includes("目立たせ") || lowerCommand.includes("大きく"))) {
      modifiedContent = modifiedContent.replace(/^##\s+(.+)$/m, "# $1");
      modifiedContent = modifiedContent.replace(/^###\s+(.+)$/m, "## $1");
      return modifiedContent;
    }

    // 箇条書きを減らす
    const reduceMatch = lowerCommand.match(/箇条書き.*?(\d+)/);
    if (reduceMatch) {
      const targetCount = parseInt(reduceMatch[1]);
      const lines = modifiedContent.split('\n');
      const listItems = lines.filter(line => line.startsWith('- ') || line.startsWith('* '));

      if (listItems.length > targetCount) {
        const itemsToKeep = listItems.slice(0, targetCount);
        const otherLines = lines.filter(line => !line.startsWith('- ') && !line.startsWith('* '));

        // 箇条書きの位置を保持して再構築
        let result: string[] = [];
        let listInserted = false;

        for (const line of lines) {
          if ((line.startsWith('- ') || line.startsWith('* ')) && !listInserted) {
            result.push(...itemsToKeep);
            listInserted = true;
          } else if (!line.startsWith('- ') && !line.startsWith('* ')) {
            result.push(line);
          }
        }

        return result.join('\n');
      }
    }

    // 文字を太字に
    if (lowerCommand.includes("太字") || lowerCommand.includes("強調")) {
      const match = command.match(/「(.+?)」/);
      if (match) {
        const textToEmbolden = match[1];
        modifiedContent = modifiedContent.replace(
          new RegExp(textToEmbolden, 'g'),
          `**${textToEmbolden}**`
        );
        return modifiedContent;
      }
    }

    // 箇条書きを追加
    if (lowerCommand.includes("箇条書き") && lowerCommand.includes("追加")) {
      const match = command.match(/「(.+?)」/);
      if (match) {
        const newItem = match[1];
        const lines = modifiedContent.split('\n');

        // 最後の箇条書きの後に追加
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].startsWith('- ') || lines[i].startsWith('* ')) {
            lines.splice(i + 1, 0, `- ${newItem}`);
            break;
          }
        }

        return lines.join('\n');
      }
    }

    // デフォルト: そのまま返す
    return modifiedContent;
  };

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const updatedContent = processCommand(input);
      const hasChanged = updatedContent !== currentSlideContent;

      if (hasChanged) {
        onSlideUpdate(updatedContent);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: hasChanged
          ? "スライドを更新しました！他に修正したい箇所はありますか？"
          : "申し訳ありません。その指示は認識できませんでした。もう少し具体的に教えていただけますか？例: 「タイトルを大きく」「箇条書きを3つに減らして」",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="rounded-full bg-primary/10 p-2 h-fit">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}

              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[80%]",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.role === "user" && (
                <div className="rounded-full bg-secondary p-2 h-fit">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex gap-3 justify-start">
              <div className="rounded-full bg-primary/10 p-2 h-fit">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <p className="text-sm">処理中...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t p-4 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="スライドの修正内容を入力..."
            disabled={isProcessing}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          <p>例: タイトルを大きく / 箇条書きを3つに減らして / 「重要」を太字に</p>
        </div>
      </div>
    </div>
  );
}
