import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Plus, Trash2, Upload, FileText } from "lucide-react";
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
  const [mode, setMode] = useState<EditMode>("bulk");
  const [bulkText, setBulkText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
      setBulkText(body);
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  const handleBulkApply = () => {
    onBulkUpdate(bulkText);
  };

  return (
    <Card className="flex flex-col h-full">
      {/* Tab Header */}
      <div className="border-b px-4 py-2 flex gap-1 shrink-0">
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
          <input ref={fileInputRef} type="file" accept=".md" className="hidden" onChange={handleFileInput} />

          {!bulkText ? (
            /* ── ドロップゾーン ── */
            <div
              className={`flex-1 flex flex-col items-center justify-center gap-4 m-4 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground pointer-events-none">
                <Upload className="h-8 w-8" />
                <p className="text-sm font-medium">クリックまたはドラッグ&ドロップ</p>
                <p className="text-xs">.md ファイルを読み込む</p>
              </div>
            </div>
          ) : (
            /* ── 読み込み後：テキスト編集 ── */
            <>
              <div className="px-4 py-2 border-b shrink-0 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span><code className="bg-muted px-1 rounded">---</code> で区切って編集 → 適用</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2 shrink-0" onClick={() => setBulkText("")}>
                  ファイルを変更
                </Button>
              </div>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="flex-1 w-full px-4 py-3 font-mono text-xs bg-transparent resize-none focus:outline-none"
                spellCheck={false}
              />
              <div className="border-t px-4 py-3 shrink-0">
                <Button onClick={handleBulkApply} className="w-full" size="sm">
                  適用
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </Card>
  );
}
