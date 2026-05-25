import { Card } from "./ui/card";
import { Slide } from "../utils/markdown-parser";
import { cn } from "./ui/utils";

interface SlideThumbnailsProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
}

export function SlideThumbnails({ slides, currentSlideIndex, onSlideSelect }: SlideThumbnailsProps) {
  return (
    <Card className="h-full flex flex-col">
      <div className="border-b px-4 py-3">
        <h3>スライド一覧</h3>
        <p className="text-xs text-muted-foreground mt-1">
          全{slides.length}枚
        </p>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => onSlideSelect(index)}
            className={cn(
              "w-full text-left rounded-lg border-2 p-3 transition-all hover:border-primary/50",
              currentSlideIndex === index
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            )}
          >
            <div className="flex items-start gap-2">
              <span className={cn(
                "flex-shrink-0 rounded px-2 py-1 text-xs",
                currentSlideIndex === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-2 break-words">
                  {slide.title}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
