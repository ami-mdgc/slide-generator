import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Sparkles, KeyRound, FileText } from "lucide-react";
import { generateSlidesFromText, getApiKey } from "../services/gemini";
import { Slide } from "../utils/markdown-parser";

interface TextToSlidesProps {
  onGenerate: (slides: Slide[]) => void;
}

const SLIDE_TYPES = ["通常", "月次総会", "四半期報告", "年次報告", "提案資料", "報告書"];

export function TextToSlides({ onGenerate }: TextToSlidesProps) {
  const [text, setText] = useState("");
  const [slideType, setSlideType] = useState("通常");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const hasKey = !!getApiKey();

  const handleGenerate = async () => {
    if (!text.trim() || isLoading) return;
    setError("");
    setIsLoading(true);

    try {
      const generated = await generateSlidesFromText(text, slideType);
      const slides: Slide[] = generated.map((s, i) => ({
        id: `slide-${Date.now()}-${i}`,
        content: s.content,
        title: s.title,
      }));
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
            ヘッダーの「APIキー」ボタンからGemini APIキーを設定してください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">
          原稿・メモ・箇条書きをそのまま貼り付けてください。AIがスライド構成に変換します。
        </p>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium shrink-0">スライドタイプ</label>
        <select
          value={slideType}
          onChange={(e) => setSlideType(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {SLIDE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`例：\n4月の売上は前年比125%で、新規顧客は50社獲得できた。\n主な要因は大手A社との契約と既存顧客のアップセル。\n5月の目標は売上130%、新規60社。\n施策はカスタマーサクセス強化とウェビナー開催。`}
        className="flex-1 resize-none text-sm"
      />

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      <Button
        onClick={handleGenerate}
        disabled={!text.trim() || isLoading}
        className="w-full"
      >
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
