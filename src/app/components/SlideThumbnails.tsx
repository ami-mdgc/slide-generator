import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Slide } from "../utils/markdown-parser";
import { cn } from "./ui/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SlideThumbnailsProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
}

interface SlideGroup {
  name: string;
  color: string;
  slides: { slide: Slide; globalIndex: number }[];
}

function buildGroups(slides: Slide[]): SlideGroup[] {
  const groups: SlideGroup[] = [];
  slides.forEach((slide, index) => {
    if (slide.templateId === "templateCover" || groups.length === 0) {
      groups.push({
        name: slide.title || `事業 ${groups.length + 1}`,
        color: slide.colors?.primary || "#1A1A1A",
        slides: [{ slide, globalIndex: index }],
      });
    } else {
      groups[groups.length - 1].slides.push({ slide, globalIndex: index });
    }
  });
  return groups;
}

export function SlideThumbnails({ slides, currentSlideIndex, onSlideSelect }: SlideThumbnailsProps) {
  const groups = buildGroups(slides);
  const isMultiBusiness = groups.length > 1;

  // collapsed state: Set of group indices that are collapsed
  const [collapsed, setCollapsed] = useState<Set<number>>(() => new Set());

  // auto-expand the group that contains the current slide
  useEffect(() => {
    if (!isMultiBusiness) return;
    const groupIdx = groups.findIndex(g =>
      g.slides.some(s => s.globalIndex === currentSlideIndex)
    );
    if (groupIdx >= 0) {
      setCollapsed(prev => {
        if (!prev.has(groupIdx)) return prev;
        const next = new Set(prev);
        next.delete(groupIdx);
        return next;
      });
    }
  }, [currentSlideIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleGroup = (idx: number) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="border-b px-4 py-3 shrink-0">
        <h3>スライド一覧</h3>
        <p className="text-xs text-muted-foreground mt-1">全{slides.length}枚</p>
      </div>

      <div className="flex-1 overflow-auto">
        {isMultiBusiness ? (
          /* ── 事業ごとにグループ表示 ── */
          groups.map((group, gIdx) => {
            const isCollapsed = collapsed.has(gIdx);
            const hasActive = group.slides.some(s => s.globalIndex === currentSlideIndex);

            return (
              <div key={gIdx} className="border-b last:border-b-0">
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(gIdx)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                    hasActive && "bg-muted/30"
                  )}
                >
                  {/* Color bar */}
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  <span className="flex-1 text-xs font-semibold truncate">{group.name}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {group.slides.length}枚
                  </span>
                  {isCollapsed
                    ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  }
                </button>

                {/* Slide list */}
                {!isCollapsed && (
                  <div className="px-2 pb-2 space-y-1">
                    {group.slides.map(({ slide, globalIndex }) => (
                      <button
                        key={slide.id}
                        onClick={() => onSlideSelect(globalIndex)}
                        className={cn(
                          "w-full text-left rounded-md border px-2.5 py-2 transition-all hover:border-primary/50",
                          currentSlideIndex === globalIndex
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] tabular-nums",
                            currentSlideIndex === globalIndex
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {globalIndex + 1}
                          </span>
                          <p className="text-xs line-clamp-1 break-words flex-1 min-w-0">
                            {slide.title}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* ── フラットリスト（旧形式互換） ── */
          <div className="p-3 space-y-2">
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
                  <p className="text-sm line-clamp-2 break-words flex-1 min-w-0">
                    {slide.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
