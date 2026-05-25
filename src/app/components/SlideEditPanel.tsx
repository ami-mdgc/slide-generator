import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Edit3, Sparkles, Plus, Trash2, Upload } from "lucide-react";
import { AIAssistant } from "./AIAssistant";
import { MarkdownInput } from "./MarkdownInput";

interface SlideEditPanelProps {
  currentSlideContent: string;
  onSlideUpdate: (newContent: string) => void;
  slideIndex: number;
  onAddSlide?: () => void;
  onDeleteSlide?: () => void;
  onLoadMarkdown?: (content: string, filename: string) => void;
  totalSlides: number;
}

type PanelView = "edit" | "ai" | "import";

export function SlideEditPanel({
  currentSlideContent,
  onSlideUpdate,
  slideIndex,
  onAddSlide,
  onDeleteSlide,
  onLoadMarkdown,
  totalSlides
}: SlideEditPanelProps) {
  const [panelView, setPanelView] = useState<PanelView>("ai");
  const [editContent, setEditContent] = useState(currentSlideContent);

  // Sync editContent when slide changes
  useEffect(() => {
    setEditContent(currentSlideContent);
  }, [currentSlideContent, slideIndex]);

  const handleSave = () => {
    onSlideUpdate(editContent);
  };

  return (
    <Card className="flex flex-col h-full">
      {/* Tab Buttons */}
      <div className="border-b px-4 py-2 flex flex-col gap-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant={panelView === "edit" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setPanelView("edit");
              setEditContent(currentSlideContent);
            }}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            編集
          </Button>
          <Button
            variant={panelView === "ai" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPanelView("ai")}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI修正
          </Button>
          <Button
            variant={panelView === "import" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPanelView("import")}
          >
            <Upload className="h-4 w-4 mr-2" />
            一括入力
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {onAddSlide && (
            <Button variant="outline" size="sm" onClick={onAddSlide} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              スライド追加
            </Button>
          )}
          {onDeleteSlide && totalSlides > 1 && (
            <Button variant="outline" size="sm" onClick={onDeleteSlide} className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </Button>
          )}
        </div>
      </div>

      {panelView === "edit" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h3>スライド {slideIndex + 1} を編集</h3>
              <Button size="sm" onClick={handleSave}>
                保存
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              マークダウン形式で入力してください
            </p>
          </div>
          <div className="flex-1 overflow-hidden px-4 pb-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="h-full font-mono text-sm"
              placeholder="# スライドタイトル

内容を入力...

- 箇条書き1
- 箇条書き2"
            />
          </div>
          <div className="border-t p-4 flex-shrink-0">
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">使い方:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>**太字**、*イタリック*、# 見出し、- リストなどが使えます</li>
                <li>編集後は「保存」ボタンをクリック</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {panelView === "ai" && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3>AI修正アシスタント</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              スライド {slideIndex + 1} を編集中
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            <AIAssistant
              currentSlideContent={currentSlideContent}
              onSlideUpdate={onSlideUpdate}
            />
          </div>
        </div>
      )}

      {panelView === "import" && onLoadMarkdown && (
        <div className="flex-1 overflow-hidden p-4">
          <MarkdownInput onMarkdownSubmit={onLoadMarkdown} />
        </div>
      )}
    </Card>
  );
}
