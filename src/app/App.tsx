import { useState, useEffect } from "react";
import { SlideViewer } from "./components/SlideViewer";
import { SlideThumbnails } from "./components/SlideThumbnails";
import { SlideEditPanel } from "./components/SlideEditPanel";
import { DesignSystemSettings } from "./components/DesignSystemSettings";
import { FigmaSync } from "./components/FigmaSync";
import { ManualDesignSystemImport } from "./components/ManualDesignSystemImport";
import { ApiKeySettings } from "./components/ApiKeySettings";
import { ProjectSetup, ProjectConfig } from "./components/ProjectSetup";
import { Slide } from "./utils/markdown-parser";
import { DesignSystem, DEFAULT_DESIGN_SYSTEMS } from "./types/design-system";
import { SLIDE_STRUCTURES, BUSINESS_COLORS } from "./data/slide-structures";
import { Button } from "./components/ui/button";
import { Download, Plus, Trash2 } from "lucide-react";

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

    // カラーテーマを事業タイプに合わせて更新
    const colors = BUSINESS_COLORS[config.businessType];
    if (colors) {
      setDesignSystem((prev) => ({
        ...prev,
        colors: { ...prev.colors, primary: colors.primary, accent: colors.accent },
      }));
    }

    // スライド構成を展開（空スライドで初期化）
    const structure = SLIDE_STRUCTURES[config.slideType];
    if (structure && structure.slides.length > 0) {
      const initialSlides: Slide[] = structure.slides.map((def, i) => ({
        id: `slide-${i}`,
        content: `# ${def.name}`,
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

  const handleSlidesGenerate = (newSlides: Slide[]) => {
    setSlides(newSlides);
    setCurrentSlideIndex(0);
  };

  const handleSlideUpdate = (newContent: string) => {
    setSlides((prev) => {
      const updated = [...prev];
      updated[currentSlideIndex] = { ...updated[currentSlideIndex], content: newContent };
      return updated;
    });
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      content: "# 新しいスライド\n\n内容を入力してください",
      title: "新しいスライド",
    };
    setSlides((prev) => [...prev, newSlide]);
    setCurrentSlideIndex(slides.length);
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

  const slideStructure =
    projectConfig ? (SLIDE_STRUCTURES[projectConfig.slideType]?.slides ?? []) : [];

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
          <ApiKeySettings />
          <FigmaSync onDesignSystemSync={setDesignSystem} />
          <ManualDesignSystemImport onImport={setDesignSystem} />
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
        {/* Thumbnails */}
        <div className="w-56 border-r p-3 shrink-0">
          <SlideThumbnails
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            onSlideSelect={setCurrentSlideIndex}
          />
        </div>

        {/* Viewer */}
        <div className="flex-1 p-6 min-w-0">
          <SlideViewer
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={setCurrentSlideIndex}
            designSystem={designSystem}
          />
        </div>

        {/* Edit Panel */}
        <div className="w-96 border-l p-4 shrink-0">
          <SlideEditPanel
            currentSlideContent={slides[currentSlideIndex]?.content || ""}
            onSlideUpdate={handleSlideUpdate}
            slideIndex={currentSlideIndex}
            onAddSlide={handleAddSlide}
            onDeleteSlide={handleDeleteSlide}
            onSlidesGenerate={handleSlidesGenerate}
            slideStructure={slideStructure}
            totalSlides={slides.length}
          />
        </div>
      </div>
    </div>
  );
}
