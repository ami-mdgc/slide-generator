import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { Slide } from "../utils/markdown-parser";

interface SlideEditPanelProps {
  currentSlide: Slide;
  onSlideUpdate: (newContent: string) => void;
  slideIndex: number;
  totalSlides: number;
  onAddSlide: () => void;
  onDeleteSlide: () => void;
}

export function SlideEditPanel({
  currentSlide,
  onSlideUpdate,
  slideIndex,
  totalSlides,
  onAddSlide,
  onDeleteSlide,
}: SlideEditPanelProps) {
  const [editContent, setEditContent] = useState(currentSlide.content);

  useEffect(() => {
    setEditContent(currentSlide.content);
  }, [currentSlide.id, currentSlide.content]);

  const handleSave = () => {
    onSlideUpdate(editContent);
  };

  const isDirty = editContent !== currentSlide.content;

  return (
    <Card className="flex flex-col h-full">
      <div className="border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <p className="font-medium text-sm">スライド {slideIndex + 1} を編集</p>
          {currentSlide.title && (
            <p className="text-xs text-muted-foreground">{currentSlide.title}</p>
          )}
        </div>
        <Button size="sm" onClick={handleSave} disabled={!isDirty}>
          保存
        </Button>
      </div>

      <div className="flex-1 overflow-hidden px-4 py-3">
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="h-full font-mono text-sm resize-none"
          placeholder={`# タイトル\n\n- 箇条書き1\n- 箇条書き2\n\n**重要な数値**`}
        />
      </div>

      <div className="border-t px-4 py-3 flex gap-2 shrink-0">
        <Button variant="outline" size="sm" onClick={onAddSlide} className="flex-1">
          <Plus className="h-4 w-4 mr-1" />
          スライド追加
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

      <div className="px-4 pb-3 shrink-0">
        <p className="text-xs text-muted-foreground font-medium mb-1">マークダウン記法：</p>
        <p className="text-xs text-muted-foreground"># 大見出し　## 中見出し　- 箇条書き　**太字**</p>
      </div>
    </Card>
  );
}
