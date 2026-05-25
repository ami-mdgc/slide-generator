import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Sparkles, KeyRound, FileText } from "lucide-react";
import {
  generateSlidesWithStructure,
  generateSlidesFromText,
  getApiKey,
} from "../services/gemini";
import { Slide } from "../utils/markdown-parser";
import { SlideDefinition } from "../data/slide-structures";

interface TextToSlidesProps {
  slideStructure: SlideDefinition[]; // 空配列 = 通常（自由生成）
  onGenerate: (slides: Slide[]) => void;
}

export function TextToSlides({ slideStructure, onGenerate }: TextToSlidesProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const hasKey = !!getApiKey();
  const isStructured = slideStructure.length > 0;

  const handleGenerate = async () => {
    if (!text.trim() || isLoading) return;
    setError("");
    setIsLoading(true);

    try {
      let slides: Slide[];

      if (isStructured) {
        // 型に当てはめて生成
        const results = await generateSlidesWithStructure(text, slideStructure);
        slides = results.map((r) => {
          const def = slideStructure[r.slideIndex];
          return {
            id: `slide-${Date.now()}-${r.slideIndex}`,
            content: r.content,
            title: def?.name ?? `スライド${r.slideIndex + 1}`,
            templateId: def?.templateId,
          };
        });
      } else {
        // 自由生成
        const results = await generateSlidesFromText(text);
        slides = results.map((r, i) => ({
          id: `slide-${Date.now()}-${i}`,
          content: r.content,
          title: r.title,
        }));
      }

      onGenerate(slides);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <div className="rounded-full bg-amber-100 p-4">
          <KeyRound className="h-8 w-8 text-amber-600" />
        </div>
        <div>
          <p className="font-medium mb-1">APIキーが必要です</p>
          <p className="text-sm text-muted-foreground">
            ヘッダーの「APIキー」ボタンから設定してください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      {isStructured && (
        <div className="bg-muted/50 rounded-lg px-3 py-2 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            生成先の構成（{slideStructure.length}枚）
          </p>
          {slideStructure.map((s, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              {i + 1}. {s.name}
            </p>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        原稿・メモ・箇条書きをそのまま貼り付けてください
      </p>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          isStructured
            ? `4月の売上は前年比125%、新規顧客50社獲得。\n主な要因は大手A社との契約と既存顧客のアップセル。\n5月の目標は売上130%、新規60社。\n施策はカスタマーサクセス強化とウェビナー開催。`
            : `プレゼンの内容を自由に貼り付けてください。\nAIがスライド構成を自動で決定します。`
        }
        className="flex-1 resize-none text-sm"
      />

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      <Button onClick={handleGenerate} disabled={!text.trim() || isLoading} className="w-full">
        {isLoading ? (
          <>
            <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
            生成中...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4 mr-2" />
            スライドを生成
          </>
        )}
      </Button>
    </div>
  );
}
