import { useState, useEffect, useCallback } from "react";
import { SlideViewer } from "./components/SlideViewer";
import { SlideThumbnails } from "./components/SlideThumbnails";
import { SlideEditPanel } from "./components/SlideEditPanel";
import { DesignSystemSettings } from "./components/DesignSystemSettings";
import { HomeScreen } from "./components/HomeScreen";
import { Slide, parseMarkdownToSlides } from "./utils/markdown-parser";
import { DesignSystem, DEFAULT_DESIGN_SYSTEMS } from "./types/design-system";
import { Project, loadProjects, saveProject, deleteProject } from "./types/project";
import { SLIDE_STRUCTURES, BUSINESS_COLORS } from "./data/slide-structures";
import { Button } from "./components/ui/button";
import { Download, ChevronLeft, Presentation, Loader2, FileDown } from "lucide-react";
import { PDFExportLayer } from "./components/PDFExportLayer";

type AppPhase = "home" | "editor";

const SLIDE_TYPES = Object.keys(SLIDE_STRUCTURES);
const BUSINESS_TYPES = Object.keys(BUSINESS_COLORS);

function buildDesignSystem(base: DesignSystem, businessType: string): DesignSystem {
  const colors = BUSINESS_COLORS[businessType];
  if (!colors) return base;
  return { ...base, colors: { ...base.colors, primary: colors.primary, accent: colors.accent } };
}

function createNewProject(slideType: string, businessType: string): Project {
  const structure = SLIDE_STRUCTURES[slideType];
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月`;

  const makeCover = (i: number): Slide => ({
    id: `slide-${i}`,
    content: `# 無題のプレゼンテーション\n\n${slideType}\n\n${dateStr}`,
    title: "表紙",
    templateId: "templateCover",
    slideType,
  });

  const slides: Slide[] =
    structure && structure.slides.length > 0
      ? structure.slides.map((def, i) => ({
          id: `slide-${i}`,
          content:
            def.templateId === "templateCover"
              ? `# 無題のプレゼンテーション\n\n${slideType}\n\n${dateStr}`
              : def.templateId === "template07"
              ? `# 事業数字の推移\n\n事業売上: ¥37,249,030\n前月参考: ¥35,182,400\n事業粗利: ¥9,310,000\n前月参考: ¥8,420,000\n獲得金額: ¥13,500,000\n前月参考: ¥11,800,000\n\n## 先々月（3月）\n事業売上: ¥35,182,400\n事業粗利: ¥8,420,000\n獲得金額: ¥11,800,000\n\n## 先月（4月）\n事業売上: ¥37,249,030\n事業粗利: ¥9,310,000\n獲得金額: ¥13,500,000\n\n## 当月目標（5月）\n事業売上: ¥41,000,000\n事業粗利: ¥10,500,000\n獲得金額: ¥15,200,000`
              : def.templateId === "template06"
              ? `# 月次KPIグラフ\n\n## 先々月（3月）\n事業売上: ¥35,182,400\n事業粗利: ¥8,420,000\n獲得金額: ¥11,800,000\n\n## 先月（4月）\n事業売上: ¥37,249,030\n事業粗利: ¥9,310,000\n獲得金額: ¥13,500,000\n\n## 当月目標（5月）\n事業売上: ¥41,000,000\n事業粗利: ¥10,500,000\n獲得金額: ¥15,200,000`
              : `# ${def.name}\n\n内容を入力してください`,
          title: def.name,
          templateId: def.templateId,
          slideType,
        }))
      : [makeCover(0), { id: "slide-1", content: "# 新しいスライド\n\n内容を入力してください", title: "新しいスライド" }];

  const now = new Date().toISOString();
  return {
    id: `project-${Date.now()}`,
    name: "無題のプレゼンテーション",
    slideType,
    businessType,
    slides,
    createdAt: now,
    updatedAt: now,
  };
}

export default function App() {
  const [phase, setPhase] = useState<AppPhase>("home");
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [designSystem, setDesignSystem] = useState<DesignSystem>(() => {
    const saved = localStorage.getItem("designSystem");
    return saved ? JSON.parse(saved) : DEFAULT_DESIGN_SYSTEMS[0];
  });

  useEffect(() => {
    localStorage.setItem("designSystem", JSON.stringify(designSystem));
  }, [designSystem]);

  // Auto-save project when it changes
  useEffect(() => {
    if (currentProject) {
      saveProject(currentProject);
      setProjects(loadProjects());
    }
  }, [currentProject]);

  const handleNew = () => {
    const project = createNewProject("月次総会", BUSINESS_TYPES[0]);
    setCurrentProject(project);
    setDesignSystem(buildDesignSystem(DEFAULT_DESIGN_SYSTEMS[0], project.businessType));
    setCurrentSlideIndex(0);
    setPhase("editor");
  };

  const handleOpen = (project: Project) => {
    setCurrentProject(project);
    setDesignSystem(buildDesignSystem(DEFAULT_DESIGN_SYSTEMS[0], project.businessType));
    setCurrentSlideIndex(0);
    setPhase("editor");
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setProjects(loadProjects());
  };

  const handleBack = () => {
    setProjects(loadProjects());
    setPhase("home");
  };

  const updateProject = useCallback((patch: Partial<Project>) => {
    setCurrentProject((prev) => {
      if (!prev) return prev;
      return { ...prev, ...patch, updatedAt: new Date().toISOString() };
    });
  }, []);

  const handleNameChange = (name: string) => {
    // 表紙スライドのタイトルも連動して更新
    const slides = currentProject?.slides.map((slide) => {
      if (slide.templateId === "templateCover") {
        const updated = slide.content.replace(/^#\s+.+$/m, `# ${name}`);
        return { ...slide, content: updated };
      }
      return slide;
    });
    updateProject({ name, ...(slides ? { slides } : {}) });
  };

  const handleSlideTypeChange = (slideType: string) => {
    updateProject({ slideType });
  };

  const handleBusinessTypeChange = (businessType: string) => {
    updateProject({ businessType });
    setDesignSystem(buildDesignSystem(designSystem, businessType));
  };

  const handleSlideUpdate = (newContent: string) => {
    if (!currentProject) return;
    const slides = [...currentProject.slides];
    const titleMatch = newContent.match(/^#\s+(.+)$/m);
    slides[currentSlideIndex] = {
      ...slides[currentSlideIndex],
      content: newContent,
      title: titleMatch ? titleMatch[1] : slides[currentSlideIndex].title,
    };
    updateProject({ slides });
  };

  const handleAddSlide = () => {
    if (!currentProject) return;
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      content: "# 新しいスライド\n\n内容を入力してください",
      title: "新しいスライド",
    };
    const slides = [...currentProject.slides];
    slides.splice(currentSlideIndex + 1, 0, newSlide);
    updateProject({ slides });
    setCurrentSlideIndex(currentSlideIndex + 1);
  };

  const handleDeleteSlide = () => {
    if (!currentProject || currentProject.slides.length <= 1) return;
    const slides = currentProject.slides.filter((_, i) => i !== currentSlideIndex);
    updateProject({ slides });
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
  };

  const handleBulkUpdate = useCallback((markdown: string) => {
    if (!currentProject) return;
    const parsed = parseMarkdownToSlides(markdown);
    if (parsed.length === 0) return;
    const slides: Slide[] = parsed.map((slide, i) => ({
      ...slide,
      id: currentProject.slides[i]?.id || slide.id,
      templateId: currentProject.slides[i]?.templateId || slide.templateId,
    }));
    updateProject({ slides });
    setCurrentSlideIndex(0);
  }, [currentProject, updateProject]);

  const handleExport = () => {
    if (!currentProject || isExporting) return;
    setIsExporting(true);
  };

  // Home
  if (phase === "home") {
    return (
      <HomeScreen
        projects={projects}
        onNew={handleNew}
        onOpen={handleOpen}
        onDelete={handleDelete}
      />
    );
  }

  // Editor
  if (!currentProject) return null;

  return (
    <div className="size-full flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-2 flex items-center gap-3 bg-card shrink-0">
        {/* Logo mark */}
        <div className="w-7 h-7 rounded-md bg-[#1A1A1A] flex items-center justify-center shrink-0">
          <Presentation className="h-4 w-4 text-white" />
        </div>
        <div className="w-px h-5 bg-border shrink-0" />
        {/* Back */}
        <button
          onClick={handleBack}
          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Title input - Google Slides style */}
        <input
          type="text"
          value={currentProject.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="text-base font-semibold bg-transparent border-none outline-none focus:bg-muted/50 rounded px-2 py-1 min-w-0 w-56 transition-colors"
          placeholder="無題のプレゼンテーション"
        />

        {/* Slide type dropdown */}
        <select
          value={currentProject.slideType}
          onChange={(e) => handleSlideTypeChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          {SLIDE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Business type dropdown */}
        <select
          value={currentProject.businessType}
          onChange={(e) => handleBusinessTypeChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <span className="text-xs text-muted-foreground ml-1">{currentProject.slides.length}枚</span>

        <div className="ml-auto flex items-center gap-2">
          <DesignSystemSettings
            currentDesignSystem={designSystem}
            onDesignSystemChange={setDesignSystem}
          />
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? "書き出し中..." : "PDFエクスポート"}
          </Button>
        </div>
      </div>

      {/* Main 3-column */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-52 border-r p-3 shrink-0">
          <SlideThumbnails
            slides={currentProject.slides}
            currentSlideIndex={currentSlideIndex}
            onSlideSelect={setCurrentSlideIndex}
          />
        </div>

        <div className="flex-1 p-6 min-w-0">
          <SlideViewer
            slides={currentProject.slides}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={setCurrentSlideIndex}
            designSystem={designSystem}
          />
        </div>

        <div className="w-88 border-l p-4 shrink-0" style={{ width: "22rem" }}>
          <SlideEditPanel
            currentSlide={currentProject.slides[currentSlideIndex]}
            allSlides={currentProject.slides}
            onSlideUpdate={handleSlideUpdate}
            onBulkUpdate={handleBulkUpdate}
            slideIndex={currentSlideIndex}
            totalSlides={currentProject.slides.length}
            onAddSlide={handleAddSlide}
            onDeleteSlide={handleDeleteSlide}
          />
        </div>
      </div>

      {/* PDF export layer */}
      {isExporting && (
        <>
          {/* Loading overlay — covers the slide being captured (z-index: 10) */}
          <div
            style={{ zIndex: 50 }}
            className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center gap-4"
          >
            <div className="bg-card rounded-xl px-8 py-6 flex flex-col items-center gap-3 shadow-2xl">
              <FileDown className="h-8 w-8 text-primary animate-bounce" />
              <p className="text-base font-semibold">PDFを生成中...</p>
              <p className="text-sm text-muted-foreground">
                {currentProject.slides.length}枚のスライドを書き出しています
              </p>
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </div>
          <PDFExportLayer
            slides={currentProject.slides}
            projectName={currentProject.name}
            designSystem={designSystem}
            onDone={() => setIsExporting(false)}
            onError={(err) => {
              console.error("PDF export error:", err);
              setIsExporting(false);
            }}
          />
        </>
      )}
    </div>
  );
}
