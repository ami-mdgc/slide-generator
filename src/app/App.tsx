import { useState, useEffect } from "react";
import { SlideViewer } from "./components/SlideViewer";
import { SlideThumbnails } from "./components/SlideThumbnails";
import { SlideEditPanel } from "./components/SlideEditPanel";
import { DesignSystemSettings } from "./components/DesignSystemSettings";
import { ProjectSetup, ProjectConfig } from "./components/ProjectSetup";
import { Slide } from "./utils/markdown-parser";
import { DesignSystem, DEFAULT_DESIGN_SYSTEMS } from "./types/design-system";
import { SLIDE_STRUCTURES, BUSINESS_COLORS } from "./data/slide-structures";
import { Button } from "./components/ui/button";
import { Download, Plus } from "lucide-react";

type AppPhase = "setup" | "editor";

export default function App() {
  const [phase, setPhase] = useState<AppPhase>("setup");
  const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [designSystem, setDesignSystem] = useState<DesignSystem>(() => {
    const saved = localStorage.getItem("designSystem");
    return saved ? JSON.parse(saved) : DEFAULT_DESIGN_SYSTEMS[0];
  });

  useEffect(() => {
    localStorage.setItem("designSystem", JSON.stringify(designSystem));
  }, [designSystem]);

  const handleSetupComplete = (config: ProjectConfig) => {
    setProjectConfig(config);

    const colors = BUSINESS_COLORS[config.businessType];
    if (colors) {
      setDesignSystem((prev) => ({
        ...prev,
        colors: { ...prev.colors, primary: colors.primary, accent: colors.accent },
      }));
    }

    const structure = SLIDE_STRUCTURES[config.slideType];
    if (structure && structure.slides.length > 0) {
      const initialSlides: Slide[] = structure.slides.map((def, i) => ({
        id: `slide-${i}`,
        content: `# ${def.name}\n\n内容を入力してください`,
        title: def.name,
        templateId: def.templateId,
        slideType: config.slideType,
      }));
      setSlides(initialSlides);
    } else {
      setSlides([
        {
          id: "slide-0",
          content: "# 新しいスライド\n\n内容を入力してください",
          title: "新しいスライド",
        },
      ]);
    }

    setCurrentSlideIndex(0);
    setPhase("editor");
  };

  const handleSlideUpdate = (newContent: string) => {
    setSlides((prev) => {
      const updated = [...prev];
      const titleMatch = newContent.match(/^#\s+(.+)$/m);
      updated[currentSlideIndex] = {
        ...updated[currentSlideIndex],
        content: newContent,
        title: titleMatch ? titleMatch[1] : updated[currentSlideIndex].title,
      };
      return updated;
    });
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      content: "# 新しいスライド\n\n内容を入力してください",
      title: "新しいスライド",
    };
    setSlides((prev) => {
      const updated = [...prev];
      updated.splice(currentSlideIndex + 1, 0, newSlide);
      return updated;
    });
    setCurrentSlideIndex(currentSlideIndex + 1);
  };

  const handleDeleteSlide = () => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== currentSlideIndex));
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const handleExport = () => {
    const markdown = slides.map((s) => s.content).join("\n\n---\n\n");
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectConfig?.name || "presentation"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (phase === "setup") {
    return <ProjectSetup onComplete={handleSetupComplete} />;
  }

  return (
    <div className="size-full flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-3 flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-base">{projectConfig?.name}</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {projectConfig?.slideType}
          </span>
          <span className="text-xs text-muted-foreground">{slides.length}枚</span>
        </div>

        <div className="flex items-center gap-2">
          <DesignSystemSettings
            currentDesignSystem={designSystem}
            onDesignSystemChange={setDesignSystem}
          />
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPhase("setup")}>
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 border-r p-3 shrink-0">
          <SlideThumbnails
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            onSlideSelect={setCurrentSlideIndex}
          />
        </div>

        <div className="flex-1 p-6 min-w-0">
          <SlideViewer
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={setCurrentSlideIndex}
            designSystem={designSystem}
          />
        </div>

        <div className="w-96 border-l p-4 shrink-0">
          <SlideEditPanel
            currentSlide={slides[currentSlideIndex]}
            onSlideUpdate={handleSlideUpdate}
            slideIndex={currentSlideIndex}
            totalSlides={slides.length}
            onAddSlide={handleAddSlide}
            onDeleteSlide={handleDeleteSlide}
          />
        </div>
      </div>
    </div>
  );
}
