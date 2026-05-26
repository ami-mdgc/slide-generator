import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Slide } from "../utils/markdown-parser";
import { SlideFormEditor } from "./SlideFormEditor";

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
  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3 shrink-0">
        <p className="text-sm font-medium">スライド {slideIndex + 1}</p>
        {currentSlide.title && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{currentSlide.title}</p>
        )}
      </div>

      {/* Form area */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <SlideFormEditor
          key={currentSlide.id}
          slide={currentSlide}
          onUpdate={onSlideUpdate}
        />
      </div>

      {/* Footer */}
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
    </Card>
  );
}
