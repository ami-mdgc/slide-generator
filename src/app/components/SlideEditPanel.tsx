import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Edit3, Sparkles, Plus, Trash2, Wand2 } from "lucide-react";
import { AIAssistant } from "./AIAssistant";
import { TextToSlides } from "./TextToSlides";
import { Slide } from "../utils/markdown-parser";
import { SlideDefinition } from "../data/slide-structures";

interface SlideEditPanelProps {
  currentSlideContent: string;
  onSlideUpdate: (newContent: string) => void;
  slideIndex: number;
  onAddSlide?: () => void;
  onDeleteSlide?: () => void;
  onSlidesGenerate?: (slides: Slide[]) => void;
  slideStructure?: SlideDefinition[];
  totalSlides: number;
}

type PanelView = "generate" | "ai" | "edit";

export function SlideEditPanel({
  currentSlideContent,
  onSlideUpdate,
  slideIndex,
  onAddSlide,
  onDeleteSlide,
  onSlidesGenerate,
  slideStructure = [],
  totalSlides
}: SlideEditPanelProps) {
  const [panelView, setPanelView] = useState<PanelView>("generate");
  const [editContent, setEditContent] = useState(currentSlideContent);

  useEffect(() => {
    setEditContent(currentSlideContent);
  }, [currentSlideContent, slideIndex]);

  const handleSave = () => {
    onSlideUpdate(editContent);
  };

  return (
    <Card className="flex flex-col h-full">
      {/* Tabs */}
      <div className="border-b px-4 py-2 flex flex-col gap-2 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Button
            variant={panelView === "generate" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPanelView("generate")}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            原稿から生成
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
            variant={panelView === "edit" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setPanelView("edit");
              setEditContent(currentSlideContent);
            }}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            直接編集
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {onAddSlide && (
            <Button variant="outline" size="sm" onClick={onAddSlide} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              追加
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

      {panelView === "generate" && onSlidesGenerate && (
        <div className="flex-1 overflow-hidden">
          <TextToSlides slideStructure={slideStructure} onGenerate={onSlidesGenerate} />
        </div>
      )}

      {panelView === "ai" && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b flex-shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">AI修正アシスタント</span>
            </div>
            <p className="text-xs text-muted-foreground">スライド {slideIndex + 1} を編集中</p>
          </div>
          <div className="flex-1 overflow-hidden">
            <AIAssistant
              currentSlideContent={currentSlideContent}
              onSlideUpdate={onSlideUpdate}
            />
          </div>
        </div>
      )}

      {panelView === "edit" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex items-center justify-between flex-shrink-0">
            <div>
              <p className="font-medium text-sm">スライド {slideIndex + 1}</p>
              <p className="text-xs text-muted-foreground">マークダウン形式で編集</p>
            </div>
            <Button size="sm" onClick={handleSave}>保存</Button>
          </div>
          <div className="flex-1 overflow-hidden px-4 pb-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="h-full font-mono text-sm"
              placeholder="# タイトル&#10;&#10;- 箇条書き1&#10;- 箇条書き2"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
