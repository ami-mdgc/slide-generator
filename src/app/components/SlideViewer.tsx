import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { Slide } from "../utils/markdown-parser";
import { DesignSystem } from "../types/design-system";
import { TEMPLATE_REGISTRY } from "../types/slide-template";
import { parseTemplateData } from "../utils/template-parser";
import { BUSINESS_COLORS } from "../data/slide-structures";
import { cn } from "./ui/utils";

interface SlideViewerProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  designSystem: DesignSystem;
}

export function SlideViewer({ slides, currentSlideIndex, onSlideChange, designSystem }: SlideViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const currentSlide = slides[currentSlideIndex];
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await fullscreenRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Use spacing from design system if available
  const padding = designSystem.spacing
    ? `${designSystem.spacing.slideTop || 48}px ${designSystem.spacing.slideRight || 48}px ${designSystem.spacing.slideBottom || 48}px ${designSystem.spacing.slideLeft || 48}px`
    : {
        compact: "32px",
        normal: "48px",
        spacious: "64px",
      }[designSystem.layout.contentPadding];

  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[designSystem.layout.titleAlignment];

  // Calculate scale based on container size (ResizeObserver で列幅変更にも追従)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const scaleX = el.offsetWidth / 1920;
      const scaleY = el.offsetHeight / 1080;
      setScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isFullscreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && currentSlideIndex < slides.length - 1) {
        onSlideChange(currentSlideIndex + 1);
      } else if (e.key === "ArrowLeft" && currentSlideIndex > 0) {
        onSlideChange(currentSlideIndex - 1);
      } else if (e.key === "f") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlideIndex, slides.length, onSlideChange, isFullscreen]);

  if (!currentSlide) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">スライドがありません</p>
      </div>
    );
  }

  // Check if slide has a template
  const hasTemplate = currentSlide.templateId && TEMPLATE_REGISTRY[currentSlide.templateId];

  const renderTemplateSlide = () => {
    if (!currentSlide.templateId || !TEMPLATE_REGISTRY[currentSlide.templateId]) {
      return null;
    }

    const template = TEMPLATE_REGISTRY[currentSlide.templateId];
    const TemplateComponent = template.component;

    if (!TemplateComponent) {
      return null;
    }

    // Parse markdown content to template data (slide-level colors take priority)
    const storedColors = currentSlide.colors ?? { accent: designSystem.colors.accent, primary: designSystem.colors.primary };
    const matchingBiz = Object.values(BUSINESS_COLORS).find(c => c.primary === storedColors.primary && c.accent === storedColors.accent);
    const colors = { ...storedColors, acquisitionColor: (storedColors as any).acquisitionColor ?? matchingBiz?.acquisitionColor };
    const data = parseTemplateData(
      currentSlide.templateId,
      currentSlide,
      currentSlide.content,
      colors
    );

    return <TemplateComponent data={data} />;
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Headings
      if (line.startsWith('# ')) {
        return (
          <h1
            key={index}
            className="mb-6"
            style={{
              color: designSystem.colors.primary,
              fontFamily: designSystem.fonts.heading,
              fontSize: designSystem.typography?.h1Size ? `${designSystem.typography.h1Size}px` : undefined,
              fontWeight: designSystem.typography?.h1Weight || undefined,
              lineHeight: designSystem.typography?.lineHeight || undefined,
            }}
          >
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2
            key={index}
            className="mb-4"
            style={{
              color: designSystem.colors.primary,
              fontFamily: designSystem.fonts.heading,
              fontSize: designSystem.typography?.h2Size ? `${designSystem.typography.h2Size}px` : undefined,
              fontWeight: designSystem.typography?.h2Weight || undefined,
              lineHeight: designSystem.typography?.lineHeight || undefined,
            }}
          >
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3
            key={index}
            className="mb-3"
            style={{
              color: designSystem.colors.secondary,
              fontFamily: designSystem.fonts.heading,
              fontSize: designSystem.typography?.h3Size ? `${designSystem.typography.h3Size}px` : undefined,
              fontWeight: designSystem.typography?.h3Weight || undefined,
              lineHeight: designSystem.typography?.lineHeight || undefined,
            }}
          >
            {line.substring(4)}
          </h3>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h4
            key={index}
            className="mb-2"
            style={{
              color: designSystem.colors.secondary,
              fontFamily: designSystem.fonts.heading,
              fontSize: designSystem.typography?.bodySize ? `${designSystem.typography.bodySize}px` : undefined,
              lineHeight: designSystem.typography?.lineHeight || undefined,
            }}
          >
            {line.substring(5)}
          </h4>
        );
      }

      // Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li
            key={index}
            className="ml-6 list-disc"
            style={{
              marginBottom: designSystem.spacing?.listItemGap ? `${designSystem.spacing.listItemGap}px` : '8px',
              fontSize: designSystem.typography?.bodySize ? `${designSystem.typography.bodySize}px` : undefined,
              lineHeight: designSystem.typography?.lineHeight || undefined,
            }}
          >
            {formatInlineText(line.substring(2))}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <li
            key={index}
            className="ml-6 list-decimal"
            style={{
              marginBottom: designSystem.spacing?.listItemGap ? `${designSystem.spacing.listItemGap}px` : '8px',
              fontSize: designSystem.typography?.bodySize ? `${designSystem.typography.bodySize}px` : undefined,
              lineHeight: designSystem.typography?.lineHeight || undefined,
            }}
          >
            {formatInlineText(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }

      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-4" />;
      }

      // Regular paragraphs
      return (
        <p
          key={index}
          className="mb-4"
          style={{
            fontSize: designSystem.typography?.bodySize ? `${designSystem.typography.bodySize}px` : undefined,
            lineHeight: designSystem.typography?.lineHeight || undefined,
          }}
        >
          {formatInlineText(line)}
        </p>
      );
    });
  };

  const formatInlineText = (text: string) => {
    // Bold with accent color
    text = text.replace(
      /\*\*(.+?)\*\*/g,
      `<strong style="color: ${designSystem.colors.accent}">$1</strong>`
    );
    text = text.replace(
      /__(.+?)__/g,
      `<strong style="color: ${designSystem.colors.accent}">$1</strong>`
    );

    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.+?)_/g, '<em>$1</em>');

    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  const navBar = (
    <div className="border-t bg-muted/30 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSlideChange(currentSlideIndex - 1)}
        disabled={currentSlideIndex === 0}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        前へ
      </Button>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {currentSlideIndex + 1} / {slides.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onSlideChange(currentSlideIndex + 1)}
        disabled={currentSlideIndex === slides.length - 1}
      >
        次へ
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );

  return (
    <div
      ref={fullscreenRef}
      className={cn(
        "h-full flex flex-col",
        isFullscreen ? "bg-black" : "bg-muted/20"
      )}
    >
      {/* Slide area */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 min-h-0"
      >
        <div
          className={cn("relative", isFullscreen ? "" : "rounded-lg border shadow-lg")}
          style={{ width: 1920 * scale, height: 1080 * scale }}
        >
          {/* Scaled slide content — 1920×1080 */}
          <div
            className="absolute top-0 left-0"
            style={{
              width: 1920,
              height: 1080,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              backgroundColor: hasTemplate ? '#ffffff' : designSystem.colors.background,
              color: designSystem.colors.text,
              fontFamily: designSystem.fonts.body,
            }}
          >
            {hasTemplate ? (
              <div className="size-full overflow-hidden">
                {renderTemplateSlide()}
              </div>
            ) : (
              <div className="size-full overflow-auto" style={{ padding }}>
                <div
                  className={cn("max-w-4xl mx-auto", alignmentClass)}
                  style={{ gap: designSystem.spacing?.contentGap ? `${designSystem.spacing.contentGap}px` : undefined }}
                >
                  {renderContent(currentSlide.content)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nav bar — always below slide */}
      {navBar}
    </div>
  );
}
