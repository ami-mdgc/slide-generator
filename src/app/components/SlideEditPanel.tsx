import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Plus, Trash2, Upload, FileText, Eye, Pencil } from "lucide-react";
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
  bulkText: string;
  onBulkTextChange: (text: string) => void;
}

type EditMode = "individual" | "bulk";
type BulkView = "preview" | "edit";

/** マークダウンをHTMLにレンダリング（スライド区切り対応） */
function renderMarkdown(md: string): string {
  const slides = md.split(/\n---\n|\n---$/).filter(Boolean);
  return slides.map((slide, i) => {
    const lines = slide.trim().split("\n");
    const html = lines.map(line => {
      if (/^# /.test(line))  return `<h1>${line.slice(2)}</h1>`;
      if (/^## /.test(line)) return `<h2>${line.slice(3)}</h2>`;
      if (/^- /.test(line))  return `<li>${line.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`;
      if (line.trim() === "") return "";
      return `<p>${line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`;
    }).join("");
    return `<div class="slide-block" data-slide="${i + 1}">${html}</div>`;
  }).join('<div class="slide-sep"></div>');
}

export function SlideEditPanel({
  currentSlide,
  allSlides,
  onSlideUpdate,
  onBulkUpdate,
  slideIndex,
  totalSlides,
  onAddSlide,
  onDeleteSlide,
  bulkText,
  onBulkTextChange,
}: SlideEditPanelProps) {
  const [mode, setMode] = useState<EditMode>("bulk");
  const [bulkView, setBulkView] = useState<BulkView>("preview");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
      onBulkTextChange(body);
      setBulkView("preview");
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  const handleBulkApply = () => onBulkUpdate(bulkText);

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

      {/* ── 個別編集 ── */}
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
              <Plus className="h-4 w-4 mr-1" />追加
            </Button>
            <Button
              variant="outline" size="sm" onClick={onDeleteSlide}
              disabled={totalSlides <= 1} className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-1" />削除
            </Button>
          </div>
        </>
      )}

      {/* ── 一括入力 ── */}
      {mode === "bulk" && (
        <>
          <input ref={fileInputRef} type="file" accept=".md" className="hidden" onChange={handleFileInput} />

          {!bulkText ? (
            /* ドロップゾーン */
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
            /* 読み込み後 */
            <>
              {/* サブヘッダー */}
              <div className="px-3 py-2 border-b shrink-0 flex items-center justify-between gap-2">
                {/* プレビュー / 編集 トグル */}
                <div className="flex gap-0.5 bg-muted rounded-md p-0.5">
                  <button
                    onClick={() => setBulkView("preview")}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors ${
                      bulkView === "preview"
                        ? "bg-background shadow-sm font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Eye className="h-3 w-3" />プレビュー
                  </button>
                  <button
                    onClick={() => setBulkView("edit")}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors ${
                      bulkView === "edit"
                        ? "bg-background shadow-sm font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Pencil className="h-3 w-3" />編集
                  </button>
                </div>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  onClick={() => onBulkTextChange("")}
                >
                  ファイルを変更
                </button>
              </div>

              {/* プレビュー */}
              {bulkView === "preview" && (
                <div
                  className="flex-1 overflow-y-auto px-4 py-3 text-sm"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(bulkText) }}
                  style={{
                    // スライドブロックのスタイルをインラインで定義
                    ["--slide-block" as string]: "block",
                  }}
                />
              )}

              {/* 編集 */}
              {bulkView === "edit" && (
                <textarea
                  value={bulkText}
                  onChange={(e) => onBulkTextChange(e.target.value)}
                  className="flex-1 w-full px-4 py-3 font-mono text-sm bg-transparent resize-none focus:outline-none leading-relaxed"
                  spellCheck={false}
                />
              )}

              <div className="border-t px-4 py-3 shrink-0">
                <Button onClick={handleBulkApply} className="w-full" size="sm">
                  適用
                </Button>
              </div>
            </>
          )}
        </>
      )}

      {/* プレビュー用スタイル */}
      <style>{`
        .slide-block { padding: 12px 0; }
        .slide-block h1 { font-size: 15px; font-weight: 700; margin-bottom: 6px; color: #18181b; }
        .slide-block h2 { font-size: 12px; font-weight: 600; margin: 8px 0 4px; color: #52525b; text-transform: uppercase; letter-spacing: 0.05em; }
        .slide-block p { font-size: 12px; color: #3f3f46; margin-bottom: 2px; line-height: 1.5; }
        .slide-block li { font-size: 12px; color: #3f3f46; margin-left: 12px; list-style: disc; line-height: 1.5; }
        .slide-block strong { font-weight: 600; color: #18181b; }
        .slide-sep { border-top: 1px dashed #e4e4e7; margin: 4px 0; position: relative; }
        .slide-sep::before { content: "---"; position: absolute; top: -9px; left: 50%; transform: translateX(-50%); background: white; padding: 0 6px; font-size: 10px; color: #a1a1aa; font-family: monospace; }
      `}</style>
    </Card>
  );
}
