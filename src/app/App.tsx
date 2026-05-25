import { useState, useEffect } from "react";
import { SlideViewer } from "./components/SlideViewer";
import { SlideThumbnails } from "./components/SlideThumbnails";
import { SlideEditPanel } from "./components/SlideEditPanel";
import { DesignSystemSettings } from "./components/DesignSystemSettings";
import { FigmaSync } from "./components/FigmaSync";
import { ManualDesignSystemImport } from "./components/ManualDesignSystemImport";
import { parseMarkdownToSlides, Slide } from "./utils/markdown-parser";
import { DesignSystem, DEFAULT_DESIGN_SYSTEMS } from "./types/design-system";
import { Button } from "./components/ui/button";
import { ApiKeySettings } from "./components/ApiKeySettings";
import { Download, FileText, Trash2 } from "lucide-react";

export default function App() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "slide-0",
      content: "# 新しいスライド\n\n内容を入力してください",
      title: "新しいスライド",
    }
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [filename, setFilename] = useState<string>("presentation.md");
  const [slideType, setSlideType] = useState<string>("通常");
  const [businessType, setBusinessType] = useState<string>("デフォルト");
  const [designSystem, setDesignSystem] = useState<DesignSystem>(() => {
    const saved = localStorage.getItem("designSystem");
    return saved ? JSON.parse(saved) : DEFAULT_DESIGN_SYSTEMS[0];
  });

  // Save design system to localStorage
  useEffect(() => {
    localStorage.setItem("designSystem", JSON.stringify(designSystem));
  }, [designSystem]);

  // Handle business type change - update design system colors
  const handleBusinessTypeChange = (newBusinessType: string) => {
    setBusinessType(newBusinessType);

    const businessColorSchemes: Record<string, Partial<DesignSystem>> = {
      "デフォルト": DEFAULT_DESIGN_SYSTEMS[0],
      "事業A": {
        ...designSystem,
        colors: {
          ...designSystem.colors,
          primary: "#1e40af",
          accent: "#3b82f6",
        }
      },
      "事業B": {
        ...designSystem,
        colors: {
          ...designSystem.colors,
          primary: "#7c3aed",
          accent: "#a78bfa",
        }
      },
      "事業C": {
        ...designSystem,
        colors: {
          ...designSystem.colors,
          primary: "#059669",
          accent: "#10b981",
        }
      },
    };

    const newDesignSystem = businessColorSchemes[newBusinessType];
    if (newDesignSystem) {
      setDesignSystem(newDesignSystem as DesignSystem);
    }
  };

  // Handle slide type change - update slide template IDs
  const handleSlideTypeChange = (newSlideType: string) => {
    setSlideType(newSlideType);

    if (newSlideType === '月次総会') {
      const templateIds = ['template01', 'template02', 'template03', 'template04', 'template05'];
      const updatedSlides = slides.map((slide, index) => ({
        ...slide,
        templateId: templateIds[index] || undefined,
        slideType: '月次総会',
      }));
      setSlides(updatedSlides);
    } else {
      // Remove template IDs for non-template slide types
      const updatedSlides = slides.map(slide => ({
        ...slide,
        templateId: undefined,
        slideType: undefined,
      }));
      setSlides(updatedSlides);
    }
  };

  const handleSlidesGenerate = (newSlides: Slide[]) => {
    setSlides(newSlides);
    setCurrentSlideIndex(0);
  };

  const handleFileLoad = (content: string, name: string) => {
    const parsedSlides = parseMarkdownToSlides(content);
    setSlides(parsedSlides);
    setFilename(name);
    setCurrentSlideIndex(0);

    // Extract slideType from frontmatter if present
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const slideTypeMatch = frontmatter.match(/slideType:\s*(.+)$/m);
      if (slideTypeMatch) {
        setSlideType(slideTypeMatch[1].trim());
      }
    }
  };

  const handleSlideUpdate = (newContent: string) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      content: newContent,
    };
    setSlides(updatedSlides);
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      content: "# 新しいスライド\n\n内容を入力してください",
      title: "新しいスライド",
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const handleDeleteSlide = () => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, index) => index !== currentSlideIndex);
      setSlides(newSlides);
      setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    }
  };

  const handleReset = () => {
    setSlides([
      {
        id: "slide-0",
        content: "# 新しいスライド\n\n内容を入力してください",
        title: "新しいスライド",
      }
    ]);
    setFilename("presentation.md");
    setCurrentSlideIndex(0);
  };

  const handleExport = () => {
    // Add frontmatter if slideType is set
    let frontmatter = '';
    if (slideType !== '通常') {
      frontmatter = `---\nslideType: ${slideType}\ndate: ${new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}\n---\n\n`;
    }

    const markdown = frontmatter + slides.map(slide => slide.content).join('\n\n---\n\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\.(md|txt)$/, '_edited.md');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="size-full flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <FileText className="h-5 w-5 text-primary" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="px-3 py-1.5 text-base font-semibold border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="プレゼンテーション名"
              />
              <select
                value={slideType}
                onChange={(e) => handleSlideTypeChange(e.target.value)}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="通常">通常</option>
                <option value="月次総会">月次総会</option>
                <option value="四半期報告">四半期報告</option>
                <option value="年次報告">年次報告</option>
              </select>
              <select
                value={businessType}
                onChange={(e) => handleBusinessTypeChange(e.target.value)}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="デフォルト">デフォルト</option>
                <option value="事業A">事業A</option>
                <option value="事業B">事業B</option>
                <option value="事業C">事業C</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              {slides.length}枚のスライド
            </p>
          </div>
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
          <Button variant="outline" size="sm" onClick={handleReset}>
            <Trash2 className="h-4 w-4 mr-2" />
            新規作成
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Thumbnails */}
        <div className="w-64 border-r p-4">
          <SlideThumbnails
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            onSlideSelect={setCurrentSlideIndex}
          />
        </div>

        {/* Slide Viewer */}
        <div className="flex-1 p-6">
          <SlideViewer
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={setCurrentSlideIndex}
            designSystem={designSystem}
          />
        </div>

        {/* Edit Panel */}
        <div className="w-96 border-l p-4">
          <SlideEditPanel
            currentSlideContent={slides[currentSlideIndex]?.content || ""}
            onSlideUpdate={handleSlideUpdate}
            slideIndex={currentSlideIndex}
            onAddSlide={handleAddSlide}
            onDeleteSlide={handleDeleteSlide}
            onSlidesGenerate={handleSlidesGenerate}
            totalSlides={slides.length}
          />
        </div>
      </div>
    </div>
  );
}