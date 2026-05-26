import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Slide } from "../utils/markdown-parser";
import { SlideFormEditor } from "./SlideFormEditor";

interface SlideEditPanelProps {
  currentSlide: Slide;
  allSlides: Slide[];
  onSlideUpdate: (newContent: string) => void;
  onBulkUpdate: (markdown: string) => void;
  slideIndex: number;
  totalSlides: number;
  onAddSlide: () => void;
  onDeleteSlide: () => void;
}

type EditMode = "individual" | "bulk";

export function SlideEditPanel({
  currentSlide,
  allSlides,
  onSlideUpdate,
  onBulkUpdate,
  slideIndex,
  totalSlides,
  onAddSlide,
  onDeleteSlide,
}: SlideEditPanelProps) {
  const [mode, setMode] = useState<EditMode>("individual");
  const [bulkText, setBulkText] = useState("");

  // allSlidesが変わったとき、一括入力の内容を同期
  useEffect(() => {
    if (mode === "bulk") {
      setBulkText(allSlides.map((s) => s.content).join("\n\n---\n\n"));
    }
  }, [mode, allSlides]);

  const handleBulkApply = () => {
    onBulkUpdate(bulkText);
  };

  return (
    <Card className="flex flex-col h-full">
      {/* Tab Header */}
      <div className="border-b px-4 py-2 flex gap-1 shrink-0">
        <button
          onClick={() => setMode("individual")}
          className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
            mode === "individual"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          個別編集
        </button>
        <button
          onClick={() => setMode("bulk")}
          className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
            mode === "bulk"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          一括入力
        </button>
      </div>

      {mode === "individual" && (
        <>
          <div className="border-b px-4 py-2 shrink-0">
            <p className="text-sm font-medium">スライド {slideIndex + 1}</p>
            {currentSlide.title && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{currentSlide.title}</p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <SlideFormEditor
              key={currentSlide.id}
              slide={currentSlide}
              onUpdate={onSlideUpdate}
            />
          </div>
          <div className="border-t px-4 py-3 flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={onAddSlide} className="flex-1">
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeleteSlide}
              disabled={totalSlides <= 1}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              削除
            </Button>
          </div>
        </>
      )}

      {mode === "bulk" && (
        <>
          <div className="px-4 py-2 border-b shrink-0">
            <p className="text-xs text-muted-foreground">
              全ページのマークダウンを <code className="bg-muted px-1 rounded">---</code> で区切って入力。「適用」で全スライドを更新します。
            </p>
          </div>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="flex-1 w-full px-4 py-3 font-mono text-xs bg-transparent resize-none focus:outline-none"
            placeholder={`# スライド1のタイトル\n\n内容...\n\n---\n\n# スライド2のタイトル\n\n内容...`}
            spellCheck={false}
          />
          <div className="border-t px-4 py-3 shrink-0">
            <Button onClick={handleBulkApply} className="w-full" size="sm">
              適用
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
